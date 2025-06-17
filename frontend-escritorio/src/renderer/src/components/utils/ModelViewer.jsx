import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { getModelo } from '../../services/model-service'

const ModelViewer = ({ idModelo, width = 500, height = 400, background = '#fff' }) => {
  const mountRef = useRef(null)
  const [objUrl, setObjUrl] = useState(null)

  useEffect(() => {
    if (!idModelo) return
    // Obtiene la URL del modelo desde el servicio
    getModelo(idModelo)
      .then((data) => {
        // data.modelo_url debe contener la URL del archivo .obj
        setObjUrl(data.modelo_url)
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error obteniendo modelo:', err)
      })
  }, [idModelo])

  useEffect(() => {
    if (!objUrl) return

    // Escena, cámara y renderizador
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(background)
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 0, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    // Luz
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(10, 10, 10)
    scene.add(directionalLight)

    // Controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.enablePan = true

    // Cargar modelo OBJ
    const loader = new OBJLoader()
    let objMesh = null
    loader.load(
      objUrl,
      (object) => {
        objMesh = object
        // Centrar y escalar el modelo
        const box = new THREE.Box3().setFromObject(objMesh)
        const size = box.getSize(new THREE.Vector3()).length()
        const center = box.getCenter(new THREE.Vector3())
        objMesh.position.x += objMesh.position.x - center.x
        objMesh.position.y += objMesh.position.y - center.y
        objMesh.position.z += objMesh.position.z - center.z
        const scale = 2 / size
        objMesh.scale.set(scale, scale, scale)
        scene.add(objMesh)
      },
      undefined,
      (error) => {
        // eslint-disable-next-line no-console
        console.error('Error cargando modelo:', error)
      }
    )

    // Animación
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Limpieza
    return () => {
      renderer.dispose();
      controls.dispose();
      if (objMesh) scene.remove(objMesh);
      // Solo intenta remover si el ref existe y contiene el domElement
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    }
    // eslint-disable-next-line
  }, [objUrl, width, height, background])

  return (
    <div
      ref={mountRef}
      style={{
        width,
        height,
        borderRadius: '8px',
        overflow: 'hidden',
        background,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    />
  )
}

export default ModelViewer
