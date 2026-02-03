// src/components/threejs/SelectionSystem/useCameraFocus.js
import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { getMeshDetails } from '../config/modelDetails';

export const useCameraFocus = (orbitControlsRef) => {
  const { camera } = useThree();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetPosition, setTargetPosition] = useState(null);
  const [targetLookAt, setTargetLookAt] = useState(null);
  const [originalCameraState, setOriginalCameraState] = useState(null);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);
  const startPositionRef = useRef(new THREE.Vector3());
  const startLookAtRef = useRef(new THREE.Vector3());

  // Сохраняем исходное состояние камеры
  const saveCameraState = useCallback(() => {
    if (!originalCameraState && orbitControlsRef?.current) {
      const controls = orbitControlsRef.current;
      setOriginalCameraState({
        position: camera.position.clone(),
        target: controls.target.clone(),
        zoom: camera.zoom
      });
    }
  }, [camera, orbitControlsRef, originalCameraState]);

  // Блокируем/разблокируем OrbitControls
  const setControlsEnabledState = useCallback((enabled) => {
    setControlsEnabled(enabled);
    if (orbitControlsRef?.current) {
      orbitControlsRef.current.enabled = enabled;
      orbitControlsRef.current.enableZoom = enabled;
      orbitControlsRef.current.enablePan = enabled;
      orbitControlsRef.current.enableRotate = enabled;
      
      if (!enabled) {
        orbitControlsRef.current.update();
      }
    }
  }, [orbitControlsRef]);
  // Возвращаем камеру в орбитальный режим (но остаемся сфокусированными на детали)
const switchToOrbitalMode = useCallback(() => {
  if (!orbitControlsRef?.current || isAnimating) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    // Включаем контролы обратно (они были выключены во время анимации)
    setControlsEnabledState(true);
    
    // Обновляем состояние - камера все еще сфокусирована, но в орбитальном режиме
    setIsAnimating(false);
    setTargetPosition(null);
    setTargetLookAt(null);
    
    resolve();
  });
}, [orbitControlsRef, isAnimating, setControlsEnabledState]);

  // Плавное перемещение камеры к mesh
  const focusOnMesh = useCallback((mesh, duration = 1200) => {
    if (!mesh || !orbitControlsRef?.current) return Promise.resolve();
    
    return new Promise((resolve) => {
      saveCameraState();
      
      const meshDetails = getMeshDetails(mesh.name);
      const meshWorldPosition = new THREE.Vector3();
      mesh.getWorldPosition(meshWorldPosition);
      
      // Добавляем смещение из конфига
      const offset = new THREE.Vector3(...meshDetails.cameraSettings.targetOffset);
      const targetPoint = meshWorldPosition.clone().add(offset);
      
      // Рассчитываем позицию камеры на основе расстояния из конфига
      const direction = new THREE.Vector3(0, 0.2, 1).normalize();
      const cameraDistance = meshDetails.cameraSettings.distance;
      const cameraPosition = targetPoint.clone().add(
        direction.multiplyScalar(cameraDistance)
      );
      
      // Настраиваем FOV
      const originalFov = camera.fov;
      camera.fov = meshDetails.cameraSettings.fov;
      camera.updateProjectionMatrix();
      
      // Блокируем контролы на время анимации
      setControlsEnabledState(false);
      
      // Запускаем анимацию
      setIsAnimating(true);
      setTargetPosition(cameraPosition);
      setTargetLookAt(targetPoint);
      
      startPositionRef.current.copy(camera.position);
      startLookAtRef.current.copy(orbitControlsRef.current.target);
      startTimeRef.current = performance.now();
      
      const animate = (timestamp) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }
        
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic функция для плавности
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Интерполируем позицию камеры
        const newPosition = new THREE.Vector3().lerpVectors(
          startPositionRef.current,
          cameraPosition,
          easeProgress
        );
        
        // Интерполируем target камеры
        const newTarget = new THREE.Vector3().lerpVectors(
          startLookAtRef.current,
          targetPoint,
          easeProgress
        );
        
        // Интерполируем FOV
        const newFov = THREE.MathUtils.lerp(
          originalFov,
          meshDetails.cameraSettings.fov,
          easeProgress
        );
        
        // Применяем изменения
        camera.position.copy(newPosition);
        camera.fov = newFov;
        camera.updateProjectionMatrix();
        
        if (orbitControlsRef.current) {
          orbitControlsRef.current.target.copy(newTarget);
          orbitControlsRef.current.update();
        }
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Анимация завершена
          setIsAnimating(false);
          animationRef.current = null;
          resolve();
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    });
  }, [camera, orbitControlsRef, saveCameraState, setControlsEnabledState]);

  // Возврат к исходному виду
  const returnToOriginalView = useCallback((duration = 1200) => {
    if (!originalCameraState || !orbitControlsRef?.current || isAnimating) {
      return Promise.resolve();
    }
    
    return new Promise((resolve) => {
      // Блокируем контролы на время анимации
      setControlsEnabledState(false);
      
      setIsAnimating(true);
      setTargetPosition(null);
      setTargetLookAt(null);
      
      const originalFov = 60; // стандартный FOV
      const currentFov = camera.fov;
      
      startPositionRef.current.copy(camera.position);
      startLookAtRef.current.copy(orbitControlsRef.current.target);
      startTimeRef.current = performance.now();
      
      const animate = (timestamp) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }
        
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Интерполируем позицию камеры
        const newPosition = new THREE.Vector3().lerpVectors(
          startPositionRef.current,
          originalCameraState.position,
          easeProgress
        );
        
        // Интерполируем target камеры
        const newTarget = new THREE.Vector3().lerpVectors(
          startLookAtRef.current,
          originalCameraState.target,
          easeProgress
        );
        
        // Интерполируем FOV
        const newFov = THREE.MathUtils.lerp(
          currentFov,
          originalFov,
          easeProgress
        );
        
        // Применяем изменения
        camera.position.copy(newPosition);
        camera.fov = newFov;
        camera.updateProjectionMatrix();
        
        if (orbitControlsRef.current) {
          orbitControlsRef.current.target.copy(newTarget);
          orbitControlsRef.current.update();
        }
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Анимация завершена
          setIsAnimating(false);
          animationRef.current = null;
          
          // Разблокируем контролы
          setControlsEnabledState(true);
          resolve();
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    });
  }, [camera, orbitControlsRef, originalCameraState, isAnimating, setControlsEnabledState]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Восстанавливаем состояние контролов при размонтировании
      if (orbitControlsRef?.current) {
        orbitControlsRef.current.enabled = true;
        orbitControlsRef.current.enableZoom = true;
        orbitControlsRef.current.enablePan = true;
        orbitControlsRef.current.enableRotate = true;
      }
    };
  }, [orbitControlsRef]);

  return {
    // Состояние
    isAnimating,
    targetPosition,
    targetLookAt,
    originalCameraState,
    controlsEnabled,
    
    // Функции
    focusOnMesh,
    returnToOriginalView,
    setControlsEnabledState,
    
    // Утилиты
    isCameraFocused: () => targetPosition !== null
  };
};