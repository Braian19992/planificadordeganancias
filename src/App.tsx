import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Target } from 'lucide-react';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import ModeloModal from './components/ModeloModal';
import {
  CATEGORIES,
  DEFAULT_LEVEL_BY_CATEGORY,
  DEFAULT_PUNTO_PRICE,
  MODEL_AVERAGE_EARNINGS,
  getLevelDisplayName,
} from './config';
import {
  buildEmprendedorScenario,
  buildEmprendedorPlatinoScenario,
  buildScenario,
  findBestLevelForAmount,
  parseNumericInput,
  formatNumericInput,
  type EarningsResult,
} from './calculations';

const DEFAULT_CAT = 'empr';
const DEFAULT_LEVEL = 'empr_bronce';

function App() {
  const [catKey, setCatKey] = useState(DEFAULT_CAT);
  const [levelKey, setLevelKey] = useState(DEFAULT_LEVEL);
  const [puntoPriceStr, setPuntoPriceStr] = useState(String(DEFAULT_PUNTO_PRICE));
  const [manualObjectiveStr, setManualObjectiveStr] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const puntoPrice = Math.max(1, parseNumericInput(puntoPriceStr) || DEFAULT_PUNTO_PRICE);
  const manualObjective = parseNumericInput(manualObjectiveStr);

  const modelObjective = Math.round(MODEL_AVERAGE_EARNINGS[levelKey] || 0);
  const objective = manualObjective > 0 ? Math.round(manualObjective) : modelObjective;

  // Auto-select level when user types an amount
  useEffect(() => {
    console.log('[AutoSelect] effect fired', { autoMode, manualObjective, currentLevel: levelKey, currentCat: catKey });
    if (!autoMode || manualObjective <= 0) return;
    const best = findBestLevelForAmount(manualObjective);
    console.log('[AutoSelect] findBestLevelForAmount result', { input: manualObjective, best });
    if (best) {
      setCatKey(best.catKey);
      setLevelKey(best.levelKey);
      console.log('[AutoSelect] setting level to', best.levelKey, 'cat to', best.catKey);
    }
  }, [manualObjective, autoMode]);

  const result = useMemo((): EarningsResult => {
    console.log('[Motor] computing result', { levelKey, objective, puntoPrice });
    if (levelKey === 'empr_platino') {
      return buildEmprendedorPlatinoScenario(objective, puntoPrice);
    }
    if (levelKey.startsWith('empr_')) {
      return buildEmprendedorScenario(levelKey, objective, puntoPrice);
    }
    return buildScenario(levelKey, objective, puntoPrice);
  }, [levelKey, objective, puntoPrice]);

  const handleCatChange = useCallback((newCat: string) => {
    setCatKey(newCat);
    setLevelKey(DEFAULT_LEVEL_BY_CATEGORY[newCat] || newCat + '_bronce');
    setAutoMode(false);
  }, []);

  const handleLevelChange = useCallback((key: string) => {
    setLevelKey(key);
    setAutoMode(false);
  }, []);

  const handleObjectiveChange = useCallback((val: string) => {
    setManualObjectiveStr(val);
    setAutoMode(true);
  }, []);

  const handleClearObjective = useCallback(() => {
    setManualObjectiveStr('');
    setAutoMode(true);
  }, []);

  const hasData = manualObjectiveStr !== '' || puntoPriceStr !== String(DEFAULT_PUNTO_PRICE) || catKey !== DEFAULT_CAT || levelKey !== DEFAULT_LEVEL;

  const handleFullReset = useCallback(() => {
    if (hasData && !window.confirm('Queres volver a empezar y borrar los datos actuales?')) return;
    setManualObjectiveStr('');
    setPuntoPriceStr(String(DEFAULT_PUNTO_PRICE));
    setCatKey(DEFAULT_CAT);
    setLevelKey(DEFAULT_LEVEL);
    setAutoMode(true);
  }, [hasData]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('clean') === '1') document.body.classList.add('clean');
    } catch { /* ignore */ }
  }, []);

  const suggestedLevelName = manualObjective > 0 ? getLevelDisplayName(levelKey) : '';

  return (
    <>
      <TopBar onOpenModelo={() => setModalOpen(true)} onReset={handleFullReset} />

      <div className="demo-wrap">
        {/* Hero income input */}
        <div className="hero-input-section">
          <div className="hero-input-inner">
            <div className="hero-input-label">
              <Target size={20} strokeWidth={2.5} />
              <span>Cuanto queres ganar?</span>
            </div>
            <div className="hero-input-row">
              <span className="hero-input-prefix">$</span>
              <input
                ref={heroInputRef}
                className="hero-input"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 3.500.000"
                value={formatNumericInput(manualObjectiveStr)}
                onChange={(e) => handleObjectiveChange(e.target.value)}
              />
              {manualObjectiveStr && (
                <button className="hero-input-clear" onClick={handleClearObjective} title="Limpiar">
                  Limpiar
                </button>
              )}
            </div>
            {suggestedLevelName && (
              <div className="hero-suggested-level">
                Nivel sugerido: <strong>{suggestedLevelName}</strong>
              </div>
            )}
            {!manualObjectiveStr && (
              <div className="hero-hint">
                Ingresa un monto y el simulador selecciona automaticamente el nivel mas adecuado.
              </div>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="demo-top">
          <div className="demo-cats">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`btnBig${cat.key === catKey ? ' active' : ''}`}
                onClick={() => handleCatChange(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="demo-grid">
          <LeftPanel
            catKey={catKey}
            levelKey={levelKey}
            puntoPriceStr={puntoPriceStr}
            onLevelChange={handleLevelChange}
            onPuntoPriceChange={setPuntoPriceStr}
          />
          <CenterPanel
            levelKey={levelKey}
            result={result}
            hasManualObjective={manualObjective > 0}
          />
          <RightPanel catKey={catKey} result={result} />
        </div>
      </div>

      <ModeloModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

export default App;
