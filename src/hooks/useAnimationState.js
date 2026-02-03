// hooks/useAnimationState.js
import { useState, useRef, useEffect } from 'react';

export const useAnimationState = (initialState = {}) => {
  const [isPlaying, setIsPlaying] = useState(initialState.isPlaying || false);
  const [animationTime, setAnimationTime] = useState(initialState.animationTime || 0);
  const [animationDuration, setAnimationDuration] = useState(initialState.animationDuration || 1);
  
  // Refs для доступа в RAF без триггера ререндеров
  const isPlayingRef = useRef(isPlaying);
  const animationTimeRef = useRef(animationTime);
  const animationDurationRef = useRef(animationDuration);

  // Синхронизация refs с state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    animationTimeRef.current = animationTime;
  }, [animationTime]);

  useEffect(() => {
    animationDurationRef.current = animationDuration;
  }, [animationDuration]);

  const getState = () => ({
    isPlaying: isPlayingRef.current,
    time: animationTimeRef.current,
    duration: animationDurationRef.current,
    progress: animationDurationRef.current > 0 
      ? (animationTimeRef.current / animationDurationRef.current) * 100 
      : 0
  });

  return {
    isPlaying,
    setIsPlaying,
    animationTime,
    setAnimationTime,
    animationDuration,
    setAnimationDuration,
    getState,
    refs: {
      isPlayingRef,
      animationTimeRef,
      animationDurationRef
    }
  };
};