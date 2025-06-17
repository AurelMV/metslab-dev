import ModelViewer from './utils/ModelViewer'

const ModelDetail = ({ model }) => {
  if (!model) return null

  return (
    <div className="model-detail-container">
      <div className="model-detail-card">
        <div className="model-detail-header">
          <div className="model-detail-header-content">
            <h2 className="model-detail-title-wrapper">Detalles del Modelo</h2>
          </div>
        </div>
        <div className="model-detail-grid">
          <div className="model-detail-viewer">
            <ModelViewer idModelo={model.idModelo} width={400} height={350} background="#f0f0f0" />
          </div>
          <div className="model-detail-info">
            <h2 className="model-detail-title">{model.nombre}</h2>
            <p className="model-detail-description">{model.descripcion}</p>
            <div className="model-detail-attributes">
              <div>
                <span className="model-detail-label">Precio:</span>
                <span className="model-detail-value">S/.{Number(model.precio).toFixed(2)}</span>
              </div>
              <div>
                <span className="model-detail-label">Dimensiones:</span>
                <span className="model-detail-value">{model.dimensiones}</span>
              </div>
              <div>
                <span className="model-detail-label">Categoría:</span>
                <span className="model-detail-value">{model.nombreCategoria}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelDetail
