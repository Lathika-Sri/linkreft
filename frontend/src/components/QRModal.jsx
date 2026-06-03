import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, X } from 'lucide-react';

export default function QRModal({ url, shortCode, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && url) {
        QRCode.toCanvas(canvasRef.current, url, {
            width: 260,
            margin: 3,
            errorCorrectionLevel: 'H',
            color: {
              dark: '#000000',   // black dots
              light: '#FFFFFF',  // white background
            },
          });
    }
  }, [url]);

  const download = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `qr-${shortCode}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 340, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>QR Code</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 20, marginBottom: 20, display: 'inline-block', border: '1px solid var(--border)' }}>
          <canvas ref={canvasRef} />
        </div>
        <div className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20, wordBreak: 'break-all' }}>{url}</div>
        <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={download}>
          <Download size={15} /> Download PNG
        </button>
      </div>
    </div>
  );
}