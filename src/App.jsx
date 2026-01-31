import { useRef, useState } from 'react'
import BasicScene from './components/threejs/BasicScene'
import TextMask from './components/TextMask'
import './App.css'

function App() {
  const headerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationTime, setAnimationTime] = useState(0) // Текущее время в секундах
  const [animationDuration, setAnimationDuration] = useState(1) // Длительность в секундах
  const animationRef = useRef()

  // Инициализируем ref для обновления времени
  animationRef.current = {
    time: animationTime,
    setTime: setAnimationTime
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setAnimationTime(0)
  }

  // Обновляем время через слайдер
  const handleTimeChange = (value) => {
    const newTime = parseFloat(value)
    setAnimationTime(newTime)
    // Если анимация играла - останавливаем
    if (isPlaying) {
      setIsPlaying(false)
    }
  }

  // Функция для получения длительности анимации
  const handleAnimationLoad = (duration) => {
    console.log('Анимация загружена, длительность:', duration)
    setAnimationDuration(duration)
  }

  // Форматирование времени
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(2)
    return `${mins}:${secs.padStart(5, '0')}`
  }

  // Вычисляем прогресс в процентах
  const progress = animationDuration > 0 ? (animationTime / animationDuration) * 100 : 0

  return (
    <>
      <BasicScene 
        isPlaying={isPlaying}
        animationTime={animationTime}
        animationDuration={animationDuration}
        onAnimationLoad={handleAnimationLoad}
        onTimeUpdate={setAnimationTime}
      />
      
      {/* Панель управления анимацией */}
      <div className="animation-controls">
        <h3>Управление анимацией</h3>
        
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
            value={animationTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="progress-slider"
          />
        </div>

        <div className="controls-buttons">
          <button 
            onClick={handlePlayPause}
            className={`play-pause-btn ${isPlaying ? 'paused' : 'playing'}`}
          >
            {isPlaying ? ' Пауза' : ' Воспроизвести'}
          </button>
          
          <button 
            onClick={handleReset}
            className="reset-btn"
          >
             Сбросить
          </button>
        </div>
      </div>

      <div className="content-overlay">
        <header className="header" ref={headerRef}>
          <h1 className="header-title">
            <TextMask 
              text="Creators Project" 
              fontSize={36}
              fontWeight="700"
              fontFamily="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              className="main-title"
              smoothing={true}
            />
          </h1>
          
          <nav className="header-nav">
            <a href="#about">
              <TextMask 
                text="Обо мне" 
                fontSize={18}
                fontWeight="500"
                fontFamily="'Segoe UI', Roboto, sans-serif"
                className="nav-link"
                smoothing={true}
              />
            </a>
            <a href="#projects">
              <TextMask 
                text="Проекты" 
                fontSize={18}
                fontWeight="500"
                fontFamily="'Segoe UI', Roboto, sans-serif"
                className="nav-link"
                smoothing={true}
              />
            </a>
            <a href="#contact">
              <TextMask 
                text="Контакты" 
                fontSize={18}
                fontWeight="500"
                fontFamily="'Segoe UI', Roboto, sans-serif"
                className="nav-link"
                smoothing={true}
              />
            </a>
          </nav>
        </header>

        <footer className="footer">
          <p>© 2026 Примеры. </p>
        </footer>
      </div>
    </>
  )
}

export default App