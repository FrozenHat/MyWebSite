// src/components/threejs/SceneEnvironment/Light.jsx
import { LIGHT_SETTINGS } from '../../threeConfig'; // правильный путь

const Lights = () => {
  const { AMBIENT, DIRECTIONAL, POINT } = LIGHT_SETTINGS;

  return (
    <>
      <ambientLight intensity={AMBIENT.intensity} />
      <directionalLight 
        position={DIRECTIONAL.position}
        intensity={DIRECTIONAL.intensity}
        castShadow
        shadow-mapSize-width={DIRECTIONAL.shadowMapSize.width}
        shadow-mapSize-height={DIRECTIONAL.shadowMapSize.height}
      />
      <pointLight 
        position={POINT.position} 
        intensity={POINT.intensity} 
        color={POINT.color} 
      />
    </>
  );
};

export default Lights;