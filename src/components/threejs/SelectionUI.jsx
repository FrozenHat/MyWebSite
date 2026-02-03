// src/components/threejs/SelectionUI.jsx
import { useCallback } from 'react';
import { getMeshDetails } from './config/modelDetails';
import DetailCard from './DetailPopup/DetailCard';

const SelectionUI = ({ 
  selectionState,
  updateSelection,
  clearSelection,
  orbitControlsRef,
  onReturnCamera 
}) => {
  
  const handleCloseDetailCard = useCallback(() => {
    updateSelection({
      detailCardOpen: false,
      selectedMesh: null,
      isCameraFocused: false
    });
    
    clearSelection();
  }, [updateSelection, clearSelection]);
  
  const handleIsolateGroup = useCallback((groupId) => {
    console.log(`Isolating group: ${groupId}`);
    alert(`Группа "${groupId}" изолирована. В разработке...`);
  }, []);

  // Если карточка не открыта - не рендерим UI
  if (!selectionState.detailCardOpen) {
    return null;
  }

  const meshDetails = selectionState.selectedMesh ? 
    getMeshDetails(selectionState.selectedMesh.name) : null;

  return (
    <>
      {/* Полная карточка детали */}
     <DetailCard 
        mesh={selectionState.selectedMesh}
        isOpen={selectionState.detailCardOpen}
        onClose={handleCloseDetailCard}
        onIsolateGroup={handleIsolateGroup}
        onReturnCamera={onReturnCamera} // передаем
      />
    </>
  );
};

export default SelectionUI;