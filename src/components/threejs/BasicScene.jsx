// BasicScene.jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, useAnimations, useTexture, Html } from '@react-three/drei'
import { Suspense, useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { MaterialApplier } from './materials'

// Создаем AnimatedModel с использованием forwardRef для внешнего доступа
const AnimatedModel = forwardRef(({ 
  path = "/models/AnimTestModel3.glb"
}, ref) => {
  const group = useRef()
  const mixerRef = useRef()
  const clockRef = useRef(new THREE.Clock())
  const animationFrameId = useRef()
  
  // Локальное состояние для управления
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationTime, setAnimationTime] = useState(0)
  const [animationDuration, setAnimationDuration] = useState(1)
  
  // Refs для стабильного доступа в RAF
  const isPlayingRef = useRef(false)
  const animationTimeRef = useRef(0)
  
  const { scene, animations } = useGLTF(path)
  const { actions, mixer } = useAnimations(animations, group)

  // Загружаем текстуры
  const [roughnessMapTexture, normalMapTexture] = useTexture([
    "./models/textures/roughness.jpg",
    "./models/textures/normal.jpg"
  ])

  // Настраиваем текстуры
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
      
      // Получаем длительность анимации
      const duration = animations[0].duration
      console.log('Длительность анимации:', duration)
      
      setAnimationDuration(duration)
      
      // Настраиваем анимацию
      const actionName = Object.keys(actions)[0]
      const action = actions[actionName]
      
      if (action) {
        action.play()
        action.paused = true // Начинаем с паузы
        action.time = 0
        mixerRef.current.update(0)
      }
    }
    
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [actions, animations])

  // Экспортируем API управления через ref
  useImperativeHandle(ref, () => ({
    play: () => {
      if (!isPlayingRef.current) {
        setIsPlaying(true)
        isPlayingRef.current = true
        animationTimeRef.current = animationTime
        
        const actionName = Object.keys(actions)[0]
        const action = actions[actionName]
        if (action) {
          action.paused = false
          action.time = animationTimeRef.current
          clockRef.current.start()
        }
        
        startAnimationLoop()
      }
    },
    
    pause: () => {
      if (isPlayingRef.current) {
        setIsPlaying(false)
        isPlayingRef.current = false
        
        const actionName = Object.keys(actions)[0]
        const action = actions[actionName]
        if (action) {
          action.paused = true
        }
        
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current)
          animationFrameId.current = null
        }
      }
    },
    
    setTime: (time) => {
      const newTime = Math.max(0, Math.min(time, animationDuration))
      setAnimationTime(newTime)
      animationTimeRef.current = newTime
      
      const actionName = Object.keys(actions)[0]
      const action = actions[actionName]
      if (action) {
        action.time = newTime
        action.paused = true // При ручном управлении ставим на паузу
        mixerRef.current.update(0)
        
        // Если анимация играла, останавливаем
        if (isPlayingRef.current) {
          setIsPlaying(false)
          isPlayingRef.current = false
          if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current)
            animationFrameId.current = null
          }
        }
      }
    },
    
    reset: () => {
      const actionName = Object.keys(actions)[0]
      const action = actions[actionName]
      if (action) {
        action.time = 0
        action.paused = true
        mixerRef.current.update(0)
      }
      
      setAnimationTime(0)
      animationTimeRef.current = 0
      setIsPlaying(false)
      isPlayingRef.current = false
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
    },
    
    getState: () => ({
      isPlaying: isPlayingRef.current,
      time: animationTimeRef.current,
      duration: animationDuration,
      progress: animationDuration > 0 ? (animationTimeRef.current / animationDuration) * 100 : 0
    })
  }), [actions, animationDuration])

  // Функция для запуска цикла анимации
  const startAnimationLoop = useCallback(() => {
    let lastUpdateTime = 0
    const updateInterval = 1000 / 30 // 30 FPS для обновления UI
    
    const animate = () => {
      if (!isPlayingRef.current || !mixerRef.current) {
        return
      }
      
      // Обновляем анимацию Three.js
      const delta = clockRef.current.getDelta()
      mixerRef.current.update(delta)
      
      // Получаем текущее время из анимации
      if (mixerRef.current._actions && mixerRef.current._actions.length > 0) {
        const currentTime = mixerRef.current._actions[0].time
        
        // Обновляем ref с текущим временем
        animationTimeRef.current = currentTime
        
        // Обновляем состояние для UI с регулируемой частотой
        const now = Date.now()
        if (now - lastUpdateTime > updateInterval) {
          setAnimationTime(currentTime)
          lastUpdateTime = now
          
          // Проверяем, не закончилась ли анимация
          if (currentTime >= animationDuration) {
            setIsPlaying(false)
            isPlayingRef.current = false
            setAnimationTime(0)
            animationTimeRef.current = 0
            
            const actionName = Object.keys(actions)[0]
            const action = actions[actionName]
            if (action) {
              action.time = 0
              action.paused = true
            }
            
            cancelAnimationFrame(animationFrameId.current)
            animationFrameId.current = null
            return
          }
        }
      }
      
      animationFrameId.current = requestAnimationFrame(animate)
    }
    
    animationFrameId.current = requestAnimationFrame(animate)
  }, [actions, animationDuration])

  // Синхронизируем ref с состоянием
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])
  
  useEffect(() => {
    animationTimeRef.current = animationTime
  }, [animationTime])

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        position={[0, 0, 0]}
        scale={1}
      />
      
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
    </group>
  )
})

// Компонент панели управления
const AnimationControls = ({ modelRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(1);
  const updateIntervalRef = useRef();
  
  // Форматирование времени
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
  };
  
  // Обновляем состояние из модели
  const updateState = useCallback(() => {
    if (modelRef.current) {
      const state = modelRef.current.getState();
      setIsPlaying(state.isPlaying);
      setAnimationTime(state.time);
      setAnimationDuration(state.duration);
    }
  }, [modelRef]);
  
  // Запускаем интервал для обновления UI
  useEffect(() => {
    updateState(); // начальное обновление
    updateIntervalRef.current = setInterval(updateState, 1000 / 30); // 30 FPS
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [updateState]);
  
  // Обработчики
  const handlePlayPause = useCallback(() => {
    if (modelRef.current) {
      if (isPlaying) {
        modelRef.current.pause();
      } else {
        modelRef.current.play();
      }
    }
  }, [isPlaying, modelRef]);
  
  const handleReset = useCallback(() => {
    if (modelRef.current) {
      modelRef.current.reset();
      updateState(); // принудительно обновляем состояние
    }
  }, [modelRef, updateState]);
  
  const handleTimeChange = useCallback((value) => {
    const newTime = parseFloat(value);
    if (modelRef.current) {
      modelRef.current.setTime(newTime);
      setAnimationTime(newTime); // немедленно обновляем слайдер
    }
  }, [modelRef]);
  
  // Обработка изменения слайдера (для лучшей отзывчивости)
  const [isDragging, setIsDragging] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  
  useEffect(() => {
    if (!isDragging) {
      setSliderValue(animationTime);
    }
  }, [animationTime, isDragging]);
  
  const handleSliderChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    setSliderValue(value);
    handleTimeChange(value);
  }, [handleTimeChange]);
  
  const handleSliderStart = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  const handleSliderEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Вычисляем прогресс
  const progress = animationDuration > 0 ? (animationTime / animationDuration) * 100 : 0;
  
  return (
    <div className="animation-controls-overlay">
      <div className="animation-controls">
        <h3>🎬 Управление анимацией</h3>
        
        <div className="time-display">
          <span>{formatTime(animationTime)}</span>
          <span>/</span>
          <span>{formatTime(animationDuration)}</span>
          <span className="progress-percent">({Math.round(progress)}%)</span>
        </div>

        <div className="progress-control">
          <input
            type="range"
            min="0"
            max={animationDuration}
            step="0.01"
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseDown={handleSliderStart}
            onMouseUp={handleSliderEnd}
            onTouchStart={handleSliderStart}
            onTouchEnd={handleSliderEnd}
            className="progress-slider"
            aria-label="Позиция в анимации"
          />
        </div>

        <div className="controls-buttons">
          <button 
            onClick={handlePlayPause}
            className={`play-pause-btn ${isPlaying ? 'paused' : 'playing'}`}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? '⏸ Пауза' : '▶ Воспроизвести'}
          </button>
          
          <button 
            onClick={handleReset}
            className="reset-btn"
            aria-label="Сбросить анимацию"
          >
            ⏹ Сбросить
          </button>
        </div>
      </div>
    </div>
  );
};

// Основной компонент сцены
export default function BasicScene() {
  const modelRef = useRef()
  
  return (
    <>
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
        {/* Панель управления через Html компонент */}
          <Html
            position={[0, -.5, 0]}
            center
            distanceFactor={2} // Отключаем 3D позиционирование
            style={{
              position: 'realative',
              bottom: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '400px',
              zIndex: 1000,
              pointerEvents: 'none' 
            }}
          >
            <AnimationControls modelRef={modelRef} />
          </Html>
        <Suspense fallback={null}>
          <Environment 
            files="/hdri/studio.exr"
            background={true}
            environmentIntensity={0.4}
          />
          
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
            ref={modelRef}
            path="/models/AnimTestModel3.glb"
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
    </>
  )
}