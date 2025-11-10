'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';

export default function MehfilGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 50;

    let seed = 12345;
    function seededRandom(): number {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

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
      
      const colorChoice = seededRandom();
      let color: THREE.Color;
      if (colorChoice > 0.6) {
        color = new THREE.Color(0xba55d3);
      } else if (colorChoice > 0.3) {
        color = new THREE.Color(0xe8d5f0);
      } else {
        color = new THREE.Color(0xffffff);
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

    const ambientLight = new THREE.AmbientLight(0x6a3a8a, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 150);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

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

    let shootingStarTimer = 0;

    function animate(): void {
      requestAnimationFrame(animate);

      stars.forEach(star => {
        star.rotation.x += star.userData.rotationSpeed.x;
        star.rotation.y += star.userData.rotationSpeed.y;
        star.rotation.z += star.userData.rotationSpeed.z;
      });

      stars.forEach(star => {
        if (Math.random() > 0.98) {
          star.material.emissiveIntensity = Math.random() * 0.8 + 0.4;
        }
      });

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

    function handleResize(): void {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleContactUs = () => {
    router.push('/contactus');
  };

  const seasons = [
    { id: 5, image: '/mehfil/season5.webp' },
    { id: 4, image: '/mehfil/season4.webp' },
    { id: 3, image: '/mehfil/season3.webp' },
    { id: 2, image: '/mehfil/season2.webp' },
    { id: 1, image: '/mehfil/season1.webp' },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Google Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Berkshire+Swash&family=Lora:wght@400;600;700&display=swap" 
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
      <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 1 }} />
      
      {/* Content overlay */}
      <div className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h2 
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-3"
              style={{ fontFamily: "'Berkshire Swash', cursive" }}
            >
              Mehfil 
              <span className="text-purple-500 animate-pulse">❤️</span>
            </h2>
            <p 
              className="text-purple-300 text-lg md:text-xl max-w-3xl mx-auto mb-8"
              style={{ fontFamily: "'Lora', serif", fontWeight: 600 }}
            >
              Be a Part of Our Success: Sponsor the Next Chapter of Mehfil!
            </p>
            
            {/* Contact Us Button */}
            <button
              onClick={handleContactUs}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(90deg, #6a3a8a 0%, #ba55d3 100%)',
                boxShadow: '0 4px 20px rgba(186, 85, 211, 0.4)',
                fontFamily: "'Lora', serif",
                fontWeight: 700,
              }}
            >
              Contact Us
            </button>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {seasons.map((season) => (
              <div
                key={season.id}
                className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300"
                style={{
                  background: 'rgba(51, 0, 77, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(186, 85, 211, 0.3)',
                }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={season.image}
                    alt={`Mehfil Season ${season.id}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}