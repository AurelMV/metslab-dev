function GestionModelos({ modelos, onEditar, onEliminar, onVisualizar }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const modelosFiltrados = modelos.filter((modelo) => {
    const coincideBusqueda =
      modelo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      modelo.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = !filtroCategoria || modelo.idCategoria === filtroCategoria
    return coincideBusqueda && coincideCategoria
  })

  const categorias = [...new Set(modelos.map((m) => m.idCategoria).filter(Boolean))]

  return (
    <div className="gestion-container">
      <style jsx>{`
        .gestion-container {
          background-color: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .gestion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .gestion-title {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .gestion-counter {
          font-size: 14px;
          color: #6b7280;
        }

        .filters-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (min-width: 768px) {
          .filters-container {
            flex-direction: row;
          }
        }

        .search-container {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          width: 16px;
          height: 16px;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px 8px 40px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .filter-container {
          width: 100%;
          position: relative;
        }

        @media (min-width: 768px) {
          .filter-container {
            width: 200px;
          }
        }

        .filter-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          width: 16px;
          height: 16px;
          pointer-events: none;
        }

        .filter-select {
          width: 100%;
          padding: 8px 12px 8px 40px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
          appearance: none;
          background-color: white;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .models-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .models-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .models-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .model-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          transition: box-shadow 0.2s;
        }

        .model-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .model-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .model-info {
          flex: 1;
        }

        .model-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 18px;
          margin: 0 0 4px 0;
        }

        .model-description {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .model-image {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 6px;
          margin-left: 12px;
        }

        .model-details {
          margin-bottom: 16px;
        }

        .model-details p {
          font-size: 14px;
          color: #6b7280;
          margin: 2px 0;
        }

        .model-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .edit-btn {
          color: #3b82f6;
          background-color: transparent;
        }

        .edit-btn:hover {
          background-color: #eff6ff;
        }

        .delete-btn {
          color: #dc2626;
          background-color: transparent;
        }

        .delete-btn:hover {
          background-color: #fef2f2;
        }

        .visualize-btn {
          padding: 4px 12px;
          background-color: #16a34a;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: background-color 0.2s;
        }

        .visualize-btn:hover {
          background-color: #15803d;
        }

        .empty-state {
          text-align: center;
          padding: 32px;
          color: #6b7280;
        }
      `}</style>

      <div className="gestion-header">
        <h2 className="gestion-title">Gestión de Modelos 3D</h2>
        <div className="gestion-counter">Total: {modelosFiltrados.length} modelos</div>
      </div>

      <div className="filters-container">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar modelos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <Filter className="filter-icon" />
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                Categoría {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="models-grid">
        {modelosFiltrados.map((modelo) => (
          <div key={modelo.id} className="model-card">
            <div className="model-header">
              <div className="model-info">
                <h3 className="model-title">{modelo.nombre}</h3>
                <p className="model-description">{modelo.descripcion}</p>
              </div>
              {modelo.imagen && (
                <img src={modelo.imagen} alt={modelo.nombre} className="model-image" />
              )}
            </div>

            <div className="model-details">
              <p>
                <strong>Precio:</strong> S/. {modelo.precio}
              </p>
              <p>
                <strong>Dimensiones:</strong> {modelo.dimensiones || 'No especificado'}
              </p>
              <p>
                <strong>Modelo:</strong> {modelo.modelo_3d}
              </p>
              <p>
                <strong>Categoría:</strong> {modelo.idCategoria || 'Sin categoría'}
              </p>
              <p>
                <strong>Creado:</strong> {modelo.fechaCreacion}
              </p>
            </div>

            <div className="model-actions">
              <div className="action-buttons">
                <button
                  onClick={() => onEditar(modelo)}
                  className="action-btn edit-btn"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEliminar(modelo.id)}
                  className="action-btn delete-btn"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <button onClick={() => onVisualizar(modelo)} className="visualize-btn">
                <Eye className="w-4 h-4" />
                Visualizar
              </button>
            </div>
          </div>
        ))}
      </div>

      {modelosFiltrados.length === 0 && (
        <div className="empty-state">
          {busqueda || filtroCategoria
            ? 'No se encontraron modelos con esos criterios.'
            : 'No hay modelos registrados.'}
        </div>
      )}
    </div>
  )
}
export default GestionModelos
import React, { useState } from 'react'

//import ModeloFormulario from './ModeloFormulario'
import { Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
