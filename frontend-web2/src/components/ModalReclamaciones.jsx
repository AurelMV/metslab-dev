import React, { useState } from "react";
import { X } from "lucide-react";
import "../stayle/Profile.css"; // O tu CSS de modales
import { createReclamacion } from "../services/reclamacion-service";

export default function ModalReclamaciones({
  open,
  onClose,
  pedidos = [],
  user,
  token
}) {
  const [form, setForm] = useState({
    telefono: user?.phone || "",
    detalle: "",
    idPedido: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await createReclamacion({
        telefono: form.telefono,
        detalle: form.detalle,
        idPedido: form.idPedido || null,
      }, token);
      setSuccess("¡Reclamación enviada correctamente!");
      setForm({ telefono: user?.phone || "", detalle: "", idPedido: "" });
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Error al enviar reclamación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-modal-overlay active" onClick={e => { if (e.target.className.includes("custom-modal-overlay")) onClose(); }}>
      <div className="custom-modal">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <div className="modal-card">
          <h2 className="modal-title">Nueva Reclamación</h2>
          <p className="modal-subtitle">Agrega una reclamación sobre un pedido o consulta general</p>
          <form onSubmit={handleSubmit}>
            <div className="modal-section">
              <h3 className="section-title">Información de la Reclamación</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono (opcional)</label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Ej: +51 999 999 999"
                  />
                </div>
                <div className="form-group">
                  <label>Pedido a reclamar (opcional)</label>
                  <select
                    value={form.idPedido}
                    onChange={e => setForm({ ...form, idPedido: e.target.value })}
                  >
                    <option value="">-- Sin pedido específico --</option>
                    {pedidos.map(p => (
                      <option key={p.id} value={p.id}>
                        Pedido #{p.numero_pedido} - {p.estado_formateado}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Detalle de la reclamación *</label>
                <textarea
                  required
                  value={form.detalle}
                  onChange={e => setForm({ ...form, detalle: e.target.value })}
                  placeholder="Describe tu reclamación o consulta de manera detallada..."
                />
              </div>
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Reclamación"}
            </button>
            {success && <div className="modal-success">{success}</div>}
            {error && <div className="modal-error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}