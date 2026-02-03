// src/components/threejs/VisualFeedback/SelectionGlow.jsx
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const SelectionGlow = ({ selectedMesh, color = 0x00ff00 }) => {
  const glowRef = useRef();
  const originalMaterialRef = useRef();

  useEffect(() => {
    if (!selectedMesh || !glowRef.current) return;

    // Сохраняем оригинальный материал
    if (selectedMesh.material) {
      originalMaterialRef.current = selectedMesh.material;
    }

    // Создаем материал с свечением
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.FrontSide
    });

    // Применяем материал для свечения
    selectedMesh.material = glowMaterial;

    // Создаем клон mesh для внешнего свечения
    const glowMesh = selectedMesh.clone();
    glowMesh.material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    
    // Немного увеличиваем для эффекта свечения
    glowMesh.scale.multiplyScalar(1.05);
    
    glowRef.current.add(glowMesh);

    return () => {
      // Восстанавливаем оригинальный материал
      if (originalMaterialRef.current) {
        selectedMesh.material = originalMaterialRef.current;
      }
      
      // Очищаем glow mesh
      if (glowRef.current) {
        glowRef.current.clear();
      }
    };
  }, [selectedMesh, color]);

  return <group ref={glowRef} />;
};

export default SelectionGlow;