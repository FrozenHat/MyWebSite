// PlexiglasMaterial.jsx
import { useRef, useMemo } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'

// Создаем кастомный шейдерный материал
const PlexiglasShaderMaterial = shaderMaterial(
  // Uniforms
  {
    uTime: 0,
    uColor: new THREE.Color('#88ccff'),
    uNoiseScale: 1.0,
    uRefractionPower: 0.3,
    uThickness: 0.5,
    uFresnelPower: 3.0,
    uDistortion: 0.1,
    uEdgeGlow: 2.0,
    uEdgeColor: new THREE.Color('#ffffff'),
    uEnvironmentIntensity: 1.0,
    uCubeTexture: null,
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uNoiseScale;
    uniform float uRefractionPower;
    uniform float uThickness;
    uniform float uFresnelPower;
    uniform float uDistortion;
    uniform float uEdgeGlow;
    uniform vec3 uEdgeColor;
    uniform float uEnvironmentIntensity;
    uniform samplerCube uCubeTexture;
    
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    
    // Шум Перлина для эффекта жидкости
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }
    
    // Функция для эффекта френеля
    float fresnel(vec3 eyeVector, vec3 worldNormal) {
      return pow(1.0 - clamp(dot(eyeVector, worldNormal), 0.0, 1.0), uFresnelPower);
    }
    
    void main() {
      // Нормализованные векторы
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      
      // Динамический шум для эффекта жидкости
      float time = uTime * 0.2;
      vec2 noiseCoord = vUv * uNoiseScale;
      float liquidNoise = noise(noiseCoord + time);
      float liquidNoise2 = noise(noiseCoord * 2.0 - time * 0.7);
      float liquidPattern = mix(liquidNoise, liquidNoise2, 0.5);
      
      // Искажение нормалей для рефракции
      vec3 distortedNormal = normal;
      distortedNormal.xz += uDistortion * sin(vUv.y * 10.0 + time) * 0.1;
      distortedNormal = normalize(distortedNormal);
      
      // Эффект френеля для краев
      float fresnelTerm = fresnel(viewDir, distortedNormal);
      float edgeFresnel = fresnel(viewDir, normal);
      
      // Цвет стекла с градиентом толщины
      vec3 glassColor = uColor;
      glassColor *= 1.0 + uThickness * (1.0 - vUv.y);
      
      // Эффект рефракции (имитация)
      vec3 refractionColor = textureCube(uCubeTexture, reflect(-viewDir, distortedNormal)).rgb;
      refractionColor = mix(glassColor, refractionColor, uRefractionPower);
      
      // Смешиваем цвета
      vec3 finalColor = refractionColor;
      
      // Добавляем свечение по краям
      vec3 edgeEffect = uEdgeColor * edgeFresnel * uEdgeGlow;
      finalColor += edgeEffect;
      
      // Добавляем внутренние эффекты жидкости
      float internalGlow = liquidPattern * 0.3 * (1.0 - fresnelTerm);
      finalColor += vec3(0.8, 0.9, 1.0) * internalGlow;
      
      // Прозрачность
      float alpha = 0.85 + 0.15 * fresnelTerm;
      alpha = clamp(alpha, 0.7, 0.95);
      
      gl_FragColor = vec4(finalColor * uEnvironmentIntensity, alpha);
    }
  `
)

// Расширяем Three.js для использования нового материала
extend({ PlexiglasShaderMaterial })

export default function PlexiglasMaterial({ 
  color = "#88ccff",
  thickness = 0.5,
  refraction = 0.3,
  distortion = 0.1,
  edgeGlow = 2.0,
  edgeColor = "#ffffff",
  ...props 
}) {
  const materialRef = useRef()
  const envMap = useMemo(() => {
    // Создаем временную environment map
    const loader = new THREE.CubeTextureLoader()
    return loader.load([
      '/textures/px.jpg', '/textures/nx.jpg',
      '/textures/py.jpg', '/textures/ny.jpg',
      '/textures/pz.jpg', '/textures/nz.jpg'
    ])
  }, [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime
    }
  })

  return (
    <plexiglasShaderMaterial
      ref={materialRef}
      uColor={new THREE.Color(color)}
      uThickness={thickness}
      uRefractionPower={refraction}
      uDistortion={distortion}
      uEdgeGlow={edgeGlow}
      uEdgeColor={new THREE.Color(edgeColor)}
      uCubeTexture={envMap}
      transparent={true}
      side={THREE.DoubleSide}
      blending={THREE.NormalBlending}
      depthWrite={false}
      {...props}
    />
  )
}