import React, { useEffect, useState } from "react";
import { getToken } from "../services/auth-service";
import { Plus, Edit, Trash2 } from "lucide-react";

const API_URL =
  import.meta.env.VITE_BASE_URL_API || "http://localhost:8000/api";

function initialForm() {
  return {
    nombre: "",
  };
}

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    setLoading(true);
    const res = await fetch(`${API_URL}/categorias`);
    const data = await res.json();
    setCategorias(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function handleOpenCreate() {
    setEditing(null);
    setForm(initialForm());
    setShowModal(true);
  }

  function handleOpenEdit(categoria) {
    setEditing(categoria.idCategoria);
    setForm({
      nombre: categoria.nombre,
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
    };

    let url = `${API_URL}/categorias`;
    let method = "POST";
    let headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (editing) {
      url = `${API_URL}/categorias/${editing}`;
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
      fetchCategorias();
    } else {
      alert(
        data.error ||
          (data.errors && Object.values(data.errors).join("\n")) ||
          "Error al guardar la categoría"
      );
    }
  }

  async function handleDelete(idCategoria) {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    const token = getToken();
    const res = await fetch(`${API_URL}/categorias/${idCategoria}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      fetchCategorias();
    } else {
      alert("No se pudo eliminar la categoría");
    }
  }

  return (
    <div className="section-content">
      <div className="section-header">
        <h2>Gestión de Categorías</h2>
        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus className="icon" />
          <span>Nueva Categoría</span>
        </button>
      </div>
      {loading && <div>Cargando...</div>}
      <div className="form-grid category-grid">
        {categorias.map((categoria) => (
          <div key={categoria.idCategoria} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">
                {categoria.nombre}
              </h3>
              <div className="action-buttons space-x-2">
                <button
                  onClick={() => handleOpenEdit(categoria)}
                  className="action-btn"
                >
                  <Edit className="icon" />
                </button>
                <button
                  onClick={() => handleDelete(categoria.idCategoria)}
                  className="action-btn delete"
                >
                  <Trash2 className="icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editing ? "Editar Categoría" : "Nueva Categoría"}</h3>
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
