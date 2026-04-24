import { useEffect } from 'react';

interface ModeloModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ModeloModal({ open, onClose }: ModeloModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="box">
        <div className="head">
          <div className="h">Modelo Empresarial Bagués</div>
          <button className="iconBtn" type="button" onClick={onClose}>Cerrar</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16 }}>
          <img src="/7dxGeQ1_-_Imgur.jpg" alt="Modelo Empresarial Bagués" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      </div>
    </div>
  );
}
