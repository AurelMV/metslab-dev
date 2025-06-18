import React, { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

function Model({ url, color }) {
  const obj = useLoader(OBJLoader, url);
  const meshRef = useRef();

  // Cambia el color de todos los materiales del modelo
  React.useEffect(() => {
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ color });
      }
    });
  }, [obj, color]);

  // Animación opcional
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return <primitive ref={meshRef} object={obj} scale={1.2} />;
}

export default function ModelViewer({ url, color = "#ffffff" }) {
  return (
    <div
      style={{ width: "100%", height: "300px", maxWidth: 400, margin: "auto" }}
    >
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Model url={url} color={color} />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={true} />
      </Canvas>
    </div>
  );
}
