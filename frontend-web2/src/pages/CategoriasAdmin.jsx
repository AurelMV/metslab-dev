import React, { useEffect, useState } from "react";
import { getToken } from "../services/auth-service";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  getCategorias,
  createCategoria,
  updateCategoria,
} from "../services/categoria-service";

function initialForm() {
  return {
    nombre: "",
  };
}

const PAGE_SIZE = 5;

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm());
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    setLoading(true);
    try {
      const data = await getCategorias();
      setCategorias(Array.isArray(data) ? data : []);
      setPage(1); // Reinicia a la primera página al cargar
    } catch (err) {
      setCategorias([]);
    }
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
    try {
      if (editing) {
        await updateCategoria(editing, form.nombre, token);
      } else {
        await createCategoria(form.nombre, token);
      }
      setShowModal(false);
      fetchCategorias();
    } catch (err) {
      alert(
        err.message ||
          (err.errors && Object.values(err.errors).join("\n")) ||
          "Error al guardar la categoría"
      );
    }
    setLoading(false);
  }

  async function handleDelete(idCategoria) {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    const token = getToken();
    try {
      await deleteCategoria(idCategoria, token);
      fetchCategorias();
    } catch {
      alert("No se pudo eliminar la categoría");
    }
  }

  // Paginación
  const totalPages = Math.ceil(categorias.length / PAGE_SIZE);
  const categoriasPagina = categorias.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Categorías
        </h2>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg shadow-sm hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Categoría</span>
        </button>
      </div>
      {loading && <div className="text-gray-500 mb-4">Cargando...</div>}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoriasPagina.map((categoria) => (
            <div
              key={categoria.idCategoria}
              className="bg-gray-50 rounded-lg shadow p-4 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {categoria.nombre}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(categoria)}
                    className="p-2 rounded-full text-yellow-700  transition"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Paginación */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md ring-1 ring-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editing ? "Editar Categoría" : "Nueva Categoría"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Nombre de la categoría"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg shadow-sm hover:bg-orange-600 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed"
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
