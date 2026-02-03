// hooks/useTextureLoader.js
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect } from 'react';

export const useTextureLoader = (texturePaths, options = {}) => {
  const textures = useTexture(texturePaths);
  
  useEffect(() => {
    textures.forEach((texture, index) => {
      if (texture && texture.isTexture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        // Настройка повторения для каждой текстуры
        if (options.repeat) {
          texture.repeat.set(options.repeat[0], options.repeat[1]);
        } else if (options.repeatX && options.repeatY) {
          texture.repeat.set(options.repeatX, options.repeatY);
        }
        
        // Настройка фильтрации
        if (options.anisotropy !== undefined) {
          texture.anisotropy = options.anisotropy;
        }
      }
    });
    
    return () => {
      // Очистка текстур при размонтировании
      textures.forEach(texture => {
        if (texture && texture.dispose) {
          texture.dispose();
        }
      });
    };
  }, [textures, options]);

  return textures;
};