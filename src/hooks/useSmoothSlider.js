// hooks/useSmoothSlider.js
import { useState, useRef, useCallback, useEffect } from 'react';

export const useSmoothSlider = (initialValue = 0) => {
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [targetValue, setTargetValue] = useState(initialValue);
  const animationRef = useRef(null);
  const startValueRef = useRef(initialValue);
  const startTimeRef = useRef(null);

  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const duration = 500; // 500ms для анимации
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic: начинается быстро, замедляется к концу
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    const currentValue = startValueRef.current + 
      (targetValue - startValueRef.current) * easeProgress;

    setDisplayValue(currentValue);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Завершение анимации
      setDisplayValue(targetValue);
      animationRef.current = null;
      startTimeRef.current = null;
    }
  }, [targetValue]);

  const startAnimation = useCallback((newTargetValue) => {
    // Останавливаем предыдущую анимацию
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    startValueRef.current = displayValue;
    setTargetValue(newTargetValue);
    startTimeRef.current = null;

    // Запускаем новую анимацию
    animationRef.current = requestAnimationFrame(animate);
  }, [displayValue, animate]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    displayValue,
    targetValue,
    startAnimation,
    stopAnimation,
    setDisplayValue,
    setTargetValue
  };
};