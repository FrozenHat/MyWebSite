// components/threejs/AnimationControls/TimeDisplay.jsx
import { formatTime, calculateProgress } from '../../../utils/timeFormatters';

const TimeDisplay = ({ time, duration }) => {
  const progress = calculateProgress(time, duration);
  
  return (
    <div className="time-display">
      <span>{formatTime(time)}</span>
      <span>/</span>
      <span>{formatTime(duration)}</span>
      <span className="progress-percent">({Math.round(progress)}%)</span>
    </div>
  );
};

export default TimeDisplay;