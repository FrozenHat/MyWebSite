// src/components/threejs/DetailPopup/DetailCard.jsx
import { useState } from 'react';
import { getMeshDetails, getGroupInfo } from '../config/modelDetails';

const DetailCard = ({ 
  mesh, 
  isOpen, 
  onClose,
  onIsolateGroup,
  onReturnCamera // новая функция
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCameraOrbital, setIsCameraOrbital] = useState(false);
  
  if (!isOpen || !mesh) return null;
  
  const meshDetails = getMeshDetails(mesh.name);
  const groupInfo = getGroupInfo(meshDetails.group);

  const handleReturnCamera = () => {
    if (onReturnCamera) {
      onReturnCamera();
      setIsCameraOrbital(true);
    }
  };

  const handleClose = () => {
    onClose();
    setIsCameraOrbital(false);
  };

  return (
    <div className={`detail-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="detail-card-header">
        <div className="detail-card-title">
          <h3>{meshDetails.name}</h3>
          <div className="detail-card-group" style={{ color: groupInfo.color }}>
            {groupInfo.name}
          </div>
        </div>
        
        <button 
          className="detail-card-close"
          onClick={handleClose}
          aria-label="Закрыть карточку"
        >
          ✕
        </button>
      </div>
      
      <div className="detail-card-content">
        <div className="detail-card-section">
          <h4>Описание</h4>
          <p>{meshDetails.description}</p>
        </div>
        
        <div className="detail-card-section">
          <h4>Характеристики</h4>
          <div className="detail-card-specs">
            <div className="spec-item">
              <span className="spec-label">Группа:</span>
              <span className="spec-value">{groupInfo.name}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Важность:</span>
              <span className={`spec-value importance-${meshDetails.importance}`}>
                {meshDetails.importance === 'critical' ? 'Критическая' : 
                 meshDetails.importance === 'high' ? 'Высокая' : 
                 meshDetails.importance === 'medium' ? 'Средняя' : 'Низкая'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="detail-card-actions">
        {!isCameraOrbital && (
          <button 
            className="detail-card-btn primary"
            onClick={handleReturnCamera}
          >
            🎥 Вернуть управление камерой
          </button>
        )}
        
        <button 
          className="detail-card-btn secondary"
          onClick={() => onIsolateGroup(meshDetails.group)}
        >
          👁️ Изолировать группу
        </button>
        
        {meshDetails.link && (
          <button 
            className="detail-card-btn link"
            onClick={() => window.open(meshDetails.link, '_blank')}
          >
            📖 Документация
          </button>
        )}
      </div>
      
      <div className="detail-card-hint">
        {isCameraOrbital ? (
          <small>Камера в орбитальном режиме. Закройте карточку чтобы вернуться к общему виду.</small>
        ) : (
          <small>Нажмите "Вернуть управление камерой" чтобы вращать камеру вокруг детали</small>
        )}
      </div>
    </div>
  );
};

export default DetailCard;