import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, useAnimations } from '@react-three/drei'
import { Suspense, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'

function AnimatedModel({ 
  path = "/models/MyWebSite3.glb", 
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

  /useEffect(() => {
  if (!scene) return;
   const textureLoader = new THREE.TextureLoader();

  const normalMapTexture = textureLoader.load("./models/textures/normal.jpg");
  normalMapTexture.wrapS = THREE.RepeatWrapping;
  normalMapTexture.wrapT = THREE.RepeatWrapping;
  normalMapTexture.repeat.set(2,2);
  const physicalMaterial = new THREE.MeshPhysicalMaterial({
    color: '#c9d7ee',
    transmission: 0.9,
    thickness: 0.1,
    roughness: 0.1,
    normalMap: normalMapTexture,
    
    // clearcoatNormalMap: normalMapTexture,
    reflectivity:0.5,
    ior:1.45,
    anisotropicBlur:2,
    chromaticAberration: 0.8,
    distortion:2,
    clearcoat:0.8,
    clearcoatRoughness:1,
    backside: true
  });

  scene.traverse((child) => {
    if (child.isMesh) {
      // Если материал - массив
      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => {
          if (material.name === "Glass") {
            return physicalMaterial.clone();
          }
          return material;
        });
      }
      // Если материал одиночный
      else if (child.material.name === "Glass") {
        child.material = physicalMaterial;
      }
    }
  });
}, [scene]);

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
        setIsPlaying(false)
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
    >
      <Suspense fallback={null}>
        <Environment 
          files="/hdri/SceenLight2.exr"
          background={true}
          environmentIntensity={0.6}
        />
        
        <AnimatedModel 
          path="/models/MyWebSite3.glb"
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
          minDistance={2}
          maxDistance={6}
        />
      </Suspense>
    </Canvas>
  )
}