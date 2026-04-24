import { formatCurrency } from '../calculations';
import type { EarningsResult } from '../calculations';

interface RightPanelProps {
  catKey: string;
  result: EarningsResult;
}

export default function RightPanel({ catKey, result }: RightPanelProps) {
  const showBonusDetails = catKey === 'ment' || catKey === 'emb';

  return (
    <div className="demo-card">
      <div className="demo-title">Desglose de ganancias</div>
      <div className="break">
        <div className="row">
          <div className="k">Venta personal</div>
          <div className="v">{formatCurrency(result.ventaPersonal)}</div>
        </div>
        <div className="row">
          <div className="k">Equipo directo</div>
          <div className="v">{formatCurrency(result.equipoDirecto)}</div>
        </div>
        <div className="row">
          <div className="k">Bono Conquista</div>
          <div className="v">{formatCurrency(result.bonoConquista)}</div>
        </div>

        {showBonusDetails && (
          <>
            <div className="row">
              <div className="k">
                Bono N1{result.n1 > 0 ? ` (Empresarios N1: ${result.n1})` : ''}
              </div>
              <div className="v bono-stack">
                <div>{formatCurrency(result.bonoN1)}</div>
                <div className="bono-extra-text bono-pts">
                  Puntos N1: {Math.round(result.ptsN1 || 0).toLocaleString('es-AR')} pts
                </div>
                <div className="bono-extra-text bono-pts">
                  Facturacion N1: {formatCurrency(result.facturacionN1 || 0)}
                </div>
                <div className="bono-extra-text">
                  Bono calculado sobre la facturacion de tus Empresarios N1 (primera generacion).
                </div>
              </div>
            </div>

            <div className="row">
              <div className="k">
                Bono N2{result.n2 > 0 ? ` (Empresarios N2: ${result.n2})` : ''}
              </div>
              <div className="v bono-stack">
                <div>{formatCurrency(result.bonoN2)}</div>
                <div className="bono-extra-text bono-pts">
                  Puntos N2: {Math.round(result.ptsN2 || 0).toLocaleString('es-AR')} pts
                </div>
                <div className="bono-extra-text bono-pts">
                  Facturacion N2: {formatCurrency(result.facturacionN2 || 0)}
                </div>
                <div className="bono-extra-text">
                  Bono calculado sobre la facturacion de tus Empresarios N2 (segunda generacion).
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showBonusDetails && (
        <div className="hint" style={{ marginTop: 10 }}>
          En Mentores y Emblemas, el foco esta en liderazgo y bonos N1/N2.
        </div>
      )}
    </div>
  );
}
