import React, { useEffect, useState } from "react";
import { getToken } from "../services/auth-service";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";

const API_URL =
  import.meta.env.VITE_BASE_URL_API || "http://localhost:8000/api";

function initialForm() {
  return {
    nombre: "",
    descripcion: "",
    dimensiones: "",
    precio: "",
    idCategoria: "",
    estado: true,
    modelo_3d: null,
    imagen: null,
  };
}

export default function ModelosAdmin() {
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm());
  const [loading, setLoading] = useState(false);

  // Cargar modelos y categorías al montar
  useEffect(() => {
    fetchModelos();
    fetchCategorias();
  }, []);

  async function fetchModelos() {
    setLoading(true);
    const token = getToken();
    const res = await fetch(`${API_URL}/modelos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setModelos(data.data || []);
    setLoading(false);
  }

  async function fetchCategorias() {
    const res = await fetch(`${API_URL}/categorias`);
    const data = await res.json();
    setCategorias(data.data || []);
  }

  function handleOpenCreate() {
    setEditing(null);
    setForm(initialForm());
    setShowModal(true);
  }

  function handleOpenEdit(modelo) {
    setEditing(modelo.idModelo);
    setForm({
      nombre: modelo.nombre,
      descripcion: modelo.descripcion,
      dimensiones: modelo.dimensiones,
      precio: modelo.precio,
      idCategoria: modelo.idCategoria,
      estado: modelo.estado ?? true,
      modelo_3d: null,
      imagen: null,
    });
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else if (type === "file") {
      setForm((f) => ({ ...f, [name]: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const token = getToken();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined) formData.append(k, v);
    });

    let url = `${API_URL}/modelos`;
    let method = "POST";
    if (editing) {
      url = `${API_URL}/modelos/${editing}`;
      method = "POST"; // Laravel expects PUT/PATCH, but for FormData use POST + _method
      formData.append("_method", "PUT");
    }

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setShowModal(false);
      fetchModelos();
    } else {
      alert(data.error || "Error al guardar el modelo");
    }
  }

  return (
    <div className="section-content">
      <div className="section-header">
        <h2>Gestión de Modelos 3D</h2>
        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus className="icon" />
          <span>Nuevo Modelo</span>
        </button>
      </div>
      {loading && <div>Cargando...</div>}
      <div className="form-grid model-grid">
        {modelos.map((modelo) => (
          <div key={modelo.idModelo} className="card">
            <img
              src={modelo.imagen_url || "/placeholder.png"}
              alt={modelo.nombre}
              className="w-full h-40 object-cover mb-2"
            />
            <h3 className="text-lg font-semibold">{modelo.nombre}</h3>
            <div className="text-sm text-secondary-500 mb-2">
              {modelo.descripcion}
            </div>
            <div className="text-xs text-secondary-500 mb-2">
              Dimensiones: {modelo.dimensiones}
            </div>
            <div className="text-xs text-secondary-500 mb-2">
              Categoría: {modelo.nombreCategoria}
            </div>
            <div className="font-bold text-secondary-900 mb-2">
              S/ {modelo.precio}
            </div>
            <div className="text-xs mb-2">
              Estado:{" "}
              <span
                className={
                  modelo.estado ? "badge badge-green" : "badge badge-gray"
                }
              >
                {modelo.estado ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="action-buttons space-x-2">
              <button
                onClick={() => handleOpenEdit(modelo)}
                className="action-btn"
              >
                <Edit className="icon" />
              </button>
              <a
                href={modelo.modelo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn"
                title="Ver modelo 3D"
              >
                <Eye className="icon" />
              </a>
              {/* Aquí podrías agregar botón de eliminar si lo deseas */}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editing ? "Editar Modelo" : "Nuevo Modelo"}</h3>
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
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Dimensiones</label>
                <input
                  name="dimensiones"
                  value={form.dimensiones}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Precio</label>
                <input
                  name="precio"
                  type="number"
                  value={form.precio}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>

                <input
                  name="idCategoria"
                  type="number"
                  value={form.idCategoria}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <input
                  name="estado"
                  type="checkbox"
                  checked={!!form.estado}
                  onChange={handleChange}
                />{" "}
                Activo
              </div>
              <div className="form-group">
                <label>Archivo Modelo 3D (.obj)</label>
                <input
                  name="modelo_3d"
                  type="file"
                  accept=".obj,.txt"
                  onChange={handleChange}
                  className="form-input"
                  required={!editing}
                />
              </div>
              <div className="form-group">
                <label>Imagen</label>
                <input
                  name="imagen"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
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
