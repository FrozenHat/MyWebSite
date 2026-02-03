// components/threejs/AnimationControls/index.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import TimeDisplay from './TimeDisplay';
import ProgressSlider from './ProgressSlider';
import ControlButtons from './ControlButtons';

const AnimationControls = ({ modelRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(1);
  const updateIntervalRef = useRef();
  
  // Форматирование времени
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
  };
  
  // Обновляем состояние из модели
  const updateState = useCallback(() => {
    if (modelRef.current) {
      const state = modelRef.current.getState();
      setIsPlaying(state.isPlaying);
      setAnimationTime(state.time);
      setAnimationDuration(state.duration);
    }
  }, [modelRef]);
  
  // Запускаем интервал для обновления UI
  useEffect(() => {
    updateState(); // начальное обновление
    updateIntervalRef.current = setInterval(updateState, 1000 / 30); // 30 FPS
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [updateState]);
  
  // Обработчики
  const handlePlayPause = useCallback(() => {
    if (modelRef.current) {
      if (isPlaying) {
        modelRef.current.pause();
      } else {
        modelRef.current.play();
      }
    }
  }, [isPlaying, modelRef]);
  
  const handleReset = useCallback(() => {
    if (modelRef.current) {
      modelRef.current.reset();
      updateState(); // принудительно обновляем состояние
    }
  }, [modelRef, updateState]);
  
  const handleTimeChange = useCallback((value) => {
    const newTime = parseFloat(value);
    if (modelRef.current) {
      modelRef.current.setTime(newTime);
      setAnimationTime(newTime); // немедленно обновляем слайдер
    }
  }, [modelRef]);
  
  // Обработка изменения слайдера (для лучшей отзывчивости)
  const [isDragging, setIsDragging] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  
  useEffect(() => {
    if (!isDragging) {
      setSliderValue(animationTime);
    }
  }, [animationTime, isDragging]);
  
  const handleSliderChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    setSliderValue(value);
    handleTimeChange(value);
  }, [handleTimeChange]);
  
  const handleSliderStart = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  const handleSliderEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Вычисляем прогресс
  const progress = animationDuration > 0 ? (animationTime / animationDuration) * 100 : 0;
  
  return (
    <div className="animation-controls-overlay">
      <div className="animation-controls">
        <h3>🎬 Управление анимацией</h3>
        
        <div className="time-display">
          <span>{formatTime(animationTime)}</span>
          <span>/</span>
          <span>{formatTime(animationDuration)}</span>
          <span className="progress-percent">({Math.round(progress)}%)</span>
        </div>

        <div className="progress-control">
          <input
            type="range"
            min="0"
            max={animationDuration}
            step="0.01"
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseDown={handleSliderStart}
            onMouseUp={handleSliderEnd}
            onTouchStart={handleSliderStart}
            onTouchEnd={handleSliderEnd}
            className="progress-slider"
            aria-label="Позиция в анимации"
          />
        </div>

        <div className="controls-buttons">
          <button 
            onClick={handlePlayPause}
            className={`play-pause-btn ${isPlaying ? 'paused' : 'playing'}`}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? '⏸ Пауза' : '▶ Воспроизвести'}
          </button>
          
          <button 
            onClick={handleReset}
            className="reset-btn"
            aria-label="Сбросить анимацию"
          >
            ⏹ Сбросить
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimationControls;