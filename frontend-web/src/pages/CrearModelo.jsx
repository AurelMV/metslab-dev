import { useState } from "react";
import axios from "axios";
import "./EstiloCrea.css";
import env from "../config/env.jsx"; // Asegúrate de que la ruta sea correcta

export default function ModeloUploader() {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    dimensiones: "",
    modelo_3d: null,
    imagen: null,
    precio: "",
    idCategoria: "",
  });

  const [preview, setPreview] = useState({
    imagen: null,
    modeloNombre: "",
  });

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setForm((prev) => ({ ...prev, [name]: file }));

      if (name === "imagen") {
        setPreview((prev) => ({ ...prev, imagen: URL.createObjectURL(file) }));
      }
      if (name === "modelo_3d") {
        setPreview((prev) => ({ ...prev, modeloNombre: file.name }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores({});
    setMensaje(null);

    const data = new FormData();
    for (const key in form) {
      if (form[key]) data.append(key, form[key]);
    }

    try {
      const response = await axios.post(
        `${env.BASE_URL_API}/api/modelos`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMensaje(response.data.message);
      setForm({
        nombre: "",
        descripcion: "",
        dimensiones: "",
        modelo_3d: null,
        imagen: null,
        precio: "",
        idCategoria: "",
      });
      setPreview({ imagen: null, modeloNombre: "" });
    } catch (error) {
      if (error.response?.status === 422) {
        setErrores(error.response.data.errors);
      } else {
        setMensaje(error.response?.data?.error || "Error desconocido");
      }
    }
  };

  return (
    <div className="form-container">
      <h2 className="heading">Registrar Modelo 3D</h2>

      {mensaje && <p className="success-text">{mensaje}</p>}

      <form onSubmit={handleSubmit}>
        <label className="txtmodelo">Nombre</label>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="input"
        />
        {errores.nombre && <p className="error-text">{errores.nombre[0]}</p>}
        <label className="txtmodelo">Descripcion</label>
        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          className="input"
        />
        <label className="txtmodelo">Dimenciones</label>
        <input
          type="text"
          name="dimensiones"
          placeholder="Dimensiones"
          value={form.dimensiones}
          onChange={handleChange}
          className="input"
        />
        <label className="txtmodelo">Precio</label>
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={form.precio}
          onChange={handleChange}
          className="input"
        />
        {errores.precio && <p className="error-text">{errores.precio[0]}</p>}
        <label className="txtmodelo">ID Categoria </label>
        <input
          type="text"
          name="idCategoria"
          placeholder="ID Categoría"
          value={form.idCategoria}
          onChange={handleChange}
          className="input"
        />
        <label className="txtmodelo">Archivo 3D</label>
        <div>
          <label>Archivo 3D (.obj):</label>
          <input
            type="file"
            name="modelo_3d"
            accept=".obj"
            onChange={handleChange}
            className="input"
          />
          {errores.modelo_3d && (
            <p className="error-text">{errores.modelo_3d[0]}</p>
          )}
        </div>
        <label className="txtmodelo">Imagen formato jpg </label>
        <div>
          <label>Imagen (opcional):</label>
          <input
            type="file"
            name="imagen"
            accept="image/*"
            onChange={handleChange}
            className="input"
          />
          {errores.imagen && <p className="error-text">{errores.imagen[0]}</p>}
        </div>

        <div className="preview-container">
          <h3 className="preview-title">Vista previa:</h3>
          <p>
            <strong>Nombre:</strong> {form.nombre}
          </p>
          <p>
            <strong>Precio:</strong> S/. {form.precio}
          </p>
          <p>
            <strong>Modelo:</strong> {preview.modeloNombre}
          </p>
          {preview.imagen && (
            <img
              src={preview.imagen}
              alt="Vista previa"
              className="preview-image"
            />
          )}
        </div>

        <button type="submit" className="submit-button">
          Guardar modelo
        </button>
      </form>
    </div>
  );
}
