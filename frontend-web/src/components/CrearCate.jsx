import React, { useState, useEffect } from "react";
import "../estiloscatalogo/CreaCateStyle.css"; // Asegúrate de que la ruta sea correcta
import env from "../config/env.jsx"; // Asegúrate de que la ruta sea correcta

const CategoriasManager = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // URL base de tu API Laravel

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategorias();
  }, []);

  // Obtener todas las categorías
  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${env.BASE_URL_API}/api/categorias`);
      if (!response.ok) {
        throw new Error("Error al cargar categorías");
      }
      const data = await response.json();
      setCategorias(data);
      setError("");
    } catch (err) {
      setError("Error al cargar las categorías");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Crear o actualizar categoría
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      setError("El nombre de la categoría es requerido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = isEditing
        ? `${env.BASE_URL_API}/api/categorias/${formData.id}`
        : `${env.BASE_URL_API}/api/categorias`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre: formData.nombre }),
      });

      if (!response.ok) {
        throw new Error(
          `Error al ${isEditing ? "actualizar" : "crear"} categoría`
        );
      }

      const result = await response.json();
      setSuccess(result.message);

      // Limpiar formulario
      setFormData({ id: "", nombre: "" });
      setIsEditing(false);

      // Recargar categorías
      fetchCategorias();

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`Error al ${isEditing ? "actualizar" : "crear"} la categoría`);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Preparar formulario para edición
  const handleEdit = (categoria) => {
    setFormData({
      id: categoria.id,
      nombre: categoria.nombre,
    });
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  // Eliminar categoría
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar categoría");
      }

      const result = await response.json();
      setSuccess(result.message);
      fetchCategorias();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error al eliminar la categoría");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    setFormData({ id: "", nombre: "" });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  return (
    <div className="categorias-container">
      <div className="categorias-header">
        <h1>Gestión de Categorías</h1>
      </div>

      {/* Mensajes de error y éxito */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Formulario */}
      <div className="form-container">
        <h2>{isEditing ? "Editar Categoría" : "Nueva Categoría"}</h2>
        <div className="categoria-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la Categoría:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre de la categoría"
              className="form-input"
              disabled={loading}
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Procesando..." : isEditing ? "Actualizar" : "Crear"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="categorias-list">
        <h2>Lista de Categorías</h2>
        {loading && <div className="loading">Cargando...</div>}

        {categorias.length === 0 && !loading ? (
          <div className="empty-state">No hay categorías registradas</div>
        ) : (
          <div className="categorias-grid">
            {categorias.map((categoria) => (
              <div key={categoria.id} className="categoria-card">
                <div className="categoria-info">
                  <h3>{categoria.nombre}</h3>
                  <span className="categoria-id">ID: {categoria.id}</span>
                </div>
                <div className="categoria-actions">
                  <button
                    onClick={() => handleEdit(categoria)}
                    className="btn btn-edit"
                    disabled={loading}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(categoria.id)}
                    className="btn btn-delete"
                    disabled={loading}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriasManager;
