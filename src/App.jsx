// src/App.jsx
import BasicScene from './components/threejs/BasicScene'
import TextMask from './components/TextMask'
import SelectionUI from './components/threejs/SelectionUI'
import AnimationPanel from './components/threejs/AnimationPanel'
import { useState, useCallback, useRef } from 'react'
import './App.css'

function App() {
  const [selectionState, setSelectionState] = useState({
    hoveredMesh: null,
    selectedMesh: null,
    showPopup: false,
    detailCardOpen: false,
    isCameraFocused: false,
    isCameraOrbital: false
  });
  
  const orbitControlsRef = useRef();
  const modelRef = useRef();
  
  const updateSelection = useCallback((updates) => {
    setSelectionState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectionState({
      hoveredMesh: null,
      selectedMesh: null,
      showPopup: false,
      detailCardOpen: false,
      isCameraFocused: false,
      isCameraOrbital: false
    });
  }, []);

  // Функция для возврата камеры в орбитальный режим
  const handleReturnCamera = useCallback(() => {
    if (orbitControlsRef.current) {
      // Включаем контролы обратно
      orbitControlsRef.current.enabled = true;
      orbitControlsRef.current.enableZoom = true;
      orbitControlsRef.current.enablePan = true;
      orbitControlsRef.current.enableRotate = true;
      orbitControlsRef.current.update();
      
      updateSelection({ isCameraOrbital: true });
    }
  }, [updateSelection]);

  return (
    <>
      <BasicScene 
        modelRef={modelRef}
        orbitControlsRef={orbitControlsRef}
        selectionState={selectionState}
        updateSelection={updateSelection}
        clearSelection={clearSelection}
      />
      
      {/* Панель управления анимацией слева */}
      <AnimationPanel modelRef={modelRef} />
      
      {/* Карточка детали справа */}
      <SelectionUI 
        selectionState={selectionState}
        updateSelection={updateSelection}
        clearSelection={clearSelection}
        orbitControlsRef={orbitControlsRef}
        onReturnCamera={handleReturnCamera}
      />
      
      <div className="content-overlay">
        <header className="header">
          <h1 className="header-title">
            <TextMask 
              text="Creators Project" 
              fontSize={36}
              fontWeight="700"
              fontFamily="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              className="main-title"
              smoothing={true}
            />
          </h1>
          
          <nav className="header-nav">
            <a href="#about">
              <TextMask 
                text="Обо мне" 
                fontSize={18}
                fontWeight="500"
                fontFamily="'Segoe UI', Roboto, sans-serif"
                className="nav-link"
                smoothing={true}
              />
            </a>
            <a href="#projects">
              <TextMask 
                text="Проекты" 
                fontSize={18}
                fontWeight="500"
                fontFamily="'Segoe UI', Roboto, sans-serif"
                className="nav-link"
                smoothing={true}
              />
            </a>
            <a href="#contact">
              <TextMask 
                text="Контакты" 
                fontSize={18}
                fontWeight="500"
                fontFamily="'Segoe UI', Roboto, sans-serif"
                className="nav-link"
                smoothing={true}
              />
            </a>
          </nav>
        </header>

        <footer className="footer">
          <p>© 2026 Примеры. Все права защищены.</p>
        </footer>
      </div>
    </>
  )
}

export default App