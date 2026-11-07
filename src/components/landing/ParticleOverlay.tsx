"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

function DustParticles({ count = 400 }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // Use a manual REF for mouse position instead of R3F state.mouse
    // This allows us to track mouse even if the canvas has pointer-events: none
    const mouseRef = useRef(new THREE.Vector2(0, 0));
    const hoverRef = useRef(new THREE.Vector2(0, 0));
    const { camera } = useThree();

    // Add Global Mouse Listener
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Normalize mouse coordinates to -1 to +1
            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Initialize particles (V1 Logic)
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 10;
            const speed = 0.5 + Math.random();
            const scale = 0.5 + Math.random() * 0.5;
            temp.push({ x, y, z, speed, scale, initialX: x, initialY: y, initialZ: z });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Smoothly track the MANUAL mouse ref
        hoverRef.current.lerp(mouseRef.current, 0.1);

        const cameraQuaternion = camera.quaternion;
        const t = state.clock.getElapsedTime();

        particles.forEach((particle, i) => {
            // V1 Movement Logic
            particle.y = particle.initialY + Math.sin(t * particle.speed + i) * 0.5;
            particle.x = particle.initialX + Math.cos(t * particle.speed * 0.5 + i) * 0.3;

            // V1 Mouse Interaction
            const dx = particle.x - hoverRef.current.x * 12;
            const dy = particle.y - hoverRef.current.y * 12;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 4) {
                const force = (4 - dist) / 4;
                const repulsion = force * force * 0.2;
                particle.x += (dx / dist) * repulsion;
                particle.y += (dy / dist) * repulsion;
            }

            dummy.position.set(particle.x, particle.y, particle.z);
            dummy.quaternion.copy(cameraQuaternion);
            dummy.scale.set(particle.scale, particle.scale, particle.scale);

            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <circleGeometry args={[0.008, 16]} />
            <meshBasicMaterial color="#155F4A" transparent opacity={0.8} depthWrite={false} />
        </instancedMesh>
    );
}

export default function ParticleOverlay() {
    return (
        // Explicit pointer-events-none ensures clicks pass through to text
        <div className="absolute inset-0 z-0 pointer-events-none w-full h-full" style={{ pointerEvents: 'none' }}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                gl={{ alpha: true }}
                dpr={[1, 1.5]}
                // Disable R3F's own event manager to save resources and avoid conflict
                events={undefined}
                style={{ pointerEvents: 'none' }}
            >
                <ambientLight intensity={1} />
                <DustParticles count={400} />
            </Canvas>
        </div>
    );
}
