import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import env from "../config/env.jsx"; // Asegúrate de que la ruta sea correcta
const Productvista = ({ productId }) => {
  // Recibe productId como prop
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const controlsRef = useRef(null);
  const frameRef = useRef(null);

  const [selectedColor, setSelectedColor] = useState("#ff6b6b");
  const [wireframe, setWireframe] = useState(false);
  const [currentObj, setCurrentObj] = useState("Ningún objeto cargado");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState(
    env.BASE_URL_API + "/api/modelos/modelo/" // URL base de la API
  );
  const [apiStatus, setApiStatus] = useState("unknown");

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

  // Controles de cámara personalizados
  const setupControls = (camera, renderer) => {
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let rotationX = 0;
    let rotationY = 0;

    const onMouseDown = (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onMouseMove = (event) => {
      if (!isMouseDown) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onWheel = (event) => {
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(2, Math.min(20, camera.position.z));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    domElement.addEventListener("mouseup", onMouseUp);
    domElement.addEventListener("mousemove", onMouseMove);
    domElement.addEventListener("wheel", onWheel);

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
      },
      targetRotationX,
      targetRotationY,
    };
  };

  // Verificar si la API está disponible

  // Cargar modelo desde API con mejor manejo de errores
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
        // Limpiar el objeto anterior si existe
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
          "Error de seguridad: No se puede conectar a la API local desde este entorno. Prueba ejecutar el código en tu servidor local."
        );
      } else if (error.message.includes("CORS")) {
        setError(
          "Error de CORS: El servidor necesita configurar headers CORS para permitir conexiones desde este dominio."
        );
      } else {
        setError(`Error al cargar el modelo: ${error.message}`);
      }
      setApiStatus("unavailable");
    } finally {
      setLoading(false);
    }
  };

  // Generar modelo OBJ de ejemplo como string
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
        // Limpiar el objeto anterior si existe
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
    rendererRef.current = renderer;

    // Evitar duplicados: eliminar cualquier canvas anterior
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // Inicializar controles
    const controls = setupControls(camera, renderer);
    controlsRef.current = controls;

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
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

  // Effect para cargar automáticamente el modelo cuando se recibe el productId
  useEffect(() => {
    if (productId && sceneRef.current) {
      loadModelFromAPI(productId);
    }
  }, [productId, sceneRef.current]); // Se ejecuta cuando cambia productId o cuando se inicializa la escena

  useEffect(() => {
    if (meshRef.current && meshRef.current.material) {
      meshRef.current.material.color.setStyle(selectedColor);
    }
  }, [selectedColor]);

  useEffect(() => {
    if (meshRef.current && meshRef.current.material) {
      meshRef.current.material.wireframe = wireframe;
    }
  }, [wireframe]);

  const handleFileLoad = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const objText = e.target.result;
        const geometry = parseOBJ(objText);

        if (sceneRef.current) {
          // Limpiar el objeto anterior si existe
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
          setCurrentObj(file.name);
          setError(null);
        }
      } catch (error) {
        setError(
          "Error al cargar el archivo .obj. Asegúrate de que sea un archivo válido."
        );
        console.error("Error parsing OBJ:", error);
      }
    };
    reader.readAsText(file);
  };

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 5);
    }
    if (controlsRef.current) {
      controlsRef.current.targetRotationX = 0;
      controlsRef.current.targetRotationY = 0;
    }
  };

  const styles = {
    container: {
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#1f2937",
      fontFamily: "Arial, sans-serif",
    },
    colorBar: {
      height: "8px",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      backgroundColor: selectedColor,
    },
    controlPanel: {
      backgroundColor: "#374151",
      padding: "50px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "50px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      overflowX: "auto",
    },
    controlGroup: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#4b5563",
      padding: "8px",
      borderRadius: "4px",
    },
    label: {
      color: "white",
      fontWeight: "500",
      fontSize: "14px",
    },
    input: {
      backgroundColor: "#6b7280",
      color: "white",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "1px solid #9ca3af",
      fontSize: "14px",
    },
    inputWide: {
      backgroundColor: "#6b7280",
      color: "white",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "1px solid #9ca3af",
      fontSize: "14px",
      width: "256px",
    },
    inputSmall: {
      backgroundColor: "#6b7280",
      color: "white",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "1px solid #9ca3af",
      width: "80px",
    },
    button: {
      padding: "4px 12px",
      borderRadius: "4px",
      border: "none",
      color: "white",
      cursor: "pointer",
      transition: "background-color 0.2s",
      fontSize: "14px",
    },
    buttonBlue: {
      backgroundColor: "#2563eb",
    },
    separator: {
      height: "32px",
      width: "1px",
      backgroundColor: "#9ca3af",
    },
    statusDot: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
    },
    statusDotAvailable: {
      backgroundColor: "#10b981",
    },
    statusDotUnavailable: {
      backgroundColor: "#ef4444",
    },
    statusDotUnknown: {
      backgroundColor: "#f59e0b",
    },
    colorInput: {
      width: "48px",
      height: "32px",
      borderRadius: "4px",
      border: "2px solid #6b7280",
      cursor: "pointer",
    },
    checkboxLabel: {
      color: "white",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
    },
    checkbox: {
      marginRight: "8px",
    },
    errorBar: {
      backgroundColor: "#dc2626",
      color: "white",
      padding: "8px",
      textAlign: "center",
      fontSize: "14px",
    },
    loadingBar: {
      backgroundColor: "#2563eb",
      color: "white",
      padding: "8px",
      textAlign: "center",
    },
    viewer3D: {
      flex: 0.8,
      position: "relative",
    },
    viewer3DInner: {
      width: "100%",
      height: "100%",
    },
    instructionsPanel: {
      position: "absolute",
      top: "16px",
      left: "16px",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "12px",
      borderRadius: "4px",
      maxWidth: "320px",
    },
    instructionsTitle: {
      fontWeight: "bold",
      marginBottom: "8px",
    },
    instructionsText: {
      fontSize: "14px",
      marginBottom: "4px",
    },
    infoPanel: {
      position: "absolute",
      top: "16px",
      right: "16px",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "12px",
      borderRadius: "4px",
    },
    infoPanelRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "8px",
    },
    infoPanelRowLast: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    colorIndicator: {
      width: "24px",
      height: "24px",
      borderRadius: "4px",
      border: "2px solid white",
      backgroundColor: selectedColor,
    },
    helpMessage: {
      position: "absolute",
      bottom: "16px",
      left: "16px",
      right: "16px",
      backgroundColor: "rgba(217, 119, 6, 0.9)",
      color: "white",
      padding: "12px",
      borderRadius: "4px",
    },
    helpTitle: {
      fontWeight: "bold",
      marginBottom: "4px",
    },
    helpText: {
      fontSize: "14px",
    },
    productIdDisplay: {
      color: "#60a5fa",
      fontWeight: "bold",
      fontSize: "16px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.colorBar} />

      <div style={styles.controlPanel}>
        <div style={styles.controlGroup}>
          <label style={styles.label}>Producto ID:</label>
          <span style={styles.productIdDisplay}>
            {productId || "No definido"}
          </span>
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>URL API:</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            style={styles.inputWide}
            placeholder="URL base de la API"
          />
          <div
            style={{
              ...styles.statusDot,
              ...(apiStatus === "available"
                ? styles.statusDotAvailable
                : apiStatus === "unavailable"
                ? styles.statusDotUnavailable
                : styles.statusDotUnknown),
            }}
            title={`API ${apiStatus}`}
          />
        </div>

        <div style={styles.separator} />

        <div style={styles.controlGroup}>
          <label style={styles.label}>Color:</label>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            style={styles.colorInput}
          />
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

        <div style={styles.controlGroup}>
          <button
            onClick={loadSampleModel}
            style={{
              ...styles.button,
              ...styles.buttonBlue,
            }}
          >
            Cargar Ejemplo
          </button>
        </div>
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
          <p style={styles.instructionsText}>• Clic y arrastrar: Rotar</p>
          <p style={styles.instructionsText}>• Rueda del mouse: Zoom</p>
          <p style={styles.instructionsText}>
            • Modelo cargado automáticamente
          </p>
          <p style={styles.instructionsText}>• ID del producto: {productId}</p>
        </div>

        <div style={styles.infoPanel}>
          <div style={styles.infoPanelRow}>
            <span>Estado API:</span>
            <div
              style={{
                ...styles.statusDot,
                ...(apiStatus === "available"
                  ? styles.statusDotAvailable
                  : apiStatus === "unavailable"
                  ? styles.statusDotUnavailable
                  : styles.statusDotUnknown),
              }}
            />
            <span style={{ fontSize: "14px" }}>
              {apiStatus === "available"
                ? "Disponible"
                : apiStatus === "unavailable"
                ? "No disponible"
                : "Desconocido"}
            </span>
          </div>
          <div style={styles.infoPanelRow}>
            <span>Objeto:</span>
            <span style={{ fontSize: "12px", maxWidth: "150px" }}>
              {currentObj}
            </span>
          </div>
          <div style={styles.infoPanelRowLast}>
            <span>Color:</span>
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
