import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, useGLTF, Environment, useAnimations } from '@react-three/drei'
import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'

function AnimatedModel({ path = "/models/AnimTestModel.glb" }) {
  const group = useRef()
  const { scene, animations } = useGLTF(path)
  const { actions } = useAnimations(animations, group)

  // Применяем материалы ко всем мешам
  scene.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: '#c4c9d1',
        roughness: 0.14,
        clearcoat: 0.4,
        metalness: 0.85,
        clearcoatRoughness: 1.0,
        transmission: 0.12,
        transparent: false
      })
    }
  })

  // Автоматический запуск анимации при загрузке
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const actionName = Object.keys(actions)[0]
      actions[actionName]?.play()
      console.log('Запущена анимация:', actionName)
    } else {
      console.warn('Анимации не найдены в модели')
    }
  }, [actions])

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        position={[0, 0, 0]}
        scale={1}
      />
    </group>
  )
}

export default function BasicScene() {
  return (
    <Canvas 
      // Стили для фона
      style={{ 
        width: '100vw', 
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0
      }}
      // Указываем источник событий
      eventSource={document.body}
      camera={{ position: [0, 0, 5], fov: 75 }}
    >
      <Suspense fallback={null}>
        <Environment 
          files="/hdri/studio.exr"
          background={true}
          environmentIntensity={0.6}
        />
        
        <pointLight position={[5, 4, 4]} intensity={5}/>
        <pointLight position={[-5, 3, 8]} intensity={5}/>
        
        <AnimatedModel path="/models/AnimTestModel.glb" />
        
        <Box position={[-1.5, 0, 0]}>
          <meshStandardMaterial 
            color="orange" 
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
        
        {/* OrbitControls для фона */}
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.6}
          rotateSpeed={0.8}
          panSpeed={0.8}
          // Дополнительные настройки для лучшего UX
          maxPolarAngle={Math.PI}
          minDistance={3}
          maxDistance={15}
          // Указываем элемент для событий мыши
          domElement={document.body}
        />
      </Suspense>
    </Canvas>
  )
}