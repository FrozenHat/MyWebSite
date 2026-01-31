import { useEffect, useCallback, useRef } from 'react'
import * as THREE from 'three'
import { MaterialPresets, createMaterialFromPreset } from './MaterialPresets'

/**
 * Универсальный компонент для применения материалов к 3D моделям
 * 
 * @param {Object} props
 * @param {React.Ref} props.modelRef - ref на группу с моделью
 * @param {string} props.target - цель применения: 'material:Name' или 'mesh:Name' или 'all'
 * @param {string|Object} props.preset - имя пресета или объект с параметрами материала
 * @param {Function} props.onApplied - callback после применения
 * @param {boolean} props.keepOriginal - сохранять оригинальный материал
 * @param {number} props.delay - задержка перед применением (мс)
 * @param {boolean} props.debug - режим отладки
 * @param {children} props.children - дочерние элементы (для вложенного применения)
 */
export function MaterialApplier({
  modelRef,
  target = 'all',
  preset = 'plastic',
  onApplied,
  keepOriginal = true,
  delay = 100,
  debug = false,
  children,
  ...customParams
}) {
  const appliedMaterialsRef = useRef(new Map())
  
  // Функция поиска и применения материалов
  const applyMaterial = useCallback(() => {
    if (!modelRef?.current) {
      if (debug) console.warn('MaterialApplier: modelRef не найден')
      return 0
    }
    
    const [targetType, targetName] = target.split(':')
    let appliedCount = 0
    
    modelRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        let shouldApply = false
        
        // Определяем, нужно ли применять материал к этому мешу
        switch(targetType) {
          case 'all':
            shouldApply = true
            break
            
          case 'material':
            shouldApply = child.material.name?.toLowerCase().includes(targetName.toLowerCase())
            break
            
          case 'mesh':
            shouldApply = child.name?.toLowerCase().includes(targetName.toLowerCase())
            break
            
          case 'regex':
            try {
              const regex = new RegExp(targetName, 'i')
              shouldApply = regex.test(child.material.name) || regex.test(child.name)
            } catch (e) {
              console.error('MaterialApplier: неверное регулярное выражение', e)
            }
            break
            
          default:
            shouldApply = false
        }
        
        if (shouldApply) {
          // Сохраняем оригинальный материал если нужно
          if (keepOriginal && !appliedMaterialsRef.current.has(child.uuid)) {
            appliedMaterialsRef.current.set(child.uuid, {
              original: child.material,
              name: child.material.name,
              meshName: child.name,
              timestamp: Date.now()
            })
          }
          
          // Создаем новый материал
          const newMaterial = typeof preset === 'string'
            ? createMaterialFromPreset(preset, customParams)
            : createCustomMaterial(preset)
          
          // Копируем текстуры из оригинального материала если они есть
          if (child.material.map) newMaterial.map = child.material.map
          if (child.material.normalMap) newMaterial.normalMap = child.material.normalMap
          if (child.material.roughnessMap) newMaterial.roughnessMap = child.material.roughnessMap
          if (child.material.metalnessMap) newMaterial.metalnessMap = child.material.metalnessMap
          if (child.material.aoMap) newMaterial.aoMap = child.material.aoMap
          if (child.material.emissiveMap) newMaterial.emissiveMap = child.material.emissiveMap
          
          // Копируем UV трансформации
          if (child.material.map) newMaterial.map.transform = child.material.map.transform
          
          // Применяем новый материал
          child.material = newMaterial
          child.material.name = `${child.name || 'mesh'}_${typeof preset === 'string' ? preset : 'custom'}`
          
          appliedCount++
          
          if (debug) {
            console.log(`MaterialApplier: Применен материал к`, {
              mesh: child.name,
              originalMaterial: child.userData.originalMaterialName,
              newMaterial: child.material.type,
              preset: typeof preset === 'string' ? preset : 'custom'
            })
          }
        }
      }
    })
    
    if (onApplied) {
      onApplied(appliedCount)
    }
    
    if (debug && appliedCount > 0) {
      console.log(`MaterialApplier: Применено материалов: ${appliedCount}, цель: ${target}`)
    }
    
    return appliedCount
  }, [modelRef, target, preset, onApplied, keepOriginal, debug, customParams])
  
  // Эффект для применения материала
  useEffect(() => {
    const timer = setTimeout(applyMaterial, delay)
    return () => clearTimeout(timer)
  }, [applyMaterial, delay])
  
  // Функция восстановления оригинальных материалов
  const restoreOriginalMaterials = useCallback(() => {
    if (!modelRef?.current) return
    
    let restoredCount = 0
    modelRef.current.traverse((child) => {
      if (child.isMesh && appliedMaterialsRef.current.has(child.uuid)) {
        const original = appliedMaterialsRef.current.get(child.uuid)
        child.material = original.original
        child.material.name = original.name
        restoredCount++
        
        if (debug) {
          console.log(`MaterialApplier: Восстановлен оригинальный материал для ${child.name}`)
        }
      }
    })
    
    if (debug && restoredCount > 0) {
      console.log(`MaterialApplier: Восстановлено материалов: ${restoredCount}`)
    }
    
    return restoredCount
  }, [modelRef, debug])
  
  // Экспортируем функции через ref
  useEffect(() => {
    if (modelRef?.current) {
      modelRef.current.userData = modelRef.current.userData || {}
      modelRef.current.userData.materialApplier = {
        apply: applyMaterial,
        restore: restoreOriginalMaterials,
        getAppliedCount: () => appliedMaterialsRef.current.size
      }
    }
  }, [modelRef, applyMaterial, restoreOriginalMaterials])
  
  return children || null
}

