// src/components/threejs/VisualFeedback/MeshOutline.jsx
import { useRef, useEffect } from 'react';
import { useThree, extend } from '@react-three/fiber';
import { EffectComposer, Outline, Selection } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

// Расширяем Three.js для поддержки Outline
extend({ EffectComposer, Outline, Selection });

const MeshOutline = ({ selectedMesh, hoveredMesh }) => {
  const { size } = useThree();
  const selectionRef = useRef();
  
  // Находим все mesh в сцене для выделения
  useEffect(() => {
    if (selectionRef.current && (selectedMesh || hoveredMesh)) {
      const meshesToHighlight = [];
      
      // Добавляем выбранный mesh
      if (selectedMesh) {
        meshesToHighlight.push(selectedMesh);
      }
      
      // Добавляем mesh под курсором (если не выбран)
      if (hoveredMesh && hoveredMesh !== selectedMesh) {
        meshesToHighlight.push(hoveredMesh);
      }
      
      // Очищаем предыдущий выбор
      selectionRef.current.clear();
      
      // Добавляем новые mesh
      meshesToHighlight.forEach(mesh => {
        if (mesh && mesh.isMesh) {
          selectionRef.current.add(mesh);
        }
      });
    }
  }, [selectedMesh, hoveredMesh]);

  // Если нет mesh для выделения - не рендерим EffectComposer
  if (!selectedMesh && !hoveredMesh) {
    return null;
  }

  return (
    <Selection ref={selectionRef}>
      <EffectComposer autoClear={false}>
        <Outline
          blendFunction={BlendFunction.SCREEN}
          edgeStrength={selectedMesh ? 4 : 2} // Более толстый контур для выбранного
          pulseSpeed={0.5}
          visibleEdgeColor={selectedMesh ? 0x00ff00 : 0xffffff} // Зеленый для выбранного, белый для наведенного
          hiddenEdgeColor={0x22090a}
          width={size.width}
          height={size.height}
          blur={selectedMesh} // Размытие только для выбранного
        />
      </EffectComposer>
    </Selection>
  );
};

export default MeshOutline;