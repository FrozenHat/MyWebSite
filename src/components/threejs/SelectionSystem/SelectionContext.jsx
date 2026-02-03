// src/components/threejs/SelectionSystem/SelectionContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const SelectionContext = createContext(null);

export const SelectionProvider = ({ children }) => {
  const [selectionState, setSelectionState] = useState({
    hoveredMesh: null,
    selectedMesh: null,
    showPopup: false,
    detailCardOpen: false,
    isCameraFocused: false
  });

  const updateSelection = useCallback((updates) => {
    setSelectionState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState({
      hoveredMesh: null,
      selectedMesh: null,
      showPopup: false,
      detailCardOpen: false,
      isCameraFocused: false
    });
  }, []);

  const value = {
    selectionState,
    updateSelection,
    clearSelection
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  return context;
};