// components/threejs/AnimatedModel/useModelAnimation.js
import { useEffect } from 'react';
import { useAnimationController } from '../../../hooks/useAnimationController';

export const useModelAnimation = ({ 
  actions, 
  mixer, 
  initialDuration,
  onTimeUpdate,
  onAnimationEnd,
  ref 
}) => {
  const animationController = useAnimationController(
    actions, 
    initialDuration, 
    ref
  );

  // Инициализация миксера
  useEffect(() => {
    if (mixer && animationController.initMixer) {
      animationController.initMixer(mixer);
    }
  }, [mixer, animationController]);

  return animationController;
};