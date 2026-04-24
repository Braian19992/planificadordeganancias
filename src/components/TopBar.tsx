import { RotateCcw } from 'lucide-react';

interface TopBarProps {
  onOpenModelo: () => void;
  onReset: () => void;
}

export default function TopBar({ onOpenModelo, onReset }: TopBarProps) {
  return (
    <div className="topbar">
      <div className="topbar-accent" />
      <div className="topbar-inner">
        <div className="brand">
          <img className="logo" src="/logo-bagues.png" alt="Bagués" />
          <div>
            <h1>Planificador de Ganancias</h1>
            <p></p>
          </div>
        </div>
        <div className="demo-docs">
          <button className="btn-reset" onClick={onReset}>
            <RotateCcw size={15} strokeWidth={2.5} />
            Volver a empezar
          </button>
          <button className="iconBtn" onClick={onOpenModelo}>
            Modelo Empresarial
          </button>
        </div>
      </div>
    </div>
  );
}
