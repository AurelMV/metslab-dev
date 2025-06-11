import ModeloFormulario from './ModeloFormulario1'
import GestionModelos from './GestionModelos'

import { useState } from 'react'

export default function ModeloUploader() {
  const [vistaActual, setVistaActual] = useState('gestion') // 'gestion', 'formulario', 'editar'
  const [modelos, setModelos] = useState([
    // Datos de ejemplo
    {
      id: 1,
      nombre: 'Figura de Dragon',
      descripcion: 'Modelo detallado de un dragón medieval',
      dimensiones: '15cm x 20cm x 12cm',
      precio: '45.50',
      idCategoria: 'FANTASIA',
      modelo_3d: 'dragon_medieval.obj',
      imagen:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RHJhZ8OzbjwvdGV4dD48L3N2Zz4=',
      fechaCreacion: '08/06/2025'
    },
    {
      id: 2,
      nombre: 'Casa Moderna',
      descripcion: 'Maqueta de casa contemporánea',
      dimensiones: '25cm x 30cm x 18cm',
      precio: '89.99',
      idCategoria: 'ARQUITECTURA',
      modelo_3d: 'casa_moderna.obj',
      imagen:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzEwYjk4MSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2FzYTwvdGV4dD48L3N2Zz4=',
      fechaCreacion: '09/06/2025'
    }
  ])
  const [modeloEditando, setModeloEditando] = useState(null)

  const handleGuardarModelo = (modelo) => {
    if (modeloEditando) {
      setModelos((prev) => prev.map((m) => (m.id === modelo.id ? modelo : m)))
      setModeloEditando(null)
      setVistaActual('gestion')
    } else {
      setModelos((prev) => [...prev, modelo])
    }
  }

  const handleEditarModelo = (modelo) => {
    setModeloEditando(modelo)
    setVistaActual('editar')
  }

  const handleEliminarModelo = (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este modelo?')) {
      setModelos((prev) => prev.filter((m) => m.id !== id))
    }
  }

  const handleVisualizarModelo = (modelo) => {
    alert(
      `Abriendo visualizador 3D para: ${modelo.nombre}\n\nEste botón abrirá otro componente de visualización 3D.`
    )
    // Aquí llamarías a tu componente de visualización 3D
    // Ejemplo: setComponenteVisualizacion(modelo)
  }

  return (
    <div className="main-container">
      <style jsx>{`
        .main-container {
          min-height: 100vh;
          background-color: #f3f4f6;
          padding: 16px;
        }

        .content-wrapper {
          max-width: 1280px;
          margin: 0 auto;
        }

        .navigation {
          margin-bottom: 24px;
        }

        .nav-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .nav-tab {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .nav-tab.active {
          background-color: #3b82f6;
          color: white;
        }

        .nav-tab:not(.active) {
          background-color: white;
          color: #374151;
        }

        .nav-tab:not(.active):hover {
          background-color: #f9fafb;
        }
      `}</style>

      <div className="content-wrapper">
        <div className="navigation">
          <div className="nav-tabs">
            <button
              onClick={() => setVistaActual('gestion')}
              className={`nav-tab ${vistaActual === 'gestion' ? 'active' : ''}`}
            >
              Gestión de Modelos
            </button>
            <button
              onClick={() => setVistaActual('formulario')}
              className={`nav-tab ${vistaActual === 'formulario' ? 'active' : ''}`}
            >
              Nuevo Modelo
            </button>
          </div>
        </div>

        {vistaActual === 'gestion' && (
          <GestionModelos
            modelos={modelos}
            onEditar={handleEditarModelo}
            onEliminar={handleEliminarModelo}
            onVisualizar={handleVisualizarModelo}
          />
        )}

        {vistaActual === 'formulario' && <ModeloFormulario onGuardar={handleGuardarModelo} />}

        {vistaActual === 'editar' && modeloEditando && (
          <ModeloFormulario
            modelo={modeloEditando}
            onGuardar={handleGuardarModelo}
            onCancelar={() => {
              setModeloEditando(null)
              setVistaActual('gestion')
            }}
          />
        )}
      </div>
    </div>
  )
}
