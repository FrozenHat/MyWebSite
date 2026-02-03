// components/threejs/AnimatedModel/ModelMaterials.jsx
import { MaterialApplier } from '../materials'; // Предполагаем, что это у нас уже есть
import * as THREE from 'three';

const ModelMaterials = ({ 
  modelRef, 
  textures, 
  target = "material:Glass",
  debug = true 
}) => {
  const [roughnessMap, normalMap] = textures || [];

  if (!roughnessMap || !normalMap) {
    console.warn('Текстуры не загружены для ModelMaterials');
    return null;
  }

  const materialPreset = {
    type: 'MeshPhysicalMaterial',
    params: {
      color: '#8e96a4',
      transmission: 0.98,
      roughnessMap: roughnessMap,
      thickness: 0.125,
      roughness: 0.1,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.05, 0.02),
      reflectivity: 0.0,
      ior: 1.45,
      clearcoat: 0.8,
      clearcoatRoughnessMap: roughnessMap,
      clearcoatRoughness: 0.4
    }
  };

  return (
    <MaterialApplier
      modelRef={modelRef}
      target={target}
      preset={materialPreset}
      debug={debug}
      onApplied={(count) => console.log(`Применен стеклянный материал к ${count} элементам`)}
    />
  );
};

export default ModelMaterials;