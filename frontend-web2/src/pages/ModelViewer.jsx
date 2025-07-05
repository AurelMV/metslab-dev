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

function CenteredModel({ url, onCenterComputed }) {
  const gltf = useLoader(GLTFLoader, url);
  const modelRef = useRef();

  useLayoutEffect(() => {
    if (gltf.scene && !modelRef.current) {
      const model = gltf.scene.clone();
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      model.scale.setScalar(scale);

      const centerX = (box.max.x + box.min.x) / 2;
      const centerZ = (box.max.z + box.min.z) / 2;
      const baseY = box.min.y;
      model.position.set(-centerX * scale, -baseY * scale, -centerZ * scale);

      if (onCenterComputed) {
        const newBox = new THREE.Box3().setFromObject(model);
        const newCenter = new THREE.Vector3();
        newBox.getCenter(newCenter);
        onCenterComputed(newCenter.toArray());
      }

      modelRef.current = model;
    }
  }, [gltf, onCenterComputed]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005;
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
