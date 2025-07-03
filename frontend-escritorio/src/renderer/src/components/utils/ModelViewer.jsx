import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { getModelo } from '../../services/model-service'

const ModelViewer = ({
  idModelo,
  width = 500,
  height = 400,
  background = '#f3f4f6',
  color = '#ffffff'
}) => {
  const mountRef = useRef(null)
  const [modelUrl, setModelUrl] = useState(null)

  useEffect(() => {
    if (!idModelo) return
    const token = localStorage.getItem('token')
    getModelo(idModelo, token)
      .then((data) => setModelUrl(data.modelo_url))
      .catch((err) => console.error('Error obteniendo modelo:', err))
  }, [idModelo])

  useEffect(() => {
    if (!modelUrl) return

    // Escena, cámara y renderizador
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(background)
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000)
    camera.position.set(0, 1.5, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    // Luces similares al visor web
    scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const dirLight1 = new THREE.DirectionalLight(0xc7c9ff, 1.5)
    dirLight1.position.set(10, 10, 10)
    scene.add(dirLight1)
    const dirLight2 = new THREE.DirectionalLight(0xffdeb3, 1)
    dirLight2.position.set(-10, 5, -10)
    scene.add(dirLight2)
    scene.add(new THREE.PointLight(0xffffff, 1).position.set(0, 10, 0))

    // Controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.enablePan = false

    // Cargar modelo GLB
    const loader = new GLTFLoader()
    let gltfScene = null
    let target = new THREE.Vector3(0, 0, 0)

    loader.load(
      modelUrl,
      (gltf) => {
        gltfScene = gltf.scene

        // Centrado y escalado igual que en la web
        const box = new THREE.Box3().setFromObject(gltfScene)
        const size = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2 / maxDim
        gltfScene.scale.setScalar(scale)

        // Centro en X y Z, base en Y=0
        const centerX = (box.max.x + box.min.x) / 2
        const centerZ = (box.max.z + box.min.z) / 2
        const baseY = box.min.y
        gltfScene.position.set(-centerX * scale, -baseY * scale, -centerZ * scale)

        // Color sólido (opcional)
        gltfScene.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({ color })
          }
        })

        // Calcular centro para órbita
        const newBox = new THREE.Box3().setFromObject(gltfScene)
        const newCenter = new THREE.Vector3()
        newBox.getCenter(newCenter)
        target.copy(newCenter)
        controls.target.copy(target)
        controls.update()

        scene.add(gltfScene)
      },
      undefined,
      (error) => {
        console.error('Error cargando modelo:', error)
      }
    )

    // Animación (rotación automática)
    const animate = () => {
      requestAnimationFrame(animate)
      if (gltfScene) {
        gltfScene.rotation.y += 0.005
      }
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Limpieza
    return () => {
      renderer.dispose()
      controls.dispose()
      if (gltfScene) scene.remove(gltfScene)
      if (
        mountRef.current &&
        renderer.domElement &&
        mountRef.current.contains(renderer.domElement)
      ) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [modelUrl, width, height, background, color])

  return (
    <div
      ref={mountRef}
      style={{
        width,
        height,
        borderRadius: '16px',
        overflow: 'hidden',
        background,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    />
  )
}

export default ModelViewer
