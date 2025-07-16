import React, { useEffect, useState } from "react";
import { getReclamaciones } from "../services/reclamacion-service";

export default function ModalListadoReclamaciones({ open, onClose, token }) {
  const [reclamaciones, setReclamaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && token) {
      setLoading(true);
      getReclamaciones(token)
        .then(data => setReclamaciones(data))
        .catch(() => setReclamaciones([]))
        .finally(() => setLoading(false));
    }
  }, [open, token]);

  if (!open) return null;

  return (
    <div className="custom-modal-overlay active" onClick={e => { if (e.target.className.includes("custom-modal-overlay")) onClose(); }}>
      <div className="custom-modal">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <div className="modal-card">
          <h2 className="modal-title">Mis Reclamaciones</h2>
          {loading ? (
            <p>Cargando reclamaciones...</p>
          ) : reclamaciones.length === 0 ? (
            <p>No tienes reclamaciones registradas.</p>
          ) : (
            <div className="reclamaciones-list">
              {reclamaciones.map(rec => (
                <div key={rec.id} className="reclamacion-card">
                  <div><b>Estado:</b> {rec.estado}</div>
                  <div><b>Detalle:</b> {rec.detalle}</div>
                  <div><b>Fecha:</b> {rec.created_at}</div>
                  {rec.pedido && <div><b>Pedido:</b> #{rec.pedido.numero_pedido}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}