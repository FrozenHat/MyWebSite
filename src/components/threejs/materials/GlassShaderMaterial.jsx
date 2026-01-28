// GlassShaderMaterial.jsx
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

// Создаем стеклянный шейдерный материал
const GlassShader = shaderMaterial(
  {
    // Uniforms
    time: 0,
    transmission: 0.9,
    thickness: 1.2,
    roughness: 0.14,
    envMapIntensity: 1.5,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
    normalScale: 1,
    clearcoatNormalScale: 0.3,
    color: new THREE.Color('#c4c9d1'),
    mouse: new THREE.Vector2(0, 0),
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    envMap: null,
  },
  // Вершинный шейдер
  `
    uniform float time;
    uniform float thickness;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
      // Легкая волновая анимация
      vec3 pos = position;
      float wave = sin(time * 2.0 + position.x * 8.0) * 0.005 * thickness;
      wave += cos(time * 1.5 + position.y * 6.0) * 0.005 * thickness;
      pos += normal * wave;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Фрагментный шейдер
  `
    uniform float time;
    uniform float transmission;
    uniform float thickness;
    uniform float roughness;
    uniform float envMapIntensity;
    uniform float clearcoat;
    uniform float clearcoatRoughness;
    uniform float normalScale;
    uniform float clearcoatNormalScale;
    uniform vec3 color;
    uniform vec2 mouse;
    uniform vec2 resolution;
    uniform sampler2D envMap;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    // Функция френеля
    float fresnel(vec3 viewDir, vec3 normal, float power) {
      return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
    }
    
    // Шум для микродеталей
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    
    void main() {
      // Базовые векторы
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Френель эффект (сильнее по краям)
      float fresnelEffect = fresnel(viewDir, normal, 3.0);
      
      // Цвет с учетом прозрачности
      vec3 baseColor = color.rgb;
      baseColor *= (1.0 - transmission * 0.5);
      
      // Эффект толщины (хроматическая аберрация)
      vec3 refractionColor = baseColor;
      float thicknessEffect = thickness * 0.5;
      refractionColor.r *= 1.0 + thicknessEffect * 0.15;
      refractionColor.g *= 1.0 + thicknessEffect * 0.08;
      refractionColor.b *= 1.0 + thicknessEffect * 0.05;
      
      // Смешивание с учетом передачи света
      vec3 finalColor = mix(baseColor, refractionColor, transmission * 0.7);
      
      // Clearcoat отражения
      float clearcoatEffect = clearcoat * (1.0 - clearcoatRoughness);
      vec3 clearcoatColor = vec3(1.0) * clearcoatEffect * envMapIntensity;
      finalColor = mix(finalColor, clearcoatColor, fresnelEffect * 0.4);
      
      // Шероховатость (микронеровности)
      float microRoughness = roughness * (0.8 + hash(vUv + time * 0.05) * 0.4);
      finalColor *= 0.9 + 0.1 * (1.0 - microRoughness);
      
      // Эффект от мыши (интерактивность)
      vec2 mouseUV = mouse / resolution;
      float mouseDist = length(vUv - mouseUV);
      float mouseInfluence = smoothstep(0.4, 0.0, mouseDist) * transmission;
      finalColor += vec3(0.15, 0.2, 0.25) * mouseInfluence;
      
      // Прозрачность
      float alpha = 1.0 - (transmission * 0.6);
      alpha = min(alpha + fresnelEffect * 0.3, 1.0);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
  // Опции материала
  {
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    depthWrite: true,
  }
)

// Регистрируем для использования в JSX
extend({ GlassShader })

// Компонент-обертка для применения шейдера
export function GlassShaderWrapper() {
  const shaderRef = useRef()
  const clock = useRef(new THREE.Clock())
  
  // Обработка мыши
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (shaderRef.current) {
        shaderRef.current.uniforms.mouse.value.set(e.clientX, e.clientY)
      }
    }
    
    const handleResize = () => {
      if (shaderRef.current) {
        shaderRef.current.uniforms.resolution.value.set(
          window.innerWidth,
          window.innerHeight
        )
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  // Анимация времени
  useFrame(() => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.time.value = clock.current.getElapsedTime()
    }
  })
  
  // Компонент для применения шейдера ко всей сцене
  return (
    <glassShader
      ref={shaderRef}
      key={GlassShader.key}
      attach="material"
      transmission={0.9}
      thickness={1.2}
      roughness={0.14}
      envMapIntensity={1.5}
      clearcoat={0.4}
      clearcoatRoughness={0.1}
      normalScale={1}
      clearcoatNormalScale={0.3}
      color="#c4c9d1"
      mouse={[0, 0]}
      resolution={[window.innerWidth, window.innerHeight]}
    />
  )
}

// Хук для применения шейдера к существующей сцене
export function useGlassShader(scene) {
  const shaderRef = useRef()
  const clock = useRef(new THREE.Clock())
  
  useEffect(() => {
    if (!scene) return
    
    const applyShader = () => {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          // Создаем новый шейдерный материал на основе нашего шейдера
          const shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: GlassShader.vertexShader,
            fragmentShader: GlassShader.fragmentShader,
            uniforms: THREE.UniformsUtils.clone(GlassShader.uniforms),
            transparent: true,
            side: THREE.DoubleSide,
          })
          
          // Настраиваем uniforms
          shaderMaterial.uniforms.color.value = new THREE.Color('#c4c9d1')
          shaderMaterial.uniforms.transmission.value = 0.9
          shaderMaterial.uniforms.thickness.value = 1.2
          shaderMaterial.uniforms.roughness.value = 0.14
          shaderMaterial.uniforms.clearcoat.value = 0.4
          shaderMaterial.uniforms.resolution.value.set(
            window.innerWidth,
            window.innerHeight
          )
          
          child.material = shaderMaterial
          shaderRef.current = shaderMaterial
        }
      })
    }
    
    applyShader()
    
    // Обработчики событий
    const handleMouseMove = (e) => {
      if (shaderRef.current) {
        shaderRef.current.uniforms.mouse.value.set(e.clientX, e.clientY)
      }
    }
    
    const handleResize = () => {
      if (shaderRef.current) {
        shaderRef.current.uniforms.resolution.value.set(
          window.innerWidth,
          window.innerHeight
        )
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)
    
    // Анимация
    const animate = () => {
      if (shaderRef.current) {
        shaderRef.current.uniforms.time.value = clock.current.getElapsedTime()
      }
      requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [scene])
  
  return shaderRef
}