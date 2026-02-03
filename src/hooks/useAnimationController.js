// hooks/useAnimationController.js
import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';

export const useAnimationController = (actions, duration, ref) => {
  const mixerRef = useRef();
  const clockRef = useRef(new THREE.Clock());
  const animationFrameId = useRef();
  const isPlayingRef = useRef(false);
  const animationTimeRef = useRef(0);
  
  // Получаем первое действие
  const getFirstAction = useCallback(() => {
    if (!actions || Object.keys(actions).length === 0) return null;
    const actionName = Object.keys(actions)[0];
    return actions[actionName];
  }, [actions]);

  // Инициализация миксера
  const initMixer = useCallback((mixer) => {
    mixerRef.current = mixer;
    
    const action = getFirstAction();
    if (action) {
      action.play();
      action.paused = true;
      action.time = 0;
      mixer.update(0);
    }
  }, [getFirstAction]);

  // Цикл анимации
  const startAnimationLoop = useCallback((onTimeUpdate) => {
    let lastUpdateTime = 0;
    const updateInterval = 1000 / 30; // 30 FPS для UI
    
    const animate = () => {
      if (!isPlayingRef.current || !mixerRef.current) {
        return;
      }
      
      // Обновляем анимацию Three.js
      const delta = clockRef.current.getDelta();
      mixerRef.current.update(delta);
      
      // Получаем текущее время из анимации
      if (mixerRef.current._actions && mixerRef.current._actions.length > 0) {
        const currentTime = mixerRef.current._actions[0].time;
        
        // Обновляем ref с текущим временем
        animationTimeRef.current = currentTime;
        
        // Обновляем состояние для UI с регулируемой частотой
        const now = Date.now();
        if (now - lastUpdateTime > updateInterval) {
          if (onTimeUpdate) onTimeUpdate(currentTime);
          lastUpdateTime = now;
          
          // Проверяем, не закончилась ли анимация
          if (currentTime >= duration) {
            isPlayingRef.current = false;
            animationTimeRef.current = 0;
            
            const action = getFirstAction();
            if (action) {
              action.time = 0;
              action.paused = true;
            }
            
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
            return;
          }
        }
      }
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animationFrameId.current = requestAnimationFrame(animate);
  }, [duration, getFirstAction]);

  // Экспортируем API управления через ref
  useEffect(() => {
    if (ref) {
      ref.current = {
        play: () => {
          if (!isPlayingRef.current) {
            isPlayingRef.current = true;
            animationTimeRef.current = animationTimeRef.current || 0;
            
            const action = getFirstAction();
            if (action) {
              action.paused = false;
              action.time = animationTimeRef.current;
              clockRef.current.start();
            }
            
            startAnimationLoop();
          }
        },
        
        pause: () => {
          if (isPlayingRef.current) {
            isPlayingRef.current = false;
            
            const action = getFirstAction();
            if (action) {
              action.paused = true;
            }
            
            if (animationFrameId.current) {
              cancelAnimationFrame(animationFrameId.current);
              animationFrameId.current = null;
            }
          }
        },
        
        setTime: (time) => {
          const newTime = Math.max(0, Math.min(time, duration));
          animationTimeRef.current = newTime;
          
          const action = getFirstAction();
          if (action) {
            action.time = newTime;
            action.paused = true;
            if (mixerRef.current) {
              mixerRef.current.update(0);
            }
            
            // Если анимация играла, останавливаем
            if (isPlayingRef.current) {
              isPlayingRef.current = false;
              if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
              }
            }
          }
          
          return newTime;
        },
        
        reset: () => {
          const action = getFirstAction();
          if (action) {
            action.time = 0;
            action.paused = true;
            if (mixerRef.current) {
              mixerRef.current.update(0);
            }
          }
          
          animationTimeRef.current = 0;
          isPlayingRef.current = false;
          
          if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
          }
          
          return 0;
        },
        
        getState: () => ({
          isPlaying: isPlayingRef.current,
          time: animationTimeRef.current,
          duration: duration,
          progress: duration > 0 ? (animationTimeRef.current / duration) * 100 : 0
        })
      };
    }
  }, [ref, getFirstAction, duration, startAnimationLoop]);

  // Очистка
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, []);

  return {
    initMixer
  };
};