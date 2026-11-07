"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float, Environment, Stars } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function AnimatedSphere() {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);

    // Ref for smooth mouse interpolation (Vector2)
    const mouse = useRef(new THREE.Vector2(0, 0));

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Smoothly interpolate mouse values
            // Slower damp factor for very gentle tracking
            const damp = delta * 2;
            mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, state.mouse.x, damp);
            mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, state.mouse.y, damp);

            // STABLE Rotation (Time-based + Offset)
            // This ensures it never accelerates infinitely. It travels at a constant base speed.
            const time = state.clock.getElapsedTime();

            // Base Rotation: Very Slow (0.05 / 0.1)
            // Interaction: Add offset based on mouse position (not adding to rotation speed)
            meshRef.current.rotation.x = time * 0.05 + mouse.current.y * 0.2;
            meshRef.current.rotation.y = time * 0.1 + mouse.current.x * 0.2;
        }

        if (materialRef.current) {
            // Interactive Distortion intensity (Smoothed)
            const dist = mouse.current.length(); // 0 to ~1.4
            // Base distort 0.3, max +0.2 -> 0.5 total
            materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, 0.3 + dist * 0.2, delta * 2);
            materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, 2 + dist * 1, delta * 2);
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
            {/* Scale 1.4: Safe for mobile without cropping */}
            <Sphere args={[1, 64, 64]} scale={1.4} ref={meshRef}>
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#C9F84B" // Neon Lime
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.5}
                />
            </Sphere>
        </Float>
    );
}

// Keeping subtle background stars/particles within the Hero itself as well
function Particles() {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current) {
            // Gentle sway
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
        }
    })
    return (
        <group ref={groupRef}>
            <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        </group>
    )
}

export default function Hero3D() {
    return (
        // Overflow visible to allow 3D elements to bleed if needed (though scale 1.4 should fit)
        <div className="absolute inset-0 z-0 h-full w-full opacity-80 md:opacity-100 transition-opacity duration-1000 overflow-visible">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ overflow: 'visible' }} dpr={[1, 1.5]}>
                <fog attach="fog" args={["#DFF3EC", 5, 20]} />
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#155F4A" />

                <AnimatedSphere />
                <Particles />

                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
