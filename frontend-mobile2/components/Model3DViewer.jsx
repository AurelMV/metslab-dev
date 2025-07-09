import React, { useRef } from 'react';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { loadAsync } from 'expo-three/build/loaders/GLTFLoader';

export default function Model3DViewer({ url }) {
  const modelRef = useRef();

  return (
    <GLView
      style={{ width: '100%', height: 300, backgroundColor: '#fff' }}
      onContextCreate={async (gl) => {
        const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 2;

        const renderer = new Renderer({ gl });
        renderer.setSize(width, height);

        // Luz
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 2, 2);
        scene.add(light);

        // Cargar modelo GLB
        const gltf = await loadAsync(url);
        const model = gltf.scene;
        scene.add(model);

        // Centrar y escalar el modelo (opcional)
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.5 / maxDim;
        model.scale.setScalar(scale);
        box.setFromObject(model);
        box.getCenter(model.position).multiplyScalar(-1);

        // Animación/render loop
        const render = () => {
          requestAnimationFrame(render);
          model.rotation.y += 0.01; // Rotación automática
          renderer.render(scene, camera);
          gl.endFrameEXP();
        };
        render();
      }}
    />
  );
}