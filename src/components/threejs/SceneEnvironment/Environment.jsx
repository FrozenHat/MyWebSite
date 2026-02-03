// src/components/threejs/SceneEnvironment/Environment.jsx
import { Environment as DreiEnvironment } from '@react-three/drei';

const Environment = () => {
  return (
    <DreiEnvironment 
      files="/hdri/studio.exr"
      background={true}
      environmentIntensity={0.4}
    />
  );
};

export default Environment;