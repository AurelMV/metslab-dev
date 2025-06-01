import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import env from "../config/env.jsx";

const Productvista = ({ productId }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const controlsRef = useRef(null);
  const frameRef = useRef(null);

  // Colores predeterminados
  const predefinedColors = [
    { name: "Rojo", value: "#ff6b6b" },
    { name: "Azul", value: "#4ecdc4" },
    { name: "Verde", value: "#45b7d1" },
    { name: "Amarillo", value: "#f9ca24" },
    { name: "Púrpura", value: "#6c5ce7" },
    { name: "Naranja", value: "#fd79a8" },
    { name: "Gris", value: "#636e72" },
    { name: "Negro", value: "#2d3436" },
  ];

  const [selectedColor, setSelectedColor] = useState("#ff6b6b");
  const [wireframe, setWireframe] = useState(false);
  const [currentObj, setCurrentObj] = useState("Ningún objeto cargado");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState(
    env.BASE_URL_API + "/api/modelos/modelo/"
  );
  const [apiStatus, setApiStatus] = useState("unknown");
  const [isMobile, setIsMobile] = useState(false);

  // Detectar dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Función para parsear archivos .obj
  const parseOBJ = (text) => {
    const vertices = [];
    const faces = [];
    const lines = text.split("\n");

    for (let line of lines) {
      line = line.trim();
      if (line.startsWith("v ")) {
        const parts = line.split(/\s+/);
        vertices.push(
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3])
        );
      } else if (line.startsWith("f ")) {
        const parts = line.split(/\s+/).slice(1);
        if (parts.length >= 3) {
          for (let i = 1; i < parts.length - 1; i++) {
            faces.push(
              parseInt(parts[0].split("/")[0]) - 1,
              parseInt(parts[i].split("/")[0]) - 1,
              parseInt(parts[i + 1].split("/")[0]) - 1
            );
          }
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setIndex(faces);
    geometry.computeVertexNormals();

    return geometry;
  };

  // Controles mejorados con soporte táctil
  const setupControls = (camera, renderer) => {
    let isInteracting = false;
    let startX = 0;
    let startY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let rotationX = 0;
    let rotationY = 0;

    // Funciones para mouse
    const onMouseDown = (event) => {
      isInteracting = true;
      startX = event.clientX;
      startY = event.clientY;
      event.preventDefault();
    };

    const onMouseUp = () => {
      isInteracting = false;
    };

    const onMouseMove = (event) => {
      if (!isInteracting) return;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      startX = event.clientX;
      startY = event.clientY;
      event.preventDefault();
    };

    // Funciones para touch
    const onTouchStart = (event) => {
      if (event.touches.length === 1) {
        isInteracting = true;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        event.preventDefault();
      }
    };

    const onTouchEnd = () => {
      isInteracting = false;
    };

    const onTouchMove = (event) => {
      if (!isInteracting || event.touches.length !== 1) return;

      const deltaX = event.touches[0].clientX - startX;
      const deltaY = event.touches[0].clientY - startY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      event.preventDefault();
    };

    const onWheel = (event) => {
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(2, Math.min(20, camera.position.z));
      event.preventDefault();
    };

    const domElement = renderer.domElement;

    // Event listeners para mouse
    domElement.addEventListener("mousedown", onMouseDown, { passive: false });
    domElement.addEventListener("mouseup", onMouseUp);
    domElement.addEventListener("mousemove", onMouseMove, { passive: false });
    domElement.addEventListener("wheel", onWheel, { passive: false });

    // Event listeners para touch
    domElement.addEventListener("touchstart", onTouchStart, { passive: false });
    domElement.addEventListener("touchend", onTouchEnd);
    domElement.addEventListener("touchmove", onTouchMove, { passive: false });

    return {
      update: () => {
        rotationX += (targetRotationX - rotationX) * 0.1;
        rotationY += (targetRotationY - rotationY) * 0.1;

        if (meshRef.current) {
          meshRef.current.rotation.x = rotationX;
          meshRef.current.rotation.y = rotationY;
        }
      },
      dispose: () => {
        domElement.removeEventListener("mousedown", onMouseDown);
        domElement.removeEventListener("mouseup", onMouseUp);
        domElement.removeEventListener("mousemove", onMouseMove);
        domElement.removeEventListener("wheel", onWheel);
        domElement.removeEventListener("touchstart", onTouchStart);
        domElement.removeEventListener("touchend", onTouchEnd);
        domElement.removeEventListener("touchmove", onTouchMove);
      },
      targetRotationX,
      targetRotationY,
    };
  };

  // Cargar modelo desde API
  const loadModelFromAPI = async (id) => {
    if (!id) {
      setError("ID de modelo no proporcionado");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (apiStatus === "unavailable") {
        throw new Error(
          "La API no está disponible. Verifica que tu servidor local esté ejecutándose y que la URL sea correcta."
        );
      }

      const response = await fetch(`${apiUrl}${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Error en la respuesta de la API");
      }

      const objResponse = await fetch(data.data.modelo_url);
      const objText = await objResponse.text();

      const geometry = parseOBJ(objText);

      if (sceneRef.current) {
        if (meshRef.current) {
          sceneRef.current.remove(meshRef.current);
        }

        const material = new THREE.MeshLambertMaterial({
          color: selectedColor,
          wireframe: wireframe,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDimension;

        mesh.position.sub(center);
        mesh.scale.multiplyScalar(scale);

        sceneRef.current.add(mesh);
        meshRef.current = mesh;
        setCurrentObj(`Modelo API ID: ${id}`);
        setApiStatus("available");
      }
    } catch (error) {
      console.error("Error loading model from API:", error);

      if (
        error.message.includes("Content Security Policy") ||
        error.message.includes("Failed to fetch")
      ) {
        setError(
          "Error de seguridad: No se puede conectar a la API local desde este entorno."
        );
      } else if (error.message.includes("CORS")) {
        setError(
          "Error de CORS: El servidor necesita configurar headers CORS."
        );
      } else {
        setError(`Error al cargar el modelo: ${error.message}`);
      }
      setApiStatus("unavailable");
    } finally {
      setLoading(false);
    }
  };

  // Generar modelo OBJ de ejemplo
  const generateSampleOBJ = () => {
    return `# Sample OBJ file - Pyramid
v 0.0 1.0 0.0
v -1.0 -1.0 1.0
v 1.0 -1.0 1.0
v 1.0 -1.0 -1.0
v -1.0 -1.0 -1.0

f 1 2 3
f 1 3 4
f 1 4 5
f 1 5 2
f 2 5 4 3
`;
  };

  // Cargar modelo de ejemplo
  const loadSampleModel = () => {
    try {
      const objText = generateSampleOBJ();
      const geometry = parseOBJ(objText);

      if (sceneRef.current) {
        if (meshRef.current) {
          sceneRef.current.remove(meshRef.current);
        }

        const material = new THREE.MeshLambertMaterial({
          color: selectedColor,
          wireframe: wireframe,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDimension;

        mesh.position.sub(center);
        mesh.scale.multiplyScalar(scale);

        sceneRef.current.add(mesh);
        meshRef.current = mesh;
        setCurrentObj("Pirámide (Ejemplo)");
        setError(null);
      }
    } catch (error) {
      setError("Error al cargar el modelo de ejemplo");
      console.error("Error loading sample model:", error);
    }
  };

  // Inicializar Three.js
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Limpiar canvas anterior
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Inicializar controles
    const controls = setupControls(camera, renderer);
    controlsRef.current = controls;

    // Manejar redimensionamiento
    const handleResize = () => {
      if (!mountRef.current) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      cancelAnimationFrame(frameRef.current);
      if (renderer) {
        renderer.dispose();
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Cargar modelo automáticamente
  useEffect(() => {
    if (productId && sceneRef.current) {
      loadModelFromAPI(productId);
    }
  }, [productId, sceneRef.current]);

  // Actualizar color
  useEffect(() => {
    if (meshRef.current && meshRef.current.material) {
      meshRef.current.material.color.setStyle(selectedColor);
    }
  }, [selectedColor]);

  // Actualizar wireframe
  useEffect(() => {
    if (meshRef.current && meshRef.current.material) {
      meshRef.current.material.wireframe = wireframe;
    }
  }, [wireframe]);

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 5);
    }
    if (controlsRef.current) {
      controlsRef.current.targetRotationX = 0;
      controlsRef.current.targetRotationY = 0;
    }
  };

  // Estilos responsivos
  const getResponsiveStyles = () => ({
    container: {
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#1f2937",
      fontFamily: "Arial, sans-serif",
    },
    colorBar: {
      height: isMobile ? "4px" : "8px",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      backgroundColor: selectedColor,
    },
    controlPanel: {
      backgroundColor: "#374151",
      padding: isMobile ? "8px" : "12px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      flexWrap: "wrap",
      alignItems: isMobile ? "stretch" : "center",
      gap: isMobile ? "12px" : "20px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      overflowX: isMobile ? "visible" : "auto",
      maxHeight: isMobile ? "none" : "80px",
    },
    controlGroup: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#4b5563",
      padding: isMobile ? "10px" : "8px",
      borderRadius: "6px",
      minWidth: isMobile ? "100%" : "auto",
      justifyContent: isMobile ? "space-between" : "flex-start",
    },
    colorPalette: {
      display: "flex",
      gap: "6px",
      flexWrap: "wrap",
      justifyContent: isMobile ? "center" : "flex-start",
    },
    colorSwatch: {
      width: isMobile ? "32px" : "24px",
      height: isMobile ? "32px" : "24px",
      borderRadius: "4px",
      border: "2px solid transparent",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    colorSwatchActive: {
      border: "2px solid white",
      transform: "scale(1.1)",
    },
    label: {
      color: "white",
      fontWeight: "500",
      fontSize: isMobile ? "16px" : "14px",
      minWidth: "fit-content",
    },
    checkboxLabel: {
      color: "white",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: isMobile ? "16px" : "14px",
      cursor: "pointer",
    },
    checkbox: {
      width: isMobile ? "20px" : "16px",
      height: isMobile ? "20px" : "16px",
      cursor: "pointer",
    },
    button: {
      padding: isMobile ? "12px 16px" : "8px 12px",
      borderRadius: "6px",
      border: "none",
      color: "white",
      cursor: "pointer",
      transition: "background-color 0.2s",
      fontSize: isMobile ? "16px" : "14px",
      backgroundColor: "#2563eb",
      minWidth: isMobile ? "100%" : "auto",
    },
    errorBar: {
      backgroundColor: "#dc2626",
      color: "white",
      padding: isMobile ? "12px" : "8px",
      textAlign: "center",
      fontSize: isMobile ? "16px" : "14px",
    },
    loadingBar: {
      backgroundColor: "#2563eb",
      color: "white",
      padding: isMobile ? "12px" : "8px",
      textAlign: "center",
      fontSize: isMobile ? "16px" : "14px",
    },
    viewer3D: {
      flex: 1,
      position: "relative",
      minHeight: "300px",
    },
    viewer3DInner: {
      width: "100%",
      height: "100%",
    },
    instructionsPanel: {
      position: "absolute",
      top: isMobile ? "8px" : "16px",
      left: isMobile ? "8px" : "16px",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: isMobile ? "8px" : "12px",
      borderRadius: "6px",
      maxWidth: isMobile ? "calc(100% - 16px)" : "320px",
      fontSize: isMobile ? "14px" : "12px",
    },
    instructionsTitle: {
      fontWeight: "bold",
      marginBottom: "6px",
      fontSize: isMobile ? "16px" : "14px",
    },
    instructionsText: {
      fontSize: isMobile ? "14px" : "12px",
      marginBottom: "4px",
      lineHeight: "1.4",
    },
    infoPanel: {
      position: "absolute",
      top: isMobile ? "8px" : "16px",
      right: isMobile ? "8px" : "16px",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: isMobile ? "8px" : "12px",
      borderRadius: "6px",
    },
    colorIndicator: {
      width: isMobile ? "20px" : "16px",
      height: isMobile ? "20px" : "16px",
      borderRadius: "3px",
      border: "2px solid white",
      backgroundColor: selectedColor,
    },
    helpMessage: {
      position: "absolute",
      bottom: isMobile ? "8px" : "16px",
      left: isMobile ? "8px" : "16px",
      right: isMobile ? "8px" : "16px",
      backgroundColor: "rgba(217, 119, 6, 0.9)",
      color: "white",
      padding: isMobile ? "10px" : "12px",
      borderRadius: "6px",
    },
    helpTitle: {
      fontWeight: "bold",
      marginBottom: "4px",
      fontSize: isMobile ? "16px" : "14px",
    },
    helpText: {
      fontSize: isMobile ? "14px" : "12px",
      lineHeight: "1.4",
    },
  });

  const styles = getResponsiveStyles();

  return (
    <div style={styles.container}>
      <div style={styles.colorBar} />

      <div style={styles.controlPanel}>
        <div style={styles.controlGroup}>
          <label style={styles.label}>Colores:</label>
          <div style={styles.colorPalette}>
            {predefinedColors.map((color) => (
              <div
                key={color.value}
                style={{
                  ...styles.colorSwatch,
                  backgroundColor: color.value,
                  ...(selectedColor === color.value
                    ? styles.colorSwatchActive
                    : {}),
                }}
                onClick={() => setSelectedColor(color.value)}
                title={color.name}
              />
            ))}
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              style={{
                ...styles.colorSwatch,
                border: "2px solid #6b7280",
                cursor: "pointer",
              }}
              title="Color personalizado"
            />
          </div>
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={wireframe}
              onChange={(e) => setWireframe(e.target.checked)}
              style={styles.checkbox}
            />
            Wireframe
          </label>
        </div>

        {!productId && (
          <button onClick={loadSampleModel} style={styles.button}>
            Cargar Modelo de Ejemplo
          </button>
        )}

        <button onClick={resetCamera} style={styles.button}>
          Resetear Vista
        </button>
      </div>

      {error && (
        <div style={styles.errorBar}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div style={styles.loadingBar}>Cargando modelo desde API...</div>
      )}

      <div style={styles.viewer3D}>
        <div ref={mountRef} style={styles.viewer3DInner} />

        <div style={styles.instructionsPanel}>
          <h3 style={styles.instructionsTitle}>Controles:</h3>
          <p style={styles.instructionsText}>
            {isMobile
              ? "• Tocar y arrastrar: Rotar"
              : "• Clic y arrastrar: Rotar"}
          </p>
          {!isMobile && (
            <p style={styles.instructionsText}>• Rueda del mouse: Zoom</p>
          )}
          <p style={styles.instructionsText}>• Modelo: {currentObj}</p>
          {productId && (
            <p style={styles.instructionsText}>• ID: {productId}</p>
          )}
        </div>

        <div style={styles.infoPanel}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: isMobile ? "14px" : "12px" }}>Color:</span>
            <div style={styles.colorIndicator} />
          </div>
        </div>

        {apiStatus === "unavailable" && (
          <div style={styles.helpMessage}>
            <h4 style={styles.helpTitle}>💡 Sugerencia para API local:</h4>
            <p style={styles.helpText}>
              Para usar la API desde localhost, copia este código a tu proyecto
              local o configura CORS en tu servidor. El modelo se cargará
              automáticamente cuando la API esté disponible.
            </p>
          </div>
        )}
      </div>

      <div style={styles.colorBar} />
    </div>
  );
};

export default Productvista;
