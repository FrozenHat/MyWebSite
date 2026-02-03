// src/components/threejs/SelectionSystem/SelectionManager.jsx
import { useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { useRaycaster } from './useRaycaster';
import { useCameraFocus } from './useCameraFocus';
import { getMeshDetails } from '../config/modelDetails';
import { SimpleHighlight, TooltipRenderer } from '../VisualFeedback';

const SelectionManager = ({ 
  modelRef,
  orbitControlsRef,
  selectionState,
  updateSelection
}) => {
  const { gl } = useThree();
  
  const {
    hoveredMesh,
    selectedMesh,
    handleClick,
    handleHover
  } = useRaycaster();
  
  const {
    focusOnMesh,
    returnToOriginalView,
    isAnimating
  } = useCameraFocus(orbitControlsRef);
  
  // Синхронизируем состояние raycast с внешним состоянием
  useEffect(() => {
    if (hoveredMesh !== selectionState.hoveredMesh) {
      updateSelection({ hoveredMesh });
    }
  }, [hoveredMesh, selectionState.hoveredMesh, updateSelection]);
  
  // Обработчик клика по mesh
  const handleMeshClick = useCallback(async (mesh, point, distance) => {
    if (!mesh) return;
    
    const meshDetails = getMeshDetails(mesh.name);
    
    console.log(`Selected: ${meshDetails.name}`);
    
    // Сразу открываем карточку детали
    updateSelection({
      selectedMesh: mesh,
      detailCardOpen: true,
      isCameraFocused: true
    });
    
    // Фокусируем камеру на mesh (асинхронно)
    try {
      await focusOnMesh(mesh);
      console.log('Camera focus animation completed');
    } catch (error) {
      console.error('Camera focus animation failed:', error);
    }
  }, [focusOnMesh, updateSelection]);
  
  // Обработчик наведения на mesh
  const handleMeshHover = useCallback((mesh, point) => {
    updateSelection({ hoveredMesh: mesh });
  }, [updateSelection]);
  
  // Обработка кликов по canvas
  useEffect(() => {
    const canvas = gl.domElement;
    
    const onClick = (event) => {
      handleClick(event, handleMeshClick);
    };
    
    const onMouseMove = (event) => {
      handleHover(event, handleMeshHover);
    };
    
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onMouseMove);
    
    return () => {
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, [gl, handleClick, handleHover, handleMeshClick, handleMeshHover]);

  return (
    <>
      <SimpleHighlight 
        selectedMesh={selectionState.selectedMesh}
        hoveredMesh={selectionState.hoveredMesh}
      />
      
      <TooltipRenderer 
        hoveredMesh={selectionState.hoveredMesh}
        selectedMesh={selectionState.selectedMesh}
      />
    </>
  );
};

export default SelectionManager;