// src/components/threejs/VisualFeedback/SimpleHighlight.jsx
import { useEffect } from 'react';
import * as THREE from 'three';

const SimpleHighlight = ({ selectedMesh, hoveredMesh }) => {
  useEffect(() => {
    if (selectedMesh && selectedMesh.material) {
      // Сохраняем оригинальный цвет
      const originalColor = selectedMesh.material.color?.clone() || new THREE.Color(0xffffff);
      selectedMesh.userData.originalColor = originalColor;
      
      // Устанавливаем цвет выделения
      selectedMesh.material.color.set(0x00ff00);
      selectedMesh.material.emissive = new THREE.Color(0x003300);
      selectedMesh.material.emissiveIntensity = 0.3;
    }
    
    return () => {
      if (selectedMesh && selectedMesh.material && selectedMesh.userData.originalColor) {
        // Восстанавливаем оригинальный цвет
        selectedMesh.material.color.copy(selectedMesh.userData.originalColor);
        selectedMesh.material.emissive.set(0x000000);
        selectedMesh.material.emissiveIntensity = 0;
      }
    };
  }, [selectedMesh]);
  
  useEffect(() => {
    if (hoveredMesh && hoveredMesh !== selectedMesh && hoveredMesh.material) {
      // Сохраняем оригинальный цвет
      const originalColor = hoveredMesh.material.color?.clone() || new THREE.Color(0xffffff);
      hoveredMesh.userData.hoverOriginalColor = originalColor;
      
      // Устанавливаем цвет наведения
      hoveredMesh.material.color.set(0xffff00);
      hoveredMesh.material.emissive = new THREE.Color(0x333300);
      hoveredMesh.material.emissiveIntensity = 0.2;
    }
    
    return () => {
      if (hoveredMesh && hoveredMesh.material && hoveredMesh.userData.hoverOriginalColor) {
        // Восстанавливаем оригинальный цвет
        hoveredMesh.material.color.copy(hoveredMesh.userData.hoverOriginalColor);
        hoveredMesh.material.emissive.set(0x000000);
        hoveredMesh.material.emissiveIntensity = 0;
      }
    };
  }, [hoveredMesh, selectedMesh]);
  
  return null; // Этот компонент не рендерит ничего, только изменяет материалы
};

export default SimpleHighlight;