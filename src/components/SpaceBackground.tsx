'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Image from 'next/image';

export default function SpaceBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 50;

    // Seeded random number generator for consistent positions
    let seed = 12345;
    function seededRandom(): number {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    // Create star shape
    function createStarShape(innerRadius: number, outerRadius: number, points: number): THREE.Shape {
      const shape = new THREE.Shape();
      const angleStep = (Math.PI * 2) / points;
      
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * angleStep) / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          shape.moveTo(x, y);
        } else {
          shape.lineTo(x, y);
        }
      }
      shape.closePath();
      return shape;
    }

    // Create multiple 3D stars
    const stars: THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshPhongMaterial>[] = [];
    const starCount = 300;

    for (let i = 0; i < starCount; i++) {
      const size = seededRandom() * 0.3 + 0.2;
      const starShape = createStarShape(size * 0.4, size, 5);
      
      const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: size * 0.3,
        bevelEnabled: true,
        bevelThickness: size * 0.1,
        bevelSize: size * 0.1,
        bevelSegments: 2,
      };
      
      const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
      
      // Random color - purple or white
      const colorChoice = seededRandom();
      let color: THREE.Color;
      if (colorChoice > 0.6) {
        color = new THREE.Color(0xba55d3); // Purple
      } else if (colorChoice > 0.3) {
        color = new THREE.Color(0xe8d5f0); // Light purple
      } else {
        color = new THREE.Color(0xffffff); // White
      }
      
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        shininess: 100,
      });
      
      const star = new THREE.Mesh(geometry, material);
      
      star.position.set(
        (seededRandom() - 0.5) * 150,
        (seededRandom() - 0.5) * 150,
        (seededRandom() - 0.5) * 100 - 50
      );
      
      star.rotation.set(
        seededRandom() * Math.PI,
        seededRandom() * Math.PI,
        seededRandom() * Math.PI
      );
      
      star.userData = {
        rotationSpeed: {
          x: (seededRandom() - 0.5) * 0.02,
          y: (seededRandom() - 0.5) * 0.02,
          z: (seededRandom() - 0.5) * 0.02,
        }
      };
      
      scene.add(star);
      stars.push(star);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x6a3a8a, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 150);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    // Create shooting stars
    const shootingStars: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] = [];
    
    function createShootingStar(): void {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(100 * 3);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      
      const line = new THREE.Line(geometry, material);
      
      // Increased range for outskirts
      const startX = (Math.random() - 0.5) * 200;
      const startY = Math.random() * 80 + 20;
      const startZ = (Math.random() - 0.5) * 100;
      
      line.userData = {
        speed: Math.random() * 0.5 + 0.3,
        life: 0,
        start: new THREE.Vector3(startX, startY, startZ),
        direction: new THREE.Vector3(-1, -1, 0).normalize()
      };
      
      scene.add(line);
      shootingStars.push(line);
    }

    // Animation
    let time = 0;
    let shootingStarTimer = 0;

    function animate(): void {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotate 3D stars
      stars.forEach(star => {
        star.rotation.x += star.userData.rotationSpeed.x;
        star.rotation.y += star.userData.rotationSpeed.y;
        star.rotation.z += star.userData.rotationSpeed.z;
      });

      // Twinkle stars
      stars.forEach(star => {
        if (Math.random() > 0.98) {
          star.material.emissiveIntensity = Math.random() * 0.8 + 0.4;
        }
      });

      // Update shooting stars
      shootingStarTimer++;
      if (shootingStarTimer > 40 && shootingStars.length < 15) {
        createShootingStar();
        shootingStarTimer = 0;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.userData.life += star.userData.speed;
        
        const positions = star.geometry.attributes.position.array as Float32Array;
        const startPos = star.userData.start as THREE.Vector3;
        const direction = star.userData.direction as THREE.Vector3;
        
        for (let j = 0; j < 100; j++) {
          const offset = star.userData.life - j * 0.1;
          positions[j * 3] = startPos.x + direction.x * offset;
          positions[j * 3 + 1] = startPos.y + direction.y * offset;
          positions[j * 3 + 2] = startPos.z + direction.z * offset;
        }
        
        star.geometry.attributes.position.needsUpdate = true;
        star.material.opacity = Math.max(0, 1 - star.userData.life / 30);
        
        if (star.userData.life > 30) {
          scene.remove(star);
          shootingStars.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    // Handle resize (without re-rendering)
    function handleResize(): void {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      const container = containerRef.current;
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Google Fonts Link */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Berkshire+Swash&family=Lora:wght@600;700&display=swap" 
        rel="stylesheet" 
      />
      
      {/* Purple gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #3d1f5c 0%, #1a0033 50%, #0a0015 100%)',
        }}
      />
      
      {/* Three.js canvas */}
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Lanterns - Mobile Responsive */}
      <>
        {/* Top Left Lantern - Small */}
        <div className="absolute -top-2 left-8 sm:left-20 md:top-0 md:left-44 w-32 h-48 sm:w-40 sm:h-56 md:w-48 md:h-64">
          <Image
            src="/landing/lantern_small.webp"
            alt="Lantern"
            fill
            className="object-contain object-top"
            priority
          />
        </div>
        
        {/* Top Right Lantern - Small */}
        <div className="absolute -top-2 right-8 sm:right-20 md:top-0 md:right-44 w-32 h-48 sm:w-40 sm:h-56 md:w-48 md:h-64">
          <Image
            src="/landing/lantern_small.webp"
            alt="Lantern"
            fill
            className="object-contain object-top"
            priority
          />
        </div>
        
        {/* Left Side Lantern - Long */}
        <div className="absolute -top-28 -left-8 sm:-top-36 sm:left-0 md:-top-52 md:left-2 w-48 h-[32rem] sm:w-64 sm:h-[40rem] md:w-80 md:h-[48rem]">
          <Image
            src="/landing/lantern_long.webp"
            alt="Lantern"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* Right Side Lantern - Long */}
        <div className="absolute -top-28 -right-8 sm:-top-36 sm:right-0 md:-top-52 md:right-2 w-48 h-[32rem] sm:w-64 sm:h-[40rem] md:w-80 md:h-[48rem]">
          <Image
            src="/landing/lantern_long.webp"
            alt="Lantern"
            fill
            className="object-contain"
            priority
          />
        </div>
      </>
      
      {/* Content overlay with centered logo and text */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* Logo - Moved up */}
        <div className="w-32 h-32 md:w-40 md:h-40 relative mb-8 md:mb-10 -mt-16 md:-mt-20">
          <Image
            src="/landing/niyat_logo.webp"
            alt="Niyate Shaukh Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* Main Title */}
        <h1 
          className="text-white text-4xl md:text-6xl lg:text-7xl mb-6 md:mb-8 text-center whitespace-nowrap"
          style={{
            fontFamily: "'Berkshire Swash', cursive",
            fontWeight: 400,
            letterSpacing: '0.02em',
          }}
        >
          Niyat e Shaukh
        </h1>
        
        {/* Subtitle - Now with Lora font and bold weight */}
        <p 
          className="text-white text-base md:text-lg lg:text-xl text-center max-w-2xl"
          style={{
            fontFamily: "'Lora', serif",
            fontWeight: 700,
            letterSpacing: '0.03em',
          }}
        >
          a home for storytellers, poets<br />and dreamers
        </p>
      </div>
    </div>
  );
}