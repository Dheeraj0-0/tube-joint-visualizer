import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Settings, Plus, RotateCcw, Eye, Grid3x3, ZoomIn, ZoomOut } from 'lucide-react';

const TubeJointVisualizer = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef({ isDragging: false, previousMouse: { x: 0, y: 0 } });
  const tubesRef = useRef([]);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  const [tubeType, setTubeType] = useState('square');
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(50);
  const [thickness, setThickness] = useState(5);
  const [length, setLength] = useState(200);
  const [angle, setAngle] = useState(90);
  const [wireframe, setWireframe] = useState(false);
  const [selectedTube, setSelectedTube] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 5000);
    camera.position.set(300, 300, 300);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(1000, 20, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(150);
    scene.add(axesHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Mouse controls for camera
    const handleMouseDown = (e) => {
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        controlsRef.current.isDragging = true;
        controlsRef.current.previousMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e) => {
      if (controlsRef.current.isDragging) {
        const dx = e.clientX - controlsRef.current.previousMouse.x;
        const dy = e.clientY - controlsRef.current.previousMouse.y;

        const radius = camera.position.length();
        const theta = Math.atan2(camera.position.x, camera.position.z);
        const phi = Math.acos(camera.position.y / radius);

        const newTheta = theta - dx * 0.01;
        const newPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi + dy * 0.01));

        camera.position.x = radius * Math.sin(newPhi) * Math.sin(newTheta);
        camera.position.y = radius * Math.cos(newPhi);
        camera.position.z = radius * Math.sin(newPhi) * Math.cos(newTheta);
        camera.lookAt(0, 0, 0);

        controlsRef.current.previousMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      controlsRef.current.isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.5;
      camera.position.multiplyScalar(1 + delta * 0.001);
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const createTubeGeometry = (w, h, t, l) => {
    const shape = new THREE.Shape();
    shape.moveTo(-w/2, -h/2);
    shape.lineTo(w/2, -h/2);
    shape.lineTo(w/2, h/2);
    shape.lineTo(-w/2, h/2);
    shape.lineTo(-w/2, -h/2);

    const hole = new THREE.Path();
    hole.moveTo(-(w/2 - t), -(h/2 - t));
    hole.lineTo(w/2 - t, -(h/2 - t));
    hole.lineTo(w/2 - t, h/2 - t);
    hole.lineTo(-(w/2 - t), h/2 - t);
    hole.lineTo(-(w/2 - t), -(h/2 - t));
    shape.holes.push(hole);

    const extrudeSettings = { depth: l, bevelEnabled: false };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  const saveHistory = () => {
    const state = tubesRef.current.map(tube => ({
      position: tube.position.clone(),
      rotation: tube.rotation.clone(),
      params: tube.userData
    }));
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(state);
    historyIndexRef.current++;
  };

  const addTube = () => {
    if (!sceneRef.current) return;

    const geometry = createTubeGeometry(width, height, thickness, length);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x4a90e2,
      wireframe: wireframe,
      side: THREE.DoubleSide
    });
    const tube = new THREE.Mesh(geometry, material);

    // Position new tubes with offset
    const offset = tubesRef.current.length * 50;
    tube.position.set(offset, 0, 0);
    tube.rotation.x = Math.PI / 2;

    tube.userData = { width, height, thickness, length, type: tubeType };

    sceneRef.current.add(tube);
    tubesRef.current.push(tube);
    saveHistory();
  };

  const addJointedTube = () => {
    if (!sceneRef.current || tubesRef.current.length === 0) {
      addTube();
      return;
    }

    const parentTube = tubesRef.current[tubesRef.current.length - 1];
    const geometry = createTubeGeometry(width, height, thickness, length);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0xe24a4a,
      wireframe: wireframe,
      side: THREE.DoubleSide
    });
    const tube = new THREE.Mesh(geometry, material);

    // Position at parent tube end
    const parentLength = parentTube.userData.length;
    tube.position.copy(parentTube.position);
    
    // Calculate position based on parent rotation
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyEuler(parentTube.rotation);
    direction.multiplyScalar(parentLength / 2);
    tube.position.add(direction);

    // Apply joint angle
    tube.rotation.copy(parentTube.rotation);
    tube.rotation.y += (angle * Math.PI / 180);

    // Move along new direction
    const newDirection = new THREE.Vector3(0, 0, 1);
    newDirection.applyEuler(tube.rotation);
    newDirection.multiplyScalar(length / 2);
    tube.position.add(newDirection);

    // Highlight joint area
    const jointGeometry = new THREE.SphereGeometry(Math.max(width, height) * 0.3);
    const jointMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffff00,
      transparent: true,
      opacity: 0.5
    });
    const joint = new THREE.Mesh(jointGeometry, jointMaterial);
    joint.position.copy(parentTube.position).add(direction);
    sceneRef.current.add(joint);

    tube.userData = { width, height, thickness, length, type: tubeType };

    sceneRef.current.add(tube);
    tubesRef.current.push(tube);
    saveHistory();
  };

  const clearAll = () => {
    tubesRef.current.forEach(tube => {
      sceneRef.current.remove(tube);
      tube.geometry.dispose();
      tube.material.dispose();
    });
    tubesRef.current = [];
    
    // Clear joints
    sceneRef.current.children.forEach(child => {
      if (child.geometry instanceof THREE.SphereGeometry) {
        sceneRef.current.remove(child);
        child.geometry.dispose();
        child.material.dispose();
      }
    });
    
    historyRef.current = [];
    historyIndexRef.current = -1;
  };

  const toggleWireframe = () => {
    const newWireframe = !wireframe;
    setWireframe(newWireframe);
    tubesRef.current.forEach(tube => {
      tube.material.wireframe = newWireframe;
    });
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      // Restore state logic here
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.8);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.2);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Control Panel */}
      <div className="w-80 bg-gray-800 p-6 overflow-y-auto border-r border-gray-700">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Tube Joint Visualizer
        </h1>

        {/* Tube Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Tube Type</label>
          <select 
            value={tubeType} 
            onChange={(e) => setTubeType(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
          >
            <option value="square">Square</option>
            <option value="rectangular">Rectangular</option>
          </select>
        </div>

        {/* Dimensions */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Width (mm)</label>
            <input 
              type="number" 
              value={width} 
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              min="10"
              max="200"
            />
          </div>
          
          {tubeType === 'rectangular' && (
            <div>
              <label className="block text-sm font-medium mb-1">Height (mm)</label>
              <input 
                type="number" 
                value={height} 
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                min="10"
                max="200"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Thickness (mm)</label>
            <input 
              type="number" 
              value={thickness} 
              onChange={(e) => setThickness(Number(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              min="1"
              max="20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Length (mm)</label>
            <input 
              type="number" 
              value={length} 
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              min="50"
              max="500"
            />
          </div>
        </div>

        {/* Joint Angle */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Joint Angle (°)</label>
          <div className="flex gap-2 mb-2">
            {[30, 45, 90, 135].map(a => (
              <button
                key={a}
                onClick={() => setAngle(a)}
                className={`flex-1 py-1 rounded ${angle === a ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                {a}°
              </button>
            ))}
          </div>
          <input 
            type="range" 
            value={angle} 
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full"
            min="0"
            max="180"
          />
          <div className="text-center text-sm mt-1">{angle}°</div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={addTube}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Tube
          </button>
          
          <button 
            onClick={addJointedTube}
            className="w-full bg-green-600 hover:bg-green-700 py-2 rounded flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Jointed Tube
          </button>
          
          <button 
            onClick={toggleWireframe}
            className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Toggle Wireframe
          </button>
          
          <button 
            onClick={clearAll}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-700 rounded text-sm">
          <h3 className="font-semibold mb-2">Controls:</h3>
          <ul className="space-y-1 text-xs">
            <li>• Middle mouse / Shift+Drag: Rotate view</li>
            <li>• Mouse wheel: Zoom</li>
            <li>• Add Tube: Create standalone tube</li>
            <li>• Add Jointed: Connect to last tube</li>
          </ul>
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          Tubes: {tubesRef.current.length}
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <div ref={mountRef} className="w-full h-full" />
        
        {/* Zoom controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
          <button 
            onClick={zoomIn}
            className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full shadow-lg"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button 
            onClick={zoomOut}
            className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full shadow-lg"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TubeJointVisualizer;
