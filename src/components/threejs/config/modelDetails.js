// src/components/threejs/config/modelDetails.js
export const MODEL_DETAILS = {
  // Формат: meshName: { конфигурация }
  "Engine_Casing": {
    id: "engine_casing",
    name: "Корпус двигателя",
    description: "Основной корпус двигателя из термостойкого сплава. Защищает внутренние компоненты от перегрева.",
    group: "engine",
    importance: "high",
    cameraSettings: {
      targetOffset: [0, 0.3, 0],  // Смещение от центра mesh
      distance: 1.5,              // Дистанция камеры
      fov: 45                     // Угол обзора
    }
  },
  
  "Piston_Assembly": {
    id: "piston_assembly",
    name: "Поршневая группа",
    description: "Комплект поршней с шатунами. Преобразует энергию сгорания в механическое движение.",
    group: "engine",
    importance: "critical",
    cameraSettings: {
      targetOffset: [0, 0.2, 0],
      distance: 1.2,
      fov: 50
    }
  },
  
  "Valve_System": {
    id: "valve_system",
    name: "Клапанная система",
    description: "Впускные и выпускные клапаны. Регулирует подачу топлива и отвод выхлопных газов.",
    group: "engine",
    importance: "medium",
    cameraSettings: {
      targetOffset: [0, 0.15, 0],
      distance: 1.0,
      fov: 55
    }
  },
  
  "Gear_Assembly": {
    id: "gear_assembly",
    name: "Зубчатая передача",
    description: "Система шестерен для передачи крутящего момента между компонентами.",
    group: "transmission",
    importance: "high",
    cameraSettings: {
      targetOffset: [0, 0.1, 0],
      distance: 0.8,
      fov: 60
    }
  },
  
  "Cooling_System": {
    id: "cooling_system",
    name: "Система охлаждения",
    description: "Радиатор и водяная помпа. Поддерживает оптимальную температуру работы.",
    group: "cooling",
    importance: "medium",
    cameraSettings: {
      targetOffset: [0, 0.25, 0],
      distance: 1.3,
      fov: 40
    }
  }
};

// Группы деталей
export const PART_GROUPS = {
  "engine": {
    name: "Двигатель",
    color: "#ff4444",
    description: "Основной силовой агрегат"
  },
  "transmission": {
    name: "Трансмиссия",
    color: "#44ff44",
    description: "Система передачи мощности"
  },
  "cooling": {
    name: "Охлаждение",
    color: "#4444ff",
    description: "Система терморегуляции"
  },
  "electrical": {
    name: "Электрика",
    color: "#ffff44",
    description: "Электронная система управления"
  }
};

// Функция для получения информации о mesh по имени
export const getMeshDetails = (meshName) => {
  return MODEL_DETAILS[meshName] || {
    id: meshName.toLowerCase(),
    name: meshName.replace(/_/g, ' '),
    description: "Деталь механизма",
    group: "unknown",
    importance: "low",
    cameraSettings: {
      targetOffset: [0, 0, 0],
      distance: 1.0,
      fov: 50
    }
  };
};

// Функция для получения информации о группе
export const getGroupInfo = (groupId) => {
  return PART_GROUPS[groupId] || {
    name: "Неизвестная группа",
    color: "#888888",
    description: "Группа деталей"
  };
};