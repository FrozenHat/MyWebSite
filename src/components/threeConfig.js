// constants/threeConfig.js
export const MODEL_PATHS = {
  ANIMATED_MODEL: "/models/AnimTestModel3.glb"
};

export const TEXTURE_PATHS = {
  ROUGHNESS: "./models/textures/roughness.jpg",
  NORMAL: "./models/textures/normal.jpg"
};

export const TEXTURE_SETTINGS = {
  ROUGHNESS: { repeatX: 8, repeatY: 8 },
  NORMAL: { repeatX: 5, repeatY: 5 }
};

export const CAMERA_SETTINGS = {
  position: [-1.6, 0.8, 0],
  fov: 60
};

export const LIGHT_SETTINGS = {
  AMBIENT: { intensity: 0.3 },
  DIRECTIONAL: {
    position: [5, 5, 5],
    intensity: 1.2,
    shadowMapSize: { width: 1024, height: 1024 }
  },
  POINT: {
    position: [-5, 3, 2],
    intensity: 0.5,
    color: "#88aaff"
  }
};

export const MATERIAL_PRESET = {
  type: 'MeshPhysicalMaterial',
  params: {
    color: '#8e96a4',
    transmission: 0.98,
    thickness: 0.125,
    roughness: 0.1,
    normalScale: { x: 0.05, y: 0.02 },
    reflectivity: 0.0,
    ior: 1.45,
    clearcoat: 0.8,
    clearcoatRoughness: 0.4
  }
};