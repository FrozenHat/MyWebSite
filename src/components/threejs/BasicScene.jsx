import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Sphere, useGLTF,Environment,useTexture } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
function LocalModel({ path = "/models/Gear.glb" }) {
  const { scene } = useGLTF(path)

  scene.traverse((child) => {
   
    if (child.isMesh) {
      // Вариант 1: Простой материал
    //   child.material = new THREE.MeshStandardMaterial({
    //     color: '#4a90e2', // синий цвет
    //     roughness: 0.4,
    //     metalness: 0.6,
    //   })
      
      // ИЛИ Вариант 2: Физически корректный материал
      child.material = new THREE.MeshPhysicalMaterial({
        color: '#c4c9d1',
        roughness: 0.14,
        clearcoat: 0.4,
        metalness: 0.85,
        clearcoatRoughness: 1.0,
        transmission: 0.12,
        // opacity: 0.95,
        transparent: false
      })
    }
  })
  
  return (
    <primitive 
      object={scene} 
      position={[0, 0, 0]}
      scale={1}
    />
  )
}
export default function BasicScene() {
  return (
     <Canvas style={{ width: '100%', height: '500px' }}>
      <Suspense fallback={null}>
        {/* Вариант 1: Если ваш HDRI файл в формате .hdr */}
        {/* <Environment 
          files="/hdri/studio.hdr"  // путь к вашему файлу
          background={false}  // если true - будет фоном
          blur={5}
        /> */}
        
        {/* Вариант 2: Если у вас EXR файл */}
        <Environment 
          files="/hdri/studio.exr"
          background={true}
          environmentIntensity={0.6} // Регулирует яркость освещения
          
        />
        
        {/* Вариант 3: Если у вас несколько файлов для кубической карты (6 сторон) */}
        {/* <Environment 
          files={[
            '/hdri/px.hdr', // правая
            '/hdri/nx.hdr', // левая
            '/hdri/py.hdr', // верх
            '/hdri/ny.hdr', // низ
            '/hdri/pz.hdr', // задняя
            '/hdri/nz.hdr'  // передняя
          ]}
          background={false}
        /> */}
        
        <ambientLight intensity={0.1} /> {/* Уменьшил интенсивность, т.к. HDRI дает свет */}
        <pointLight position={[5, 4, 4]} intensity={5}/> {/* Уменьшил интенсивность */}
        <pointLight position={[-5, 3, 8]} intensity={5}/>
        
        <LocalModel path="/models/Gear.glb" />
        
        <Box position={[-1.5, 0, 0]}>
          <meshStandardMaterial 
            color="orange" 
            metalness={0.8}  // Добавил для отражений
            roughness={0.2}
          />
        </Box>
        
        <OrbitControls />
      </Suspense>
    </Canvas>
  )
}