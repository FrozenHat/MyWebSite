// components/threejs/AnimatedModel/index.jsx
import { forwardRef, useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { MODEL_PATHS, TEXTURE_PATHS, TEXTURE_SETTINGS } from '../../threeConfig';
import { useTextureLoader } from '../../../hooks/useTextureLoader';
import { useModelAnimation } from './useModelAnimation';
import ModelMaterials from './ModelMaterials';

const AnimatedModel = forwardRef(({ 
  path = MODEL_PATHS.ANIMATED_MODEL,
  onAnimationLoad
}, ref) => {
  const group = useRef();
  
  const { scene, animations } = useGLTF(path);
  const { actions, mixer } = useAnimations(animations, group);
  
  const textures = useTextureLoader(
    [TEXTURE_PATHS.ROUGHNESS, TEXTURE_PATHS.NORMAL],
    TEXTURE_SETTINGS.ROUGHNESS
  );
  
  const animationDuration = animations?.[0]?.duration || 1;
  useModelAnimation({
    actions,
    mixer,
    initialDuration: animationDuration,
    ref
  });
  
  useEffect(() => {
    if (animations && animations.length > 0 && onAnimationLoad) {
      onAnimationLoad(animationDuration);
    }
  }, [animations, animationDuration, onAnimationLoad]);

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        position={[0, 0, 0]}
        scale={1}
      />
      
      <ModelMaterials 
        modelRef={group}
        textures={textures}
        target="material:Glass"
      />
    </group>
  );
});

AnimatedModel.displayName = 'AnimatedModel';
export default AnimatedModel;