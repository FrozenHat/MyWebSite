// src/components/threejs/BasicScene.jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Suspense, useRef, useState, useCallback } from 'react'
import AnimatedModel from './AnimatedModel'
import AnimationControls from './AnimationControls'
import SceneEnvironment from './SceneEnvironment'
import SelectionManager from './SelectionSystem/SelectionManager'
import SelectionUI from './SelectionUI'

const BasicScene = () => {
  const modelRef = useRef()
  const orbitControlsRef = useRef()
  
  // Состояние для UI выносим в родительский компонент
  const [selectionState, setSelectionState] = useState({
    hoveredMesh: null,
    selectedMesh: null,
    showPopup: false,
    detailCardOpen: false,
    isCameraFocused: false
  });
  
  const updateSelection = useCallback((updates) => {
    setSelectionState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectionState({
      hoveredMesh: null,
      selectedMesh: null,
      showPopup: false,
      detailCardOpen: false,
      isCameraFocused: false
    });
  }, []);
  
  const handleAnimationLoad = (duration) => {
    console.log('✓ Анимация загружена, длительность:', duration.toFixed(2), 'сек');
  };

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
        <Suspense fallback={null}>
          <SceneEnvironment />
          
          <AnimatedModel 
            ref={modelRef}
            onAnimationLoad={handleAnimationLoad}
          />
          
          {/* SelectionManager внутри Canvas */}
          <SelectionManager 
            modelRef={modelRef}
            orbitControlsRef={orbitControlsRef}
            selectionState={selectionState}
            updateSelection={updateSelection}
          />
          
          <OrbitControls 
            ref={orbitControlsRef}
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
          
          <Html
            position={[0, -0.5, 0]}
            center
            distanceFactor={2}
            style={{
              position: 'relative',
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
        </Suspense>
      </Canvas>
      
      {/* SelectionUI вне Canvas */}
      <SelectionUI 
        selectionState={selectionState}
        updateSelection={updateSelection}
        clearSelection={clearSelection}
        orbitControlsRef={orbitControlsRef}
      />
    </>
  )
}

export default BasicScene;