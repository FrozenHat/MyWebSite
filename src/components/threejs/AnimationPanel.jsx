// src/components/threejs/AnimationPanel.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTime, calculateProgress } from '../../utils/timeFormatters';
//../utils/timeFormatters
const AnimationPanel = ({ modelRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(1);
  const [sliderValue, setSliderValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const updateIntervalRef = useRef(null);
  
  // Форматирование времени
  const formatTimeDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
  };
  
  // Обновляем состояние из модели
  const updateState = useCallback(() => {
    if (modelRef.current && modelRef.current.getState) {
      const state = modelRef.current.getState();
      setIsPlaying(state.isPlaying);
      setAnimationTime(state.time);
      setAnimationDuration(state.duration);
      
      // Обновляем слайдер только если не перетаскиваем
      if (!isDragging) {
        setSliderValue(state.time);
      }
    }
  }, [modelRef, isDragging]);
  
  // Запускаем интервал для обновления UI
  useEffect(() => {
    const update = () => {
      updateState();
    };
    
    // Обновляем сразу
    update();
    
    // Затем обновляем каждые 100ms
    updateIntervalRef.current = setInterval(update, 100);
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [updateState]);
  
  // Обработчики
  const handlePlayPause = useCallback(() => {
    if (!modelRef.current) return;
    
    if (isPlaying) {
      modelRef.current.pause();
    } else {
      modelRef.current.play();
    }
  }, [isPlaying, modelRef]);
  
  const handleReset = useCallback(() => {
    if (!modelRef.current) return;
    
    modelRef.current.reset();
    setIsDragging(false);
  }, [modelRef]);
  
  // Обработка слайдера
  const handleSliderStart = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  const handleSliderEnd = useCallback(() => {
    setIsDragging(false);
    // Синхронизируем после отпускания
    updateState();
  }, [updateState]);
  
  const handleSliderChange = useCallback((newValue) => {
    if (!modelRef.current) return;
    
    setSliderValue(newValue);
    modelRef.current.setTime(newValue);
  }, [modelRef]);
  
  // Синхронизация слайдера при изменении времени
  useEffect(() => {
    if (!isDragging) {
      setSliderValue(animationTime);
    }
  }, [animationTime, isDragging]);
  
  // Вычисляем прогресс
  const progress = calculateProgress(animationTime, animationDuration);
  
  return (
    <div className="animation-panel">
      <div className="animation-panel-header">
        <h3>🎬 Управление анимацией</h3>
        <div className="animation-mode">
          <span className="mode-indicator active">📽️ Режим анимации</span>
        </div>
      </div>
      
      <div className="animation-timeline">
        <div className="time-display">
          <div className="current-time">{formatTimeDisplay(animationTime)}</div>
          <div className="time-separator">/</div>
          <div className="total-time">{formatTimeDisplay(animationDuration)}</div>
          <div className="progress-percent">({Math.round(progress)}%)</div>
        </div>
        
        <div className="progress-control">
          <input
            type="range"
            min="0"
            max={animationDuration}
            step="0.01"
            value={sliderValue}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            onMouseDown={handleSliderStart}
            onMouseUp={handleSliderEnd}
            onTouchStart={handleSliderStart}
            onTouchEnd={handleSliderEnd}
            className="progress-slider"
            aria-label="Позиция в анимации"
          />
          <div className="slider-ticks">
            <span className="tick start">0%</span>
            <span className="tick middle">50%</span>
            <span className="tick end">100%</span>
          </div>
        </div>
      </div>
      
      <div className="animation-controls">
        <div className="control-buttons">
          <button 
            onClick={handlePlayPause}
            className={`control-btn ${isPlaying ? 'pause' : 'play'}`}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? (
              <>
                <span className="icon">⏸</span>
                <span className="label">Пауза</span>
              </>
            ) : (
              <>
                <span className="icon">▶</span>
                <span className="label">Воспроизвести</span>
              </>
            )}
          </button>
          
          <button 
            onClick={handleReset}
            className="control-btn reset"
            aria-label="Сбросить"
          >
            <span className="icon">⏹</span>
            <span className="label">Сбросить</span>
          </button>
        </div>
        
        <div className="animation-presets">
          <div className="presets-label">Анимации:</div>
          <div className="preset-buttons">
            <button className="preset-btn active">Разборка/сборка</button>
            <button className="preset-btn">Принцип работы</button>
          </div>
        </div>
      </div>
      
      <div className="animation-info">
        <div className="info-item">
          <span className="info-label">Статус:</span>
          <span className={`info-value ${isPlaying ? 'playing' : 'paused'}`}>
            {isPlaying ? 'Воспроизводится' : 'На паузе'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Скорость:</span>
          <span className="info-value">1.0x</span>
        </div>
      </div>
    </div>
  );
};

export default AnimationPanel;