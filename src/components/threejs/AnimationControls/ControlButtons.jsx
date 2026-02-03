// components/threejs/AnimationControls/ControlButtons.jsx
const ControlButtons = ({ isPlaying, onPlayPause, onReset }) => {
  return (
    <div className="controls-buttons">
      <button 
        onClick={onPlayPause}
        className={`play-pause-btn ${isPlaying ? 'paused' : 'playing'}`}
        aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
      >
        {isPlaying ? '⏸ Пауза' : '▶ Воспроизвести'}
      </button>
      
      <button 
        onClick={onReset}
        className="reset-btn"
        aria-label="Сбросить анимацию"
      >
        ⏹ Сбросить
      </button>
    </div>
  );
};

export default ControlButtons;