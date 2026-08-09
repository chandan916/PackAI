'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PackedContainer, Placement } from '../types/packing';
import { Maximize2, RotateCcw, Info, Layers } from 'lucide-react';

interface Props {
  container: PackedContainer;
}

export default function PackingVisualizer3D({ container }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredPlacement, setHoveredPlacement] = useState<Placement | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera reset trigger
  const resetCameraRef = useRef<() => void>();

  useEffect(() => {
    const containerDiv = mountRef.current;
    if (!containerDiv) return;

    // Clear previous elements
    containerDiv.innerHTML = '';

    const width = containerDiv.clientWidth || 800;
    const height = containerDiv.clientHeight || 500;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0f19');

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    
    // Calculate suitable camera distance based on container size
    const maxDim = Math.max(container.length, container.width, container.height);
    const initialCamPos = new THREE.Vector3(
      container.length * 1.8,
      container.height * 1.8,
      container.width * 2.2
    );
    const containerCenter = new THREE.Vector3(
      container.length / 2,
      container.height / 2,
      container.width / 2
    );

    camera.position.copy(initialCamPos);
    camera.lookAt(containerCenter);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerDiv.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(container.length * 2, container.height * 3, container.width * 2);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.4);
    dirLight2.position.set(-container.length, -container.height, -container.width);
    scene.add(dirLight2);

    // 5. Container Wireframe & Grid Floor
    const containerGroup = new THREE.Group();
    scene.add(containerGroup);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(
      Math.max(container.length, container.width) * 1.5,
      20,
      0x3b82f6,
      0x1e293b
    );
    gridHelper.position.set(container.length / 2, 0, container.width / 2);
    containerGroup.add(gridHelper);

    // Container Bounding Box Wireframe
    const boxGeo = new THREE.BoxGeometry(container.length, container.height, container.width);
    const wireframeGeo = new THREE.WireframeGeometry(boxGeo);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x64748b, linewidth: 2, transparent: true, opacity: 0.6 });
    const wireframeLine = new THREE.LineSegments(wireframeGeo, wireframeMat);
    wireframeLine.position.set(container.length / 2, container.height / 2, container.width / 2);
    containerGroup.add(wireframeLine);

    // Glass Container Walls
    const wallMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.08,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 1.0,
      side: THREE.DoubleSide,
    });
    const wallMesh = new THREE.Mesh(boxGeo, wallMat);
    wallMesh.position.set(container.length / 2, container.height / 2, container.width / 2);
    containerGroup.add(wallMesh);

    // 6. Add Packages as 3D Cuboids
    // Mapping: Backend (x, y, z) -> Three.js (X = x, Y = z, Z = y)
    // Backend: x = length, y = width, z = height
    // Three.js: X = length, Y = height, Z = width
    const packageMeshMap = new Map<THREE.Mesh, Placement>();
    const packageGroup = new THREE.Group();
    containerGroup.add(packageGroup);

    container.placements.forEach((p, idx) => {
      const pLen = p.length;
      const pWidth = p.width;
      const pHeight = p.height;

      const pGeo = new THREE.BoxGeometry(pLen, pHeight, pWidth);
      
      const boxColor = p.color || '#3b82f6';
      const pMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(boxColor),
        roughness: 0.3,
        metalness: 0.1,
      });

      const pMesh = new THREE.Mesh(pGeo, pMat);

      // Center of box position in Three.js
      // Backend: x is along container length, y is width, z is height
      const posX = p.x + pLen / 2;
      const posY = p.z + pHeight / 2; // height goes vertically in 3D
      const posZ = p.y + pWidth / 2;  // width goes along Z axis

      pMesh.position.set(posX, posY, posZ);

      // Add black wireframe border around each box
      const edgeGeo = new THREE.EdgesGeometry(pGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 1.5 });
      const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
      pMesh.add(edgeLine);

      packageGroup.add(pMesh);
      packageMeshMap.set(pMesh, p);
    });

    // 7. Interactive Orbit Controls (Mouse Dragging & Zoom)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = new THREE.Spherical().setFromVector3(
      camera.position.clone().sub(containerCenter)
    );

    const updateCameraFromSpherical = () => {
      spherical.radius = Math.max(maxDim * 0.5, Math.min(maxDim * 5, spherical.radius));
      spherical.phi = Math.max(0.01, Math.min(Math.PI / 2 - 0.01, spherical.phi)); // don't go below ground
      camera.position.setFromSpherical(spherical).add(containerCenter);
      camera.lookAt(containerCenter);
    };

    resetCameraRef.current = () => {
      spherical.setFromVector3(initialCamPos.clone().sub(containerCenter));
      updateCameraFromSpherical();
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = containerDiv.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        spherical.theta -= deltaX * 0.008;
        spherical.phi -= deltaY * 0.008;
        updateCameraFromSpherical();

        previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        // Raycast Hover Detection
        const mouseVec = new THREE.Vector2(
          (mouseX / width) * 2 - 1,
          -(mouseY / height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseVec, camera);

        const intersects = raycaster.intersectObjects(Array.from(packageMeshMap.keys()));

        if (intersects.length > 0) {
          const hoveredMesh = intersects[0].object as THREE.Mesh;
          const placement = packageMeshMap.get(hoveredMesh);
          if (placement) {
            setHoveredPlacement(placement);
            setTooltipPos({ x: mouseX + 15, y: mouseY + 15 });
          }
        } else {
          setHoveredPlacement(null);
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius += e.deltaY * 0.5;
      updateCameraFromSpherical();
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    // 8. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerDiv) return;
      const newW = containerDiv.clientWidth;
      const newH = containerDiv.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [container]);

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden glass-panel border border-slate-800">
      {/* 3D WebGL Mounting Div */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Control Overlay Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => resetCameraRef.current?.()}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 backdrop-blur-sm"
          title="Reset Camera Angle"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Camera Instructions Hint */}
      <div className="absolute bottom-4 left-4 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs text-slate-400">
        <Info className="w-3.5 h-3.5 text-blue-400" />
        <span>Drag to rotate 360° | Scroll to zoom in/out</span>
      </div>

      {/* Package Count Badge */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs text-slate-300 font-medium">
        <Layers className="w-3.5 h-3.5 text-emerald-400" />
        <span>{container.placements.length} Packages Placed</span>
      </div>

      {/* Hover Package Tooltip */}
      {hoveredPlacement && (
        <div
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
          className="absolute z-20 pointer-events-none p-3 rounded-lg bg-slate-900/95 border border-blue-500/50 shadow-2xl backdrop-blur-md text-xs text-slate-200 min-w-[180px]"
        >
          <div className="flex items-center gap-2 font-bold text-blue-400 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: hoveredPlacement.color || '#3b82f6' }}
            />
            {hoveredPlacement.packageName}
          </div>
          <div className="space-y-0.5 text-slate-300 font-mono">
            <div>Dim: {hoveredPlacement.length} × {hoveredPlacement.width} × {hoveredPlacement.height} cm</div>
            <div>Pos: ({hoveredPlacement.x}, {hoveredPlacement.y}, {hoveredPlacement.z})</div>
            <div>Vol: {(hoveredPlacement.length * hoveredPlacement.width * hoveredPlacement.height).toLocaleString()} cm³</div>
          </div>
        </div>
      )}
    </div>
  );
}
