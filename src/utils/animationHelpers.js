// utils/animationHelpers.js
import * as THREE from 'three';

export const createAnimationMixer = (animations, group) => {
  const mixer = new THREE.AnimationMixer(group);
  
  animations.forEach((clip) => {
    const action = mixer.clipAction(clip);
    action.play();
    action.paused = true;
  });
  
  return mixer;
};

export const getFirstAction = (actions) => {
  const actionName = Object.keys(actions)[0];
  return actions[actionName];
};