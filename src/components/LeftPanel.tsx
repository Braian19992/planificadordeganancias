import { useState, useEffect } from 'react';
import { CATEGORIES, DEFAULT_PUNTO_PRICE } from '../config';
import { formatNumericInput, parseNumericInput } from '../calculations';

interface LeftPanelProps {
  catKey: string;
  levelKey: string;
  puntoPriceStr: string;
  onLevelChange: (key: string) => void;
  onPuntoPriceChange: (val: string) => void;
}

export default function LeftPanel({
  catKey,
  levelKey,
  puntoPriceStr,
  onLevelChange,
  onPuntoPriceChange,
}: LeftPanelProps) {
  const cat = CATEGORIES.find(c => c.key === catKey);
  const [showPriceMsg, setShowPriceMsg] = useState(false);

  const currentPrice = parseNumericInput(puntoPriceStr) || DEFAULT_PUNTO_PRICE;
  const isCustomPrice = currentPrice !== DEFAULT_PUNTO_PRICE;

  useEffect(() => {
    if (isCustomPrice) {
      setShowPriceMsg(true);
      const timer = setTimeout(() => setShowPriceMsg(false), 5000);
      return () => clearTimeout(timer);
    }
    setShowPriceMsg(false);
  }, [isCustomPrice, currentPrice]);

  return (
    <div className="demo-card">
      <div className="demo-title">Nivel</div>
      <div className="demo-levels">
        {cat?.levels.map(([k, label]) => (
          <button
            key={k}
            className={`pill2${k === levelKey ? ' active' : ''}`}
            onClick={() => onLevelChange(k)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="hint" style={{ marginTop: 10 }}>
        Tambien podes elegir un nivel manualmente.
      </div>

      <div className="softbox" style={{ marginTop: 14 }}>
        <label htmlFor="inpPrecioPunto">Precio del punto (editable)</label>
        <input
          id="inpPrecioPunto"
          inputMode="numeric"
          placeholder="Ej: 12.000"
          value={formatNumericInput(puntoPriceStr)}
          onChange={(e) => onPuntoPriceChange(e.target.value)}
        />
        <div className="hint">
          Esto actualiza todos los calculos (venta personal, equipo, bonos, etc.).
        </div>
        {showPriceMsg && (
          <div className="price-change-msg">
            La estructura del negocio se mantiene. Lo que cambia es el resultado economico segun el precio promedio.
          </div>
        )}
      </div>
    </div>
  );
}
