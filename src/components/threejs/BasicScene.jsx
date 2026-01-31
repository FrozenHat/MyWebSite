import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, useAnimations, useTexture } from '@react-three/drei'
import { Suspense, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { MaterialApplier, Glass } from './materials' // Импортируем наши компоненты материалов

function AnimatedModel({ 
  path = "/models/AnimTestModel3.glb", 
  isPlaying, 
  animationTime,
  animationDuration,
  onAnimationLoad,
  onTimeUpdate
}) {
  const group = useRef()
  const mixerRef = useRef()
  const clockRef = useRef(new THREE.Clock())
  const animationFrameId = useRef()
  const lastTimeRef = useRef(0)
  
  const { scene, animations } = useGLTF(path)
  const { actions, mixer } = useAnimations(animations, group)

  // Загружаем текстуры с помощью useTexture из drei (более эффективно)
  const [roughnessMapTexture, normalMapTexture] = useTexture([
    "./models/textures/roughness.jpg",
    "./models/textures/normal.jpg"
  ])

  // Настраиваем текстуры после загрузки
  useEffect(() => {
    if (roughnessMapTexture && normalMapTexture) {
      roughnessMapTexture.wrapS = THREE.RepeatWrapping
      roughnessMapTexture.wrapT = THREE.RepeatWrapping
      roughnessMapTexture.repeat.set(8, 8)
      
      normalMapTexture.wrapS = THREE.RepeatWrapping
      normalMapTexture.wrapT = THREE.RepeatWrapping
      normalMapTexture.repeat.set(5, 5)
    }
  }, [roughnessMapTexture, normalMapTexture])

  // Инициализация анимации
  useEffect(() => {
    mixerRef.current = mixer
    
    if (animations && animations.length > 0) {
      console.log('Загружены анимации:', animations.map(a => a.name))
      
      // Получаем длительность первой анимации
      const duration = animations[0].duration
      console.log('Длительность анимации:', duration)
      
      if (onAnimationLoad) {
        onAnimationLoad(duration)
      }
      
      // Настраиваем анимацию
      const actionName = Object.keys(actions)[0]
      const action = actions[actionName]
      
      if (action) {
        // Начинаем с паузы
        action.play()
        action.paused = true
        action.time = animationTime
        mixerRef.current.update(0)
      }
    }
    
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
      }
    }
  }, [actions, animations, onAnimationLoad, animationTime])

  // Функция обновления анимации
  const updateAnimation = useCallback(() => {
    if (!mixerRef.current || !isPlaying) return
    
    const delta = clockRef.current.getDelta()
    mixerRef.current.update(delta)
    
    // Получаем текущее время из активной анимации
    if (mixerRef.current._actions && mixerRef.current._actions.length > 0) {
      const currentTime = mixerRef.current._actions[0].time
      
      // Проверяем, не закончилась ли анимация
      if (currentTime >= animationDuration) {
        // Останавливаем воспроизведение через диспетчер
        if (window.setIsPlaying) window.setIsPlaying(false)
        return
      }
      
      if (onTimeUpdate && Math.abs(currentTime - lastTimeRef.current) > 0.01) {
        lastTimeRef.current = currentTime
        onTimeUpdate(currentTime)
      }
    }
    
    animationFrameId.current = requestAnimationFrame(updateAnimation)
  }, [isPlaying, animationDuration, onTimeUpdate])

  // Управление воспроизведением
  useEffect(() => {
    if (!mixerRef.current || !actions) return
    
    const actionName = Object.keys(actions)[0]
    const action = actions[actionName]
    
    if (!action) return
    
    if (isPlaying) {
      // Включаем воспроизведение
      action.paused = false
      action.time = animationTime
      clockRef.current.start()
      lastTimeRef.current = animationTime
      updateAnimation()
    } else {
      // Останавливаем
      action.paused = true
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
    }
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isPlaying, actions, animationTime, updateAnimation])

  // Установка времени при изменении animationTime
  useEffect(() => {
    if (!mixerRef.current || !actions || isPlaying) return
    
    const actionName = Object.keys(actions)[0]
    const action = actions[actionName]
    
    if (action) {
      action.paused = true
      action.time = Math.min(animationTime, animationDuration)
      mixerRef.current.update(0)
      lastTimeRef.current = animationTime
    }
  }, [animationTime, isPlaying, actions, animationDuration])

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        position={[0, 0, 0]}
        scale={1}
      />
      
      {/* Применяем материал Glass к элементам с именем "Glass" */}
      <MaterialApplier
        modelRef={group}
        target="material:Glass"
        preset={{
          type: 'MeshPhysicalMaterial',
          params: {
            color: '#8e96a4',
            transmission: 0.98,
            roughnessMap: roughnessMapTexture,
            thickness: 0.125,
            roughness: 0.1,
            normalMap: normalMapTexture,
            normalScale: new THREE.Vector2(0.05, 0.02),
            reflectivity: 0.0,
            ior: 1.45,
            clearcoat: 0.8,
            clearcoatRoughnessMap: roughnessMapTexture,
            clearcoatRoughness: 0.4
          }
        }}
        debug={true}
        onApplied={(count) => console.log(`Применен стеклянный материал к ${count} элементам`)}
      />
      
      {/* Альтернативный вариант с готовым компонентом Glass */}
      {/* <Glass 
        modelRef={group}
        target="material:Glass"
        color="#8e96a4"
        transmission={0.98}
        roughnessMap={roughnessMapTexture}
        thickness={0.125}
        roughness={0.1}
        normalMap={normalMapTexture}
        normalScale={new THREE.Vector2(0.05, 0.02)}
        reflectivity={0.0}
        ior={1.45}
        clearcoat={0.8}
        clearcoatRoughnessMap={roughnessMapTexture}
        clearcoatRoughness={0.4}
      /> */}
  
    </group>
  )
}

export default function BasicScene({ 
  isPlaying, 
  animationTime,
  animationDuration,
  onAnimationLoad,
  onTimeUpdate
}) {
  return (
    <Canvas 
      style={{ 
        width: '100vw', 
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0
      }}
      camera={{ position: [-1.6, 0.8, 0], fov: 60 }}
      shadows
    >
      <Suspense fallback={null}>
        <Environment 
          files="/hdri/studio.exr"
          background={true}
          environmentIntensity={0.4}
        />
        
        {/* Добавляем освещение для лучшего отображения PBR материалов */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 3, 2]} intensity={0.5} color="#88aaff" />
        
        <AnimatedModel 
          path="/models/AnimTestModel3.glb"
          isPlaying={isPlaying}
          animationTime={animationTime}
          animationDuration={animationDuration}
          onAnimationLoad={onAnimationLoad}
          onTimeUpdate={onTimeUpdate}
        />
           
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.6}
          rotateSpeed={0.8}
          panSpeed={0.8}
          maxPolarAngle={Math.PI}
          minDistance={1}
          maxDistance={6}
        />
      </Suspense>
    </Canvas>
  )
}