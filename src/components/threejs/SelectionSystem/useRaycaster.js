// src/components/threejs/SelectionSystem/useRaycaster.js
import { useThree } from '@react-three/fiber';
import { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export const useRaycaster = () => {
  const { camera, scene, gl, size } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  
  const [hoveredMesh, setHoveredMesh] = useState(null);
  const [selectedMesh, setSelectedMesh] = useState(null);
  const [intersectionPoint, setIntersectionPoint] = useState(null);

  // Функция для преобразования координат мыши в нормализованные координаты
  const getMousePosition = useCallback((event) => {
    const rect = gl.domElement.getBoundingClientRect();
    
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }, [gl]);

  // Функция для выполнения raycast
  const performRaycast = useCallback((event, meshFilter = null) => {
    getMousePosition(event);
    
    raycaster.current.setFromCamera(mouse.current, camera);
    
    // Получаем все объекты в сцене
    const allObjects = [];
    scene.traverse((object) => {
      if (object.isMesh && object.visible) {
        // Фильтрация по условию если нужно
        if (!meshFilter || meshFilter(object)) {
          allObjects.push(object);
        }
      }
    });
    
    const intersects = raycaster.current.intersectObjects(allObjects, true);
    
    if (intersects.length > 0) {
      const intersect = intersects[0];
      return {
        mesh: intersect.object,
        point: intersect.point,
        distance: intersect.distance,
        uv: intersect.uv
      };
    }
    
    return null;
  }, [camera, scene, gl, getMousePosition]);

  // Функция для обработки клика
  const handleClick = useCallback((event, onMeshClick) => {
    const result = performRaycast(event);
    
    if (result && onMeshClick) {
      onMeshClick(result.mesh, result.point, result.distance);
      setSelectedMesh(result.mesh);
      setIntersectionPoint(result.point);
    } else {
      setSelectedMesh(null);
      setIntersectionPoint(null);
    }
    
    return result;
  }, [performRaycast]);

  // Функция для обработки наведения
  const handleHover = useCallback((event, onMeshHover) => {
    const result = performRaycast(event);
    
    if (result && onMeshHover) {
      onMeshHover(result.mesh, result.point);
      setHoveredMesh(result.mesh);
    } else {
      if (hoveredMesh && onMeshHover) {
        onMeshHover(null, null);
      }
      setHoveredMesh(null);
    }
    
    return result;
  }, [performRaycast, hoveredMesh]);

  return {
    // Состояние
    hoveredMesh,
    selectedMesh,
    intersectionPoint,
    
    // Функции
    performRaycast,
    handleClick,
    handleHover,
    
    // Утилиты
    getMousePosition,
    setSelectedMesh,
    clearSelection: () => {
      setSelectedMesh(null);
      setHoveredMesh(null);
      setIntersectionPoint(null);
    }
  };
};