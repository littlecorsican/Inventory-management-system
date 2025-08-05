import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeScene = ({ selectedRoom }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        // Set camera to top diagonal view looking down - adjusted for 200m scene
        camera.position.set(150, 200, 150);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Grid helper - 200 meter square scene
        const gridHelper = new THREE.GridHelper(200, 20);
        scene.add(gridHelper);

        // Create containers for selected room
        const createContainers = (room) => {
            if (!room || !room.containers || room.containers.length === 0) {
                return;
            }

            const containers = room.containers;
            const containerSize = 25; // Fixed size: 5m width, length, height
            const spacing = 30; // 1m gap between containers

            containers.forEach((container, index) => {
                const geometry = new THREE.BoxGeometry(containerSize, containerSize, containerSize);
                
                // Create different colors for each container
                const colors = [0x4285f4, 0xea4335, 0xfbbc04, 0x34a853, 0xff6b6b, 0x4ecdc4];
                const material = new THREE.MeshLambertMaterial({
                    color: colors[index % colors.length],
                    transparent: true,
                    opacity: 0.8
                });

                const cube = new THREE.Mesh(geometry, material);
                cube.castShadow = true;
                cube.receiveShadow = true;

                // Position containers side by side
                cube.position.set(
                    index * spacing - (containers.length - 1) * spacing / 2,
                    containerSize / 2,
                    0
                );

                // Add container name as text
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 1024;
                canvas.height = 256;
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = '#000000';
                context.font = '120px Arial';
                context.textAlign = 'center';
                context.fillText(container.name || `Container ${index + 1}`, canvas.width / 2, canvas.height / 2 + 32);

                const texture = new THREE.CanvasTexture(canvas);
                const textMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
                const textGeometry = new THREE.PlaneGeometry(8, 2);
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                
                textMesh.position.set(0, containerSize / 2 + 1, 0);
                cube.add(textMesh);

                scene.add(cube);
            });
        };

        // Add containers if room is selected
        if (selectedRoom) {
            createContainers(selectedRoom);
        }

        // Camera controls
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        // Initialize with top diagonal view angles
        let targetRotationX = 0.5; // Looking down from above
        let targetRotationY = 0.785; // 45 degrees rotation

        const handleMouseDown = (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        };

        const handleMouseMove = (event) => {
            if (!isMouseDown) return;

            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;

            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;

            mouseX = event.clientX;
            mouseY = event.clientY;
        };

        const handleMouseUp = () => {
            isMouseDown = false;
        };

        const handleWheel = (event) => {
            const zoomSpeed = 0.1;
            const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
            const newDistance = distance + event.deltaY * zoomSpeed;
            
            if (newDistance > 20 && newDistance < 500) {
                camera.position.normalize().multiplyScalar(newDistance);
            }
        };

        // Add event listeners
        renderer.domElement.addEventListener('mousedown', handleMouseDown);
        renderer.domElement.addEventListener('mousemove', handleMouseMove);
        renderer.domElement.addEventListener('mouseup', handleMouseUp);
        renderer.domElement.addEventListener('wheel', handleWheel);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Smooth camera rotation
            const rotationSpeed = 0.05;
            camera.position.x = Math.cos(targetRotationY) * Math.cos(targetRotationX) * camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
            camera.position.y = Math.sin(targetRotationX) * camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
            camera.position.z = Math.sin(targetRotationY) * Math.cos(targetRotationX) * camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            if (!mountRef.current) return;
            
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('mousedown', handleMouseDown);
            renderer.domElement.removeEventListener('mousemove', handleMouseMove);
            renderer.domElement.removeEventListener('mouseup', handleMouseUp);
            renderer.domElement.removeEventListener('wheel', handleWheel);
            
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            
            renderer.dispose();
        };
    }, [selectedRoom]);

    return (
        <div 
            ref={mountRef} 
            style={{ 
                width: '100%', 
                height: '400px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                overflow: 'hidden'
            }}
        />
    );
};

export default ThreeScene; 