// utils/timeFormatters.js
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `${mins}:${secs.padStart(5, '0')}`;
};

export const calculateProgress = (current, total) => {
  return total > 0 ? (current / total) * 100 : 0;
};

export const clampTime = (time, duration) => {
  return Math.max(0, Math.min(time, duration));
};