// Создание кастомного материала
function createCustomMaterial(config) {
  const { type = 'MeshStandardMaterial', params = {} } = config
  
  // Преобразуем строки цветов в THREE.Color
  const processedParams = { ...params }
  if (params.color && typeof params.color === 'string') {
    processedParams.color = new THREE.Color(params.color)
  }
  if (params.emissive && typeof params.emissive === 'string') {
    processedParams.emissive = new THREE.Color(params.emissive)
  }
  if (params.specularColor && typeof params.specularColor === 'string') {
    processedParams.specularColor = new THREE.Color(params.specularColor)
  }
  if (params.sheenColor && typeof params.sheenColor === 'string') {
    processedParams.sheenColor = new THREE.Color(params.sheenColor)
  }
  
  switch(type) {
    case 'MeshPhysicalMaterial':
      return new THREE.MeshPhysicalMaterial(processedParams)
    case 'MeshBasicMaterial':
      return new THREE.MeshBasicMaterial(processedParams)
    case 'MeshStandardMaterial':
    default:
      return new THREE.MeshStandardMaterial(processedParams)
  }
}

// Хук для удобного использования
export function useMaterialApplier(modelRef, target, preset = 'plastic', options = {}) {
  useEffect(() => {
    if (!modelRef?.current) return
    
    const timer = setTimeout(() => {
      const [targetType, targetName] = target.split(':')
      
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          const shouldApply = targetType === 'material'
            ? child.material.name === targetName
            : targetType === 'mesh'
            ? child.name === targetName
            : false
            
          if (shouldApply) {
            const material = typeof preset === 'string'
              ? createMaterialFromPreset(preset, options)
              : createCustomMaterial(preset)
              
            child.material = material
          }
        }
      })
    }, options.delay || 100)
    
    return () => clearTimeout(timer)
  }, [modelRef, target, preset, options])
}

// Вспомогательный компонент для быстрого применения пресетов
export function Glass({ modelRef, target, ...props }) {
  return (
    <MaterialApplier
      modelRef={modelRef}
      target={target}
      preset="glass"
      {...props}
    />
  )
}

export function Metal({ modelRef, target, ...props }) {
  return (
    <MaterialApplier
      modelRef={modelRef}
      target={target}
      preset="metal"
      {...props}
    />
  )
}

export function Plastic({ modelRef, target, ...props }) {
  return (
    <MaterialApplier
      modelRef={modelRef}
      target={target}
      preset="plastic"
      {...props}
    />
  )
}

export function Chrome({ modelRef, target, ...props }) {
  return (
    <MaterialApplier
      modelRef={modelRef}
      target={target}
      preset="chrome"
      {...props}
    />
  )
}

export function Gold({ modelRef, target, ...props }) {
  return (
    <MaterialApplier
      modelRef={modelRef}
      target={target}
      preset="gold"
      {...props}
    />
  )
}