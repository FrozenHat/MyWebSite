// components/threejs/AnimationControls/ProgressSlider.jsx
import { useCallback } from 'react';

const ProgressSlider = ({ 
  value, 
  duration, 
  onChange,
  onStart,
  onEnd
}) => {
  const handleChange = useCallback((e) => {
    const newValue = parseFloat(e.target.value);
    if (onChange) onChange(newValue);
  }, [onChange]);

  const handleMouseDown = useCallback(() => {
    if (onStart) onStart();
  }, [onStart]);

  const handleMouseUp = useCallback(() => {
    if (onEnd) onEnd();
  }, [onEnd]);

  return (
    <div className="progress-control">
      <input
        type="range"
        min="0"
        max={duration || 1}
        step="0.01"
        value={value || 0}
        onChange={handleChange}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className="progress-slider"
        aria-label="Позиция в анимации"
      />
    </div>
  );
};

export default ProgressSlider;