// hooks/useSmoothAnimation.js
import { useRef, useCallback, useEffect } from 'react';

export const useSmoothAnimation = (duration = 500) => {
  const animationFrameRef = useRef();
  const startTimeRef = useRef();
  const startValueRef = useRef(0);
  const targetValueRef = useRef(0);
  const callbackRef = useRef();

  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-out функция (начинает быстро, замедляется к концу)
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    const currentValue = startValueRef.current + 
      (targetValueRef.current - startValueRef.current) * easeProgress;
    
    // Вызываем колбэк с текущим значением
    if (callbackRef.current) {
      callbackRef.current(currentValue);
    }
    
    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Анимация завершена
      startTimeRef.current = null;
      if (callbackRef.current) {
        callbackRef.current(targetValueRef.current);
      }
    }
  }, [duration]);

  const startAnimation = useCallback((from, to, onUpdate) => {
    // Останавливаем предыдущую анимацию
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    startValueRef.current = from;
    targetValueRef.current = to;
    callbackRef.current = onUpdate;
    startTimeRef.current = null;
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return { startAnimation, stopAnimation };
};