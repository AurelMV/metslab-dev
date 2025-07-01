import React, {
  Suspense,
  useRef,
  useLayoutEffect,
  useEffect,
  useState,
} from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; // Corrected import path
import * as THREE from "three";

function CenteredModel({ url, color, onCenterComputed }) {
  const gltf = useLoader(GLTFLoader, url);
  const modelRef = useRef();

  useLayoutEffect(() => {
    if (gltf.scene && !modelRef.current) {
      const model = gltf.scene.clone();
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      // Determine the maximum dimension (width, height, or depth)
      const maxDim = Math.max(size.x, size.y, size.z);
      // Calculate a scale factor to fit the model within a desired dimension (e.g., 2 units)
      const scale = 2 / maxDim;
      model.scale.setScalar(scale); // Apply the uniform scale to the model

      // Calculate the center of the bounding box before scaling
      const centerX = (box.max.x + box.min.x) / 2;
      const centerZ = (box.max.z + box.min.z) / 2;
      const baseY = box.min.y; // Get the lowest Y-coordinate of the model
      model.position.set(-centerX * scale, -baseY * scale, -centerZ * scale);
      if (onCenterComputed) {
        // Recalculate the bounding box after scaling and positioning
        const newBox = new THREE.Box3().setFromObject(model);
        const newCenter = new THREE.Vector3();
        newBox.getCenter(newCenter); // Get the world-space center of the transformed model
        onCenterComputed(newCenter.toArray()); // Pass the center as an array [x, y, z]
      }
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color });
        }
      });
      // Store the transformed model in the ref for rendering
      modelRef.current = model;
    }
  }, [gltf, color, onCenterComputed]); // Dependencies for useLayoutEffect

  // useEffect to update material color if the 'color' prop changes
  useEffect(() => {
    const displayColor = color || "#cccccc"; // Default color if none provided
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          // Handle both single materials and arrays of materials
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          materials.forEach((mat) => {
            if (mat.color) mat.color.set(displayColor);
            // Remove any existing textures to ensure only the pure color is visible
            if (mat.map) mat.map = null;
            if (mat.emissiveMap) mat.emissiveMap = null;
            if (mat.normalMap) mat.normalMap = null;
            if (mat.roughnessMap) mat.roughnessMap = null;
            if (mat.metalnessMap) mat.metalnessMap = null;
          });
        }
      });
    }
  }, [color]);
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005; // Rotate around the Y-axis
    }
  });
  return (
    <group>{modelRef.current && <primitive object={modelRef.current} />}</group>
  );
}
function CameraSetup({ target, showOrbitControls }) {
  // Get the camera from the R3F context
  const { camera } = useThree();
  // Ref for the OrbitControls instance
  const controlsRef = useRef();

  // useEffect to set the camera position and OrbitControls target
  // once the model's center (target) is known.
  useEffect(() => {
    if (target && controlsRef.current) {
      const distance = 5;
      camera.position.set(target[0], target[1] + 1.5, target[2] + distance);
      camera.lookAt(...target); // Make the camera look directly at the target

      // Set the target for OrbitControls to ensure proper orbiting around the model's center
      controlsRef.current.target.set(...target);
      controlsRef.current.update(); // Update controls to apply the new target
    }
  }, [target, camera]); // Dependencies: target (model's center) and camera

  // Render OrbitControls if showOrbitControls is true
  return showOrbitControls ? (
    <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true} />
  ) : null;
}
export default function ModelViewer({
  url, // URL of the GLTF model to load
  color = "#ffffff", // Default color for the model
  showOrbitControls = true, // Whether to show OrbitControls
}) {
  // State to store the computed center of the model
  const [modelCenter, setModelCenter] = useState(null);

  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        maxWidth: 800,
        margin: "auto",
        background: "#f3f4f6", // Light gray background for the container
        borderRadius: "1rem", // Rounded corners for the container
      }}
    >
      <Canvas
        camera={{
          fov: 30, // Field of view
          position: [0, 1.5, 5], // Initial camera position (will be updated by CameraSetup)
          near: 0.1, // Near clipping plane
          far: 1000, // Far clipping plane
        }}
        style={{ background: "#e5e7eb" }} // Light gray background for the canvas
      >
        <ambientLight intensity={1.2} /> {/* General ambient light */}
        <directionalLight
          position={[10, 10, 10]} // Position in world space
          intensity={1.5} // Brightness of the light
          color={new THREE.Color(0.78, 0.79, 1)} // Slightly bluish color
          castShadow // Enables shadows from this light
          shadow-mapSize-width={1024} // Shadow map resolution
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5} // Shadow camera frustum
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight
          position={[-10, 5, -10]}
          intensity={1}
          color={new THREE.Color(1, 0.87, 0.7)}
          castShadow={false} // Does not cast shadows
        />
        <pointLight position={[0, 10, 0]} intensity={1} color="#fff" />
        <Suspense fallback={null}>
          <CenteredModel
            url={url}
            color={color}
            onCenterComputed={setModelCenter}
          />
        </Suspense>
        {modelCenter && (
          <CameraSetup
            target={modelCenter}
            showOrbitControls={showOrbitControls}
          />
        )}
      </Canvas>
    </div>
  );
}
