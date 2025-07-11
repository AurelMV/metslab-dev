import React, { useEffect, useState } from "react";
import { getToken } from "../services/auth-service";
import { Plus, Edit, Eye, Trash2, Search, Filter } from "lucide-react";
import ModelViewer from "./ModelViewer";
import "../stayle/ModelosAdmin.css";
//import { env } from "../config/env";
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
import {
  getModelos,
  createModelo,
  updateModelo,
  getModelo3D,
} from "../services/modelo-service";
import { getCategorias } from "../services/categoria-service";

export default function ModelosAdmin() {
  const [viewerUrl, setViewerUrl] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm());
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Estados para filtros
  const [filters, setFilters] = useState({
    nombre: "",
    categoria: "",
    estado: "todos",
    precioMin: "",
    precioMax: "",
  });

  // Cargar modelos y categorías al montar
  useEffect(() => {
    fetchModelos();
    fetchCategorias();
  }, []);

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = "Nombre es requerido";
    if (!form.precio) errors.precio = "Precio es requerido";
    if (!editing && !form.modelo_3d)
      errors.modelo_3d = "Modelo 3D es requerido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Filtrar modelos
  const modelosFiltrados = modelos.filter((modelo) => {
    const matchNombre = modelo.nombre
      .toLowerCase()
      .includes(filters.nombre.toLowerCase());
    const matchCategoria =
      filters.categoria === "" ||
      modelo.idCategoria.toString() === filters.categoria;
    const matchEstado =
      filters.estado === "todos" ||
      (filters.estado === "activo" && modelo.estado) ||
      (filters.estado === "inactivo" && !modelo.estado);
    const matchPrecioMin =
      filters.precioMin === "" ||
      parseFloat(modelo.precio) >= parseFloat(filters.precioMin);
    const matchPrecioMax =
      filters.precioMax === "" ||
      parseFloat(modelo.precio) <= parseFloat(filters.precioMax);

    return (
      matchNombre &&
      matchCategoria &&
      matchEstado &&
      matchPrecioMin &&
      matchPrecioMax
    );
  });
  async function handleView3D(modeloId) {
    try {
      const modeloUrl = await getModelo3D(modeloId);
      console.log("URL recibida:", modeloUrl);
      if (modeloUrl) {
        setViewerUrl(modeloUrl);
        setViewerOpen(true);
      } else {
        alert("No se pudo obtener el modelo 3D.");
      }
    } catch (err) {
      alert("Error al cargar el modelo 3D.");
    }
  }

  async function fetchModelos() {
    setLoading(true);
    try {
      const token = getToken();
      const modelos = await getModelos(token);
      setModelos(modelos);
    } catch (err) {
      setModelos([]);
    }
    setLoading(false);
  }

  async function fetchCategorias() {
    try {
      const data = await getCategorias();
      setCategorias(Array.isArray(data) ? data : []);
    } catch {
      setCategorias([]);
    }
  }
  function handleOpenCreate() {
    setEditing(null);
    setForm(initialForm());
    setFormErrors({});
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
    setFormErrors({});
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

    // Limpiar error cuando se modifica el campo
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function clearFilters() {
    setFilters({
      nombre: "",
      categoria: "",
      estado: "todos",
      precioMin: "",
      precioMax: "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const token = getToken();
    const formData = new FormData();

    // Preparar los datos para enviar
    Object.entries(form).forEach(([key, value]) => {
      // Solo agregar archivos si no estamos editando o si son nuevos
      if (editing && (key === "modelo_3d" || key === "imagen") && !value)
        return;

      if (value !== null && value !== undefined) {
        // Asegurar que el estado se envía como booleano
        if (key === "estado") {
          formData.append(key, value ? "1" : "0");
        } else {
          formData.append(key, value);
        }
      }
    });

    try {
      if (editing) {
        await updateModelo(editing, formData, token);
      } else {
        await createModelo(formData, token);
      }
      setShowModal(false);
      fetchModelos();
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Ocurrió un error al guardar el modelo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modelos-admin">
      <div className="admin-header">
        <h1 className="admin-title">Gestión de Modelos 3D</h1>
        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus size={20} />
          <span>Nuevo Modelo</span>
        </button>
      </div>

      {/* Sección de Filtros */}
      <div className="filters-section">
        <div className="filters-title">
          <Filter size={20} />
          <span>Filtros</span>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Buscar por nombre</label>
            <input
              type="text"
              name="nombre"
              value={filters.nombre}
              onChange={handleFilterChange}
              placeholder="Escribir nombre..."
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Estado</label>
            <select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">&nbsp;</label>
            <button onClick={clearFilters} className="clear-filters">
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="loading">Cargando modelos...</div>}

      {!loading && (
        <div className="table-container">
          <div className="results-info">
            Mostrando {modelosFiltrados.length} de {modelos.length} modelos
          </div>

          {modelosFiltrados.length === 0 ? (
            <div className="no-results">
              <p>
                No se encontraron modelos que coincidan con los filtros
                aplicados.
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead className="table-header">
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Dimensiones</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {modelosFiltrados.map((modelo) => (
                  <tr key={modelo.idModelo} className="table-row">
                    <td className="table-cell">
                      <img
                        src={modelo.imagen_url || "/placeholder.png"}
                        alt={modelo.nombre}
                        className="model-image"
                      />
                    </td>
                    <td className="table-cell">
                      <div className="model-name" title={modelo.nombre}>
                        {modelo.nombre.length > 5
                          ? modelo.nombre.slice(0, 5) + "..."
                          : modelo.nombre}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div
                        className="model-description"
                        title={modelo.descripcion}
                      >
                        {modelo.descripcion.length > 5
                          ? modelo.descripcion.slice(0, 5) + "..."
                          : modelo.descripcion}
                      </div>
                    </td>
                    <td className="table-cell">{modelo.dimensiones}</td>
                    <td className="table-cell">{modelo.nombreCategoria}</td>
                    <td className="table-cell">
                      <span className="price">S/ {modelo.precio}</span>
                    </td>
                    <td className="table-cell">
                      <span
                        className={`status-badge ${
                          modelo.estado ? "status-active" : "status-inactive"
                        }`}
                      >
                        {modelo.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleOpenEdit(modelo)}
                        className="action-btn btn-edit"
                        title="Editar modelo"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleView3D(modelo.idModelo)}
                        className="action-btn btn-view"
                        title="Ver modelo 3D"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal del Visor 3D */}
      {viewerOpen && viewerUrl && (
        <div className="modal-overlay" onClick={() => setViewerOpen(false)}>
          <div
            className="modal viewer-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="viewer-content">
              <h3 className="viewer-title">Vista previa 3D</h3>
              <ModelViewer url={viewerUrl} color="#ffffff" />
              <button
                className="btn-secondary close-btn"
                onClick={() => setViewerOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editing ? "Editar Modelo" : "Nuevo Modelo"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className={`form-input ${
                      formErrors.nombre ? "input-error" : ""
                    }`}
                    placeholder="Nombre del modelo"
                  />
                  {formErrors.nombre && (
                    <span className="error-message">{formErrors.nombre}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Precio *</label>
                  <input
                    name="precio"
                    type="number"
                    step="0.01"
                    value={form.precio}
                    onChange={handleChange}
                    required
                    className={`form-input ${
                      formErrors.precio ? "input-error" : ""
                    }`}
                    placeholder="0.00"
                  />
                  {formErrors.precio && (
                    <span className="error-message">{formErrors.precio}</span>
                  )}
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Descripción del modelo"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dimensiones</label>
                  <input
                    name="dimensiones"
                    value={form.dimensiones}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="ej: 10x15x20 cm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado *</label>
                  <select
                    name="estado"
                    value={form.estado ? "1" : "0"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estado: e.target.value === "1",
                      })
                    }
                    className="form-select"
                    required
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select
                    name="idCategoria"
                    value={form.idCategoria}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.idCategoria} value={cat.idCategoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                {!editing && (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        Archivo Modelo 3D (.obj) *
                      </label>
                      <input
                        name="modelo_3d"
                        type="file"
                        accept=".glb"
                        onChange={handleChange}
                        className={`form-input ${
                          formErrors.modelo_3d ? "input-error" : ""
                        }`}
                        required
                      />
                      {formErrors.modelo_3d && (
                        <span className="error-message">
                          {formErrors.modelo_3d}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Imagen</label>
                      <input
                        name="imagen"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </>
                )}
                <div className="form-actions">
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
