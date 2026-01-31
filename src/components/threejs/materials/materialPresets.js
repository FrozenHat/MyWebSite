import * as THREE from 'three'

// Базовые пресеты для MeshStandardMaterial
export const StandardPresets = {
  plastic: {
    type: 'standard',
    params: {
      color: '#ffffff',
      roughness: 0.3,
      metalness: 0.0,
      envMapIntensity: 1.0
    }
  },
  
  rubber: {
    type: 'standard',
    params: {
      color: '#222222',
      roughness: 0.9,
      metalness: 0.0
    }
  },
  
  metal: {
    type: 'standard',
    params: {
      color: '#aaaaaa',
      roughness: 0.1,
      metalness: 1.0,
      envMapIntensity: 1.5
    }
  },
  
  gold: {
    type: 'standard',
    params: {
      color: '#ffd700',
      roughness: 0.1,
      metalness: 1.0,
      envMapIntensity: 1.5
    }
  },
  
  chrome: {
    type: 'standard',
    params: {
      color: '#cccccc',
      roughness: 0.05,
      metalness: 1.0,
      envMapIntensity: 2.0
    }
  },
  
  emissive: {
    type: 'standard',
    params: {
      color: '#ffffff',
      emissive: '#ff4444',
      emissiveIntensity: 1.0
    }
  },
  
  matte: {
    type: 'standard',
    params: {
      color: '#888888',
      roughness: 1.0,
      metalness: 0.0
    }
  }
}

// Пресеты для MeshPhysicalMaterial
export const PhysicalPresets = {
  glass: {
    type: 'physical',
    params: {
      color: '#ffffff',
      roughness: 0.0,
      transmission: 1.0,
      thickness: 0.1,
      ior: 1.5,
      specularIntensity: 1.0,
      specularColor: '#ffffff',
      transparent: true,
      side: THREE.DoubleSide
    }
  },
  
  water: {
    type: 'physical',
    params: {
      color: '#88aaff',
      roughness: 0.0,
      transmission: 0.8,
      thickness: 0.5,
      ior: 1.33,
      transparent: true
    }
  },
  
  diamond: {
    type: 'physical',
    params: {
      color: '#ffffff',
      roughness: 0.0,
      transmission: 0.9,
      thickness: 0.3,
      ior: 2.42,
      specularIntensity: 2.0,
      transparent: true
    }
  },
  
  acrylic: {
    type: 'physical',
    params: {
      color: '#ffffff',
      roughness: 0.1,
      transmission: 0.5,
      thickness: 0.2,
      ior: 1.49,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1
    }
  },
  
  carPaint: {
    type: 'physical',
    params: {
      color: '#ff0000',
      roughness: 0.2,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      sheen: 0.5,
      sheenRoughness: 0.1,
      sheenColor: '#ffffff'
    }
  },
  
  ceramic: {
    type: 'physical',
    params: {
      color: '#ffffff',
      roughness: 0.0,
      metalness: 0.0,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1
    }
  },
  
  velvet: {
    type: 'physical',
    params: {
      color: '#440044',
      roughness: 0.8,
      metalness: 0.0,
      sheen: 1.0,
      sheenRoughness: 0.2,
      sheenColor: '#ff44ff'
    }
  }
}

// Пресеты для MeshBasicMaterial (производительность)
export const BasicPresets = {
  wireframe: {
    type: 'basic',
    params: {
      color: '#ffffff',
      wireframe: true,
      transparent: true,
      opacity: 0.5
    }
  },
  
  invisible: {
    type: 'basic',
    params: {
      transparent: true,
      opacity: 0.0
    }
  },
  
  solidColor: {
    type: 'basic',
    params: {
      color: '#ff0000'
    }
  }
}

// Специальные PBR пресеты (комбинированные)
export const PBRPresets = {
  rustyIron: {
    type: 'standard',
    params: {
      color: '#8c7853',
      roughness: 0.8,
      metalness: 0.9,
      normalScale: new THREE.Vector2(1, 1)
    },
    // Флаги для загрузки текстур
    textures: {
      normal: true,
      roughness: true,
      metalness: true,
      ao: true
    }
  },
  
  scratchedMetal: {
    type: 'standard',
    params: {
      color: '#888888',
      roughness: 0.4,
      metalness: 1.0,
      envMapIntensity: 1.2
    }
  },
  
  fabric: {
    type: 'physical',
    params: {
      color: '#553322',
      roughness: 0.9,
      metalness: 0.0,
      sheen: 0.5,
      sheenRoughness: 0.5
    }
  }
}

// Объединенная библиотека всех пресетов
export const MaterialPresets = {
  ...StandardPresets,
  ...PhysicalPresets,
  ...BasicPresets,
  ...PBRPresets,
  
  // Алиасы для удобства
  Glass: PhysicalPresets.glass,
  Metal: StandardPresets.metal,
  Plastic: StandardPresets.plastic,
  Rubber: StandardPresets.rubber,
  Chrome: StandardPresets.chrome,
  Gold: StandardPresets.gold,
  Water: PhysicalPresets.water,
  Diamond: PhysicalPresets.diamond,
  CarPaint: PhysicalPresets.carPaint,
  Ceramic: PhysicalPresets.ceramic,
  Velvet: PhysicalPresets.velvet
}

// Утилитарная функция для создания материала из пресета
export function createMaterialFromPreset(presetName, customParams = {}) {
  const preset = MaterialPresets[presetName]
  if (!preset) {
    console.warn(`Пресет "${presetName}" не найден, используется стандартный`)
    return new THREE.MeshStandardMaterial({ color: '#888888', ...customParams })
  }
  
  const { type, params } = preset
  const mergedParams = { ...params, ...customParams }
  
  switch(type) {
    case 'physical':
      return new THREE.MeshPhysicalMaterial(mergedParams)
    case 'basic':
      return new THREE.MeshBasicMaterial(mergedParams)
    case 'standard':
    default:
      return new THREE.MeshStandardMaterial(mergedParams)
  }
}

// Функция для получения списка доступных пресетов
export function getAvailablePresets() {
  return Object.keys(MaterialPresets).sort()
}

// Функция для получения пресета по категории
export function getPresetsByCategory() {
  return {
    standard: Object.keys(StandardPresets),
    physical: Object.keys(PhysicalPresets),
    basic: Object.keys(BasicPresets),
    pbr: Object.keys(PBRPresets)
  }
}