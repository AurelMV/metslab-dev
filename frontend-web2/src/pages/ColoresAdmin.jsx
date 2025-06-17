import React, { useEffect, useState } from "react";
import { getToken } from "../services/auth-service";
import { Plus, Edit, Trash2 } from "lucide-react";

const API_URL =
  import.meta.env.VITE_BASE_URL_API || "http://localhost:8000/api";

function initialForm() {
  return { nombre: "", codigo_hex: "#000000" };
}

export default function ColoresAdmin() {
  const [colores, setColores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchColores();
  }, []);

  async function fetchColores() {
    setLoading(true);
    const res = await fetch(`${API_URL}/color`);
    const data = await res.json();
    setColores(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function handleOpenCreate() {
    setEditing(null);
    setForm(initialForm());
    setShowModal(true);
  }

  function handleOpenEdit(color) {
    setEditing(color.id);
    setForm({
      nombre: color.nombre,
      codigo_hex: color.codigo_hex,
    });
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const token = getToken();
    const payload = {
      nombre: form.nombre,
      codigo_hex: form.codigo_hex,
    };

    let url = `${API_URL}/color`;
    let method = "POST";
    let headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (editing) {
      url = `${API_URL}/color/${editing}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setShowModal(false);
      fetchColores();
    } else {
      alert(
        data.error ||
          (data.errors && Object.values(data.errors).join("\n")) ||
          "Error al guardar el color"
      );
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Seguro que deseas eliminar este color?")) return;
    const token = getToken();
    const res = await fetch(`${API_URL}/colores/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      fetchColores();
    } else {
      alert("No se pudo eliminar el color");
    }
  }

  return (
    <div className="section-content">
      <div className="section-header">
        <h2>Colores</h2>
        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus className="icon" />
          <span>Nuevo Color</span>
        </button>
      </div>
      {loading && <div>Cargando...</div>}
      <div className="form-grid color-grid">
        {colores.map((color) => (
          <div key={color.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">
                {color.nombre}
              </h3>
              <div className="action-buttons space-x-2">
                <button
                  onClick={() => handleOpenEdit(color)}
                  className="action-btn"
                >
                  <Edit className="icon" />
                </button>
                <button
                  onClick={() => handleDelete(color.id)}
                  className="action-btn delete"
                >
                  <Trash2 className="icon" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  display: "inline-block",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: color.codigo_hex,
                  border: "1px solid #ccc",
                }}
                title={color.codigo_hex}
              />
              <span className="text-xs">{color.codigo_hex}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editing ? "Editar Color" : "Nuevo Color"}</h3>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Código HEX</label>
                <input
                  name="codigo_hex"
                  value={form.codigo_hex}
                  onChange={handleChange}
                  required
                  className="form-input"
                  type="color"
                  style={{ width: 50, height: 40, padding: 0 }}
                />
                <input
                  name="codigo_hex"
                  value={form.codigo_hex}
                  onChange={handleChange}
                  required
                  className="form-input"
                  type="text"
                  maxLength={7}
                  pattern="^#[0-9A-Fa-f]{6}$"
                  style={{ width: 90, marginLeft: 8 }}
                />
              </div>
              <div className="form-group col-span-2 flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
