import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Sphere } from '@react-three/drei'

export default function BasicScene() {
  return (
    <Canvas style={{ width: '100%', height: '500px' }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      <Box position={[-1.2, 0, 0]}>
        <meshStandardMaterial color="orange" />
      </Box>
      
      <Sphere position={[1.2, 0, 0]}>
        <meshStandardMaterial color="hotpink" />
      </Sphere>
      
      <OrbitControls />
    </Canvas>
  )
}