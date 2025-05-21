import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./Diseñosproduct.css"; // Asegúrate de tener este archivo CSS para los estilos

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [color, setColor] = useState("#808080"); // Color predeterminado gris
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);

  // Colores disponibles para el modelo
  const colorOptions = [
    { name: "Gris", value: "#808080" },
    { name: "Negro", value: "#212121" },
    { name: "Verde militar", value: "#4b5320" },
    { name: "Azul oscuro", value: "#00008B" },
    { name: "Marrón", value: "#8B4513" },
  ];

  // Función para obtener los datos del producto desde la API
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Usar el ID dinámico de la URL
        const response = await fetch(`http://127.0.0.1:8000/api/modelos/${id}`);

        if (!response.ok) {
          throw new Error("No se pudo obtener la información del producto");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          throw new Error("Formato de respuesta inválido");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // Configuración y renderizado del modelo 3D
  useEffect(() => {
    if (!product || !containerRef.current) return;

    // Inicializar escena Three.js
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Crear escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Crear cámara
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    // Crear renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Agregar controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Cargar el modelo OBJ desde la URL
    if (product.modelo_url) {
      const loader = new OBJLoader();

      loader.load(
        product.modelo_url,
        (object) => {
          // Aplicar material al modelo
          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            metalness: 0.2,
            roughness: 0.8,
          });

          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = material;
            }
          });

          // Centrar y escalar el modelo
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 10 / maxDim;

          object.position.sub(center);
          object.scale.set(scale, scale, scale);

          scene.add(object);
          modelRef.current = object;
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + "% cargado");
        },
        (error) => {
          console.error("Error al cargar el modelo:", error);
          setError("No se pudo cargar el modelo 3D");
        }
      );
    }

    // Función de animación
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Manejo de redimensionamiento
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Limpieza al desmontar
    return () => {
      window.removeEventListener("resize", handleResize);
      if (
        rendererRef.current &&
        rendererRef.current.domElement &&
        containerRef.current
      ) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [product, color]);

  // Cambiar el color del modelo
  const changeModelColor = (newColor) => {
    setColor(newColor);

    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.color.set(newColor);
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="product-detail loading">
        <div className="container">
          <div className="spinner"></div>
          <p>Cargando modelo 3D...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail error">
        <div className="container">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="container">
        <div className="row">
          <div className="model-container">
            <div className="model-viewer" ref={containerRef}></div>
            <div className="model-controls">
              <div className="color-options">
                <h4>Colores disponibles:</h4>
                <div className="color-buttons">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`color-btn ${
                        color === option.value ? "active" : ""
                      }`}
                      style={{ backgroundColor: option.value }}
                      onClick={() => changeModelColor(option.value)}
                      title={option.name}
                    />
                  ))}
                </div>
              </div>
              <div className="controls-help">
                <p>
                  <strong>Controles:</strong> Haz clic y arrastra para rotar.
                  Usa la rueda del ratón para hacer zoom.
                </p>
              </div>
            </div>
          </div>

          <div className="product-info">
            <div className="breadcrumb">
              <Link to="/">Inicio</Link> /
              <Link to={`/categoria/${product?.idCategoria}`}>
                {product?.nombreCategoria}
              </Link>{" "}
              /<span>{product?.nombre}</span>
            </div>

            <h1 className="product-name">{product?.nombre}</h1>

            <div className="product-price">
              <span className="price">${product?.precio}</span>
              {product?.precio_anterior && (
                <span className="original-price">
                  ${product?.precio_anterior}
                </span>
              )}
            </div>

            <div className="product-description">
              <h3>Descripción</h3>
              <p>{product?.descripcion}</p>
            </div>

            <div className="product-dimensions">
              <h3>Dimensiones</h3>
              <p>{product?.dimensiones}</p>
            </div>

            <div className="product-actions">
              <button className="btn btn-primary">Agregar al carrito</button>
              <button className="btn btn-outline">Guardar en favoritos</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
