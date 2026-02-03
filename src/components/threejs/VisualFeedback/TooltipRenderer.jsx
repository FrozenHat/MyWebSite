// src/components/threejs/VisualFeedback/TooltipRenderer.jsx
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { getMeshDetails } from '../config/modelDetails';

const TooltipRenderer = ({ hoveredMesh, selectedMesh }) => {
  const { camera, gl, size } = useThree();
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [tooltipContent, setTooltipContent] = useState('');

  useEffect(() => {
    if (hoveredMesh && hoveredMesh !== selectedMesh) {
      const meshDetails = getMeshDetails(hoveredMesh.name);
      
      // Получаем мировые координаты mesh
      const meshWorldPosition = new THREE.Vector3();
      hoveredMesh.getWorldPosition(meshWorldPosition);
      
      // Проецируем 3D координаты в 2D экранные
      const vector = meshWorldPosition.clone();
      vector.project(camera);
      
      const x = (vector.x * 0.5 + 0.5) * size.width;
      const y = (-vector.y * 0.5 + 0.5) * size.height;
      
      setTooltipPosition({ x, y });
      setTooltipContent(meshDetails.name);
    } else {
      setTooltipPosition(null);
      setTooltipContent('');
    }
  }, [hoveredMesh, selectedMesh, camera, size]);

  if (!tooltipPosition || !tooltipContent) {
    return null;
  }

  return (
    <Html
      position={[0, 0, 0]}
      style={{
        position: 'absolute',
        left: `${tooltipPosition.x + 10}px`,
        top: `${tooltipPosition.y - 10}px`,
        transform: 'translateY(-100%)',
        zIndex: 999,
        pointerEvents: 'none'
      }}
    >
      <div className="mesh-tooltip">
        {tooltipContent}
      </div>
    </Html>
  );
};

export default TooltipRenderer;