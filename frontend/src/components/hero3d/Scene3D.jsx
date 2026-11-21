// frontend/src/components/hero3d/Scene3D.jsx
// Lightweight, cinematic Three.js WebGL scene for the E-Waste Hero experience.
// Zero external asset downloads, optimized for smooth 60fps on modern GPUs and efficient mobile fallbacks.

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createMotherboard,
  createFloatingRam,
  createFloatingSsd,
  createFloatingCpu,
  createParticleSystem,
} from "./proceduralAssets";

export default function Scene3D({ onLoaded }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect WebGL capability safely
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("[Scene3D] WebGL not supported or failed to initialize:", e);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = false; // Disable expensive shadow maps for pure performance
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 3.6, 9.0);
    camera.lookAt(0, 0, 0);

    // Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0x0c1b14, 2.2);
    scene.add(ambientLight);

    // Key directional light (cool white key highlight)
    const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.8);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    // Secondary fill light (subtle deep emerald tone)
    const fillLight = new THREE.DirectionalLight(0x10b981, 1.4);
    fillLight.position.set(-6, -2, -4);
    scene.add(fillLight);

    // Luminous emerald CPU core point light (creates breathing living technology effect)
    const corePointLight = new THREE.PointLight(0xa3e635, 3.2, 10, 1.6);
    corePointLight.position.set(-0.4, 1.2, -0.4);
    scene.add(corePointLight);

    // Accent rim light for golden traces
    const goldRimLight = new THREE.PointLight(0xeab308, 1.8, 8, 2.0);
    goldRimLight.position.set(3, -1, 3);
    scene.add(goldRimLight);

    // --- Main Assembly Group ---
    const assemblyGroup = new THREE.Group();
    // Default tilt so the board's intricate components and traces face the camera
    assemblyGroup.rotation.x = 0.45;
    assemblyGroup.rotation.z = -0.15;
    scene.add(assemblyGroup);

    // 1. Central Motherboard
    const { group: motherboard, coreRing } = createMotherboard();
    assemblyGroup.add(motherboard);

    // 2. Floating Orbiting Electronic Components
    const ram = createFloatingRam();
    ram.scale.set(0.85, 0.85, 0.85);
    scene.add(ram);

    const ssd = createFloatingSsd();
    ssd.scale.set(0.85, 0.85, 0.85);
    scene.add(ssd);

    const cpu = createFloatingCpu();
    cpu.scale.set(0.9, 0.9, 0.9);
    scene.add(cpu);

    // 3. Floating Energy Particle Cloud
    const { points: particleSystem, speeds: particleSpeeds } = createParticleSystem(180);
    scene.add(particleSystem);

    if (onLoaded) {
      onLoaded();
    }

    // --- Mouse Parallax & Inertia ---
    let targetCameraX = 0;
    let targetCameraY = 3.6;

    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetCameraX = normX * 1.5;
      targetCameraY = 3.6 + normY * 0.9;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // --- Resize Handling ---
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth && newHeight) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    // --- Animation Loop ---
    let animationFrameId;
    let isTabVisible = true;
    let clock = new THREE.Clock();

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return; // Pause when tab is inactive to preserve battery & GPU

      const elapsed = clock.getElapsedTime();

      // Motherboard gentle continuous yaw and floating pitch bob
      motherboard.rotation.y += 0.0035;
      assemblyGroup.position.y = Math.sin(elapsed * 0.9) * 0.12;

      // Pulse the central green core light
      const pulse = 2.4 + Math.sin(elapsed * 2.4) * 0.9;
      corePointLight.intensity = pulse;
      if (coreRing) {
        coreRing.rotation.z += 0.015;
      }

      // --- Orbiting Component Calculations ---
      // 1. RAM Module Orbit (elliptical orbit around upper layer)
      const ramSpeed = 0.45;
      ram.position.x = Math.cos(elapsed * ramSpeed) * 3.8;
      ram.position.z = Math.sin(elapsed * ramSpeed) * 3.4;
      ram.position.y = 1.1 + Math.sin(elapsed * 0.8) * 0.35;
      ram.rotation.y += 0.008;
      ram.rotation.x = Math.sin(elapsed * 0.5) * 0.3 + 0.3;
      ram.rotation.z = Math.cos(elapsed * 0.4) * 0.2;

      // 2. M.2 SSD Orbit (tilted inclined plane)
      const ssdSpeed = -0.52;
      ssd.position.x = Math.cos(elapsed * ssdSpeed + 2.2) * 3.4;
      ssd.position.z = Math.sin(elapsed * ssdSpeed + 2.2) * 3.7;
      ssd.position.y = -0.7 + Math.cos(elapsed * 1.0) * 0.3;
      ssd.rotation.x += 0.007;
      ssd.rotation.y += 0.009;

      // 3. Silicon CPU Die (inner slow orbit)
      const cpuSpeed = 0.32;
      cpu.position.x = Math.sin(elapsed * cpuSpeed + 4.0) * 2.8;
      cpu.position.z = Math.cos(elapsed * cpuSpeed + 4.0) * 2.9;
      cpu.position.y = 0.3 + Math.sin(elapsed * 0.7) * 0.25;
      cpu.rotation.y += 0.006;
      cpu.rotation.x = 0.3 + Math.sin(elapsed * 0.6) * 0.2;

      // --- Particle Motion ---
      const positions = particleSystem.geometry.attributes.position.array;
      const count = positions.length / 3;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += particleSpeeds[i];
        if (positions[i * 3 + 1] > 3.5) {
          positions[i * 3 + 1] = -3.5;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.rotation.y = elapsed * 0.02;

      // Smooth camera interpolation for cinematic mouse parallax
      camera.position.x += (targetCameraX - camera.position.x) * 0.035;
      camera.position.y += (targetCameraY - camera.position.y) * 0.035;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // --- Clean Disposal on Unmount ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }

      // Recursively dispose scene geometries and materials
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else {
            if (object.material.map) object.material.map.dispose();
            object.material.dispose();
          }
        }
      });
    };
  }, [onLoaded]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
