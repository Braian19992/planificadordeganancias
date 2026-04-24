import { useRef, useEffect } from 'react';
import { TrendingUp, Users, Network, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { LEVEL_SUBTITLES, LEVEL_ICONS, getLevelDisplayName } from '../config';
import { formatCurrency } from '../calculations';
import type { EarningsResult, TeamStructure } from '../calculations';

interface CenterPanelProps {
  levelKey: string;
  result: EarningsResult;
  hasManualObjective?: boolean;
}

// ---------- Precision helpers ----------

function getPrecision(result: EarningsResult): { label: string; class: string } {
  const obj = result.objetivo;
  if (!obj || obj <= 0) return { label: '', class: '' };
  const pct = Math.abs(result.gananciaTotal - obj) / obj;
  if (pct < 0.03) return { label: 'Alta precision', class: 'precision-high' };
  if (pct < 0.07) return { label: 'Precision media', class: 'precision-med' };
  return { label: 'Referencia estimada', class: 'precision-low' };
}

function isApproximate(result: EarningsResult): boolean {
  const obj = result.objetivo;
  if (!obj || obj <= 0) return false;
  const pct = Math.abs(result.gananciaTotal - obj) / obj;
  return pct < 0.02 && pct > 0.001;
}

function isOvershoot(result: EarningsResult): boolean {
  const obj = result.objetivo;
  if (!obj || obj <= 0) return false;
  return result.gananciaTotal > obj * 1.08;
}

// ---------- Level tier messages ----------

const LEVEL_INSIGHTS: Record<string, string> = {
  empr_bronce: 'Tu ingreso depende principalmente de tu venta personal.',
  empr_plata: 'Tu ingreso depende principalmente de tu venta personal.',
  empr_oro: 'Tu ingreso depende principalmente de tu venta personal.',
  empr_platino: 'Tu primer equipo empieza a generar ingresos adicionales.',
  emp_bronce: 'Tu primera estructura de negocio. Tu crecimiento empieza a depender de tu equipo directo.',
  emp_plata: 'Tu crecimiento empieza a depender de tu equipo directo.',
  emp_oro: 'El desarrollo de tu primer Empresario es clave para escalar al siguiente nivel.',
  ment_plata: 'Tu ingreso ya depende de la estructura y desarrollo de otros lideres.',
  ment_oro: 'Tu ingreso ya depende de la estructura y desarrollo de otros lideres.',
  ment_platino: 'Tu ingreso ya depende de la estructura y desarrollo de otros lideres.',
  ment_diamante: 'Tu ingreso ya depende de la estructura y desarrollo de otros lideres.',
  emb_oro: 'Tu ingreso se apoya principalmente en la profundidad del negocio y los bonos generacionales.',
  emb_platino: 'Tu ingreso se apoya principalmente en la profundidad del negocio y los bonos generacionales.',
  emb_diamante: 'Tu ingreso se apoya principalmente en la profundidad del negocio y los bonos generacionales.',
};

// ---------- Team Structure sub-components ----------

function EmprPlatinoStructure({ est }: { est: TeamStructure }) {
  const total = est.totalEmpr || (est.cant.bronce + est.cant.plata + est.cant.oro + est.cant.platino);
  return (
    <>
      <div className="est-title">Estructura sugerida</div>
      <div className="est-row">{est.cant.plata || 0} Emprendedores Plata</div>
      <div className="est-total">TOTAL: {total} emprendedores</div>
      {est.upgradeSuggest && (
        <div className="est-warn">
          Superaste el maximo de 5 Emprendedores. Sugerencia: crecer a <b>Empresario</b> para alcanzar ese objetivo.
        </div>
      )}
    </>
  );
}

function CompactStructure({ est, result, levelKey }: { est: TeamStructure; result?: EarningsResult; levelKey: string }) {
  const isMentorOrEmblema = levelKey.startsWith('ment_') || levelKey.startsWith('emb_');
  const total = est.totalEmpr || (est.cant.bronce + est.cant.plata + est.cant.oro + est.cant.platino);
  const hasN1N2 = isMentorOrEmblema && result && (result.n1 > 0 || result.n2 > 0);
  return (
    <>
      <div className="est-title">Estructura sugerida</div>
      <div className="est-row">Emprendedores totales: {total}</div>
      {hasN1N2 && (
        <>
          <div className="est-row">Empresarios N1: {result.n1} ({Math.round(result.ptsN1 || 0).toLocaleString('es-AR')} pts)</div>
          <div className="est-row">Empresarios N2: {result.n2} ({Math.round(result.ptsN2 || 0).toLocaleString('es-AR')} pts)</div>
        </>
      )}
      <div className="est-total">TOTAL: {total} emprendedores</div>
    </>
  );
}

function DetailedStructure({ est }: { est: TeamStructure }) {
  const total = est.totalEmpr || (est.cant.bronce + est.cant.plata + est.cant.oro + est.cant.platino);
  return (
    <>
      <div className="est-title">Estructura sugerida</div>
      <div className="est-row">{est.cant.bronce || 0} Emprendedores Bronce</div>
      <div className="est-row">{est.cant.plata || 0} Emprendedores Plata</div>
      <div className="est-row">{est.cant.oro || 0} Emprendedores Oro</div>
      <div className="est-row">{est.cant.platino || 0} Emprendedores Platino</div>
      <div className="est-total">TOTAL: {total} emprendedores</div>
    </>
  );
}

function TeamStructureView({ estructura, levelKey, result }: { estructura: TeamStructure | null; levelKey: string; result?: EarningsResult }) {
  if (levelKey === 'empr_platino') {
    if (estructura && estructura.cant) {
      return <EmprPlatinoStructure est={estructura} />;
    }
    return (
      <>
        <div className="est-title">Estructura sugerida</div>
        <div className="est-row">2 Emprendedores Plata (sugeridos)</div>
        <div className="est-total">TOTAL: 2 emprendedores</div>
      </>
    );
  }

  if (!estructura || !estructura.cant) {
    return <span>Estructura sugerida: <span className="muted2">&mdash;</span></span>;
  }

  const isHigherTier = levelKey.startsWith('emp_') || levelKey.startsWith('ment_') || levelKey.startsWith('emb_');
  if (isHigherTier) {
    return <CompactStructure est={estructura} result={result} levelKey={levelKey} />;
  }
  return <DetailedStructure est={estructura} />;
}

// ---------- Restructured "Como se logra" with 3 sections ----------

function HowItWorks({ result, levelKey }: { result: EarningsResult; levelKey: string }) {
  const isMentorOrEmblema = levelKey.startsWith('ment_') || levelKey.startsWith('emb_');
  const hasTeam = (result.puntosEquipo || 0) > 0 || (result.estructura?.totalEmpr ?? 0) > 0;
  const hasNetwork = isMentorOrEmblema && (result.n1 > 0 || result.n2 > 0);

  return (
    <div className="how-it-works">
      <div className="hiw-section">
        <div className="hiw-header">
          <TrendingUp size={16} strokeWidth={2.5} />
          <span>Tu gestion personal</span>
        </div>
        <div className="hiw-detail">Venta personal: {result.puntosPersonal} pts</div>
      </div>

      {hasTeam && (
        <div className="hiw-section">
          <div className="hiw-header">
            <Users size={16} strokeWidth={2.5} />
            <span>Tu equipo directo</span>
          </div>
          <div className="hiw-detail">Puntos equipo: {result.puntosEquipo || 0} pts</div>
          {(result.estructura?.totalEmpr ?? 0) > 0 && (
            <div className="hiw-detail">Emprendedores: {result.estructura!.totalEmpr}</div>
          )}
        </div>
      )}

      {hasNetwork && (
        <div className="hiw-section">
          <div className="hiw-header">
            <Network size={16} strokeWidth={2.5} />
            <span>Tu red de desarrollo</span>
          </div>
          {result.n1 > 0 && (
            <div className="hiw-detail">Empresarios N1: {result.n1} ({Math.round(result.ptsN1 || 0).toLocaleString('es-AR')} pts)</div>
          )}
          {result.n2 > 0 && (
            <div className="hiw-detail">Empresarios N2: {result.n2} ({Math.round(result.ptsN2 || 0).toLocaleString('es-AR')} pts)</div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Main component ----------

function shouldShowContextualNote(result: EarningsResult, hasManualObjective: boolean): boolean {
  if (!hasManualObjective) return false;
  const obj = result.objetivo;
  if (!obj || obj <= 0) return false;
  const pct = Math.abs(result.gananciaTotal - obj) / obj;
  return pct > 0.03;
}

export default function CenterPanel({
  levelKey,
  result,
  hasManualObjective = false,
}: CenterPanelProps) {
  const totalRef = useRef<HTMLHeadingElement>(null);
  const prevVal = useRef(0);

  const approx = isApproximate(result);
  const displayValue = approx ? result.objetivo : result.gananciaTotal;

  useEffect(() => {
    const el = totalRef.current;
    if (!el) return;
    const start = prevVal.current;
    const end = Math.round(displayValue || 0);
    prevVal.current = end;
    const duration = 600;
    const t0 = performance.now();
    let raf: number;
    function tick(t: number) {
      const progress = Math.min(1, (t - t0) / duration);
      const prefix = approx ? '\u2248 ' : '';
      el!.textContent = prefix + formatCurrency(Math.round(start + (end - start) * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [displayValue, approx]);

  const titulo = getLevelDisplayName(levelKey);
  const icon = LEVEL_ICONS[levelKey] || '';
  const subtitle = LEVEL_SUBTITLES[levelKey] || '';
  const precision = getPrecision(result);
  const isEmprendedor = levelKey.startsWith('empr_');
  const overshoot = isOvershoot(result) && !isEmprendedor;
  const insight = LEVEL_INSIGHTS[levelKey] || '';
  const showN1Suggestion = levelKey === 'emp_plata' && result.n1 === 0;
  const showContextual = shouldShowContextualNote(result, hasManualObjective);

  return (
    <div className="demo-card">
      <div className="demo-title">
        {icon && (
          <img
            src={icon}
            alt=""
            style={{ height: 22, verticalAlign: 'middle', marginRight: 6 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        {titulo}
        {subtitle && <div className="hint" style={{ marginTop: 6 }}>{subtitle}</div>}
      </div>
      <p className="demo-copy"></p>

      <h2 className="demo-total" ref={totalRef}>$0</h2>

      {approx && (
        <div className="approx-detail">
          calculado: {formatCurrency(result.gananciaTotal)}
        </div>
      )}

      {precision.label && (
        <div className={`precision-badge ${precision.class}`}>
          {precision.class === 'precision-high' && <CheckCircle size={13} strokeWidth={2.5} />}
          {precision.class === 'precision-med' && <Info size={13} strokeWidth={2.5} />}
          {precision.class === 'precision-low' && <AlertCircle size={13} strokeWidth={2.5} />}
          {precision.label}
        </div>
      )}

      {overshoot && (
        <div className="overshoot-msg">
          En este nivel, la estructura minima ya genera un ingreso superior al objetivo planteado. Esto indica que estas apuntando a un nivel donde el piso de ingresos es mas alto.
        </div>
      )}

      {insight && (
        <div className="level-insight">{insight}</div>
      )}

      {showN1Suggestion && (
        <div className="n1-suggestion">
          Podes lograr este ingreso sin desarrollar empresarios, pero el siguiente paso para escalar es comenzar a formar tu primer Empresario (N1).
        </div>
      )}

      <div className="softbox" style={{ marginTop: 14 }}>
        <HowItWorks result={result} levelKey={levelKey} />
      </div>

      <div className="softbox" style={{ marginTop: 14, overflow: 'auto', maxHeight: '38vh' }}>
        <TeamStructureView estructura={result.estructura} levelKey={levelKey} result={result} />
      </div>

      <p className="legend-main">
        Este resultado es una referencia basada en promedios reales del modelo Bagues.
        Cada negocio es distinto: podes alcanzar el mismo ingreso priorizando venta personal, desarrollo de equipo o crecimiento de estructura.
        El camino lo definis vos.
      </p>

      {showContextual && (
        <p className="legend-contextual">
          Los valores pueden variar segun la gestion individual de cada negocio.
        </p>
      )}
    </div>
  );
}
