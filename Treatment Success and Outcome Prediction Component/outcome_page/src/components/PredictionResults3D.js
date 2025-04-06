import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';


const SuccessCategoryVisualization = ({ category }) => {
  const meshRef = useRef();
  
  // Color mapping for success categories
  const categoryColors = {
    'low': '#FF6B6B',     // Reddish for low success
    'moderate': '#4ECDC4', // Teal for moderate success
    'high': '#45B7D1'      // Bright teal for high success
  };

  // Geometry based on success category
  const renderGeometry = () => {
    switch(category) {
      case 'low':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'moderate':
        return <sphereGeometry args={[1, 32, 32]} />;
      case 'high':
        return <coneGeometry args={[1, 2, 32]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={[-2, 0, 0]}>
      {renderGeometry()}
      <meshStandardMaterial color={categoryColors[category]} />
      <Html position={[0, 1.5, 0]}>
        <div style={{ color: 'black', fontWeight: 'bold' }}>
          Success: {category}
        </div>
      </Html>
    </mesh>
  );
};

const RecoveryTimeVisualization = ({ recoveryTime }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Dynamic scaling based on recovery time
      const scale = 1 + (recoveryTime / 10);
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.rotation.x += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={[2, 0, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
      <meshStandardMaterial color="#58C0B6" />
      <Html position={[0, 1.5, 0]}>
        <div style={{ color: 'black', fontWeight: 'bold' }}>
          Recovery: {recoveryTime} days
        </div>
      </Html>
    </mesh>
  );
};

const PredictionResults3D = ({ successCategory, recoveryTime }) => {
  return (
    <Canvas 
      camera={{ position: [0, 5, 10], fov: 45 }}
      style={{ width: '100%', height: '400px' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        <SuccessCategoryVisualization category={successCategory} />
        <RecoveryTimeVisualization recoveryTime={recoveryTime} />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
};

export default PredictionResults3D;