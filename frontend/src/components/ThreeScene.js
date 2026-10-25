import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const COLORS = [0x4285f4, 0xea4335, 0xfbbc04, 0x34a853, 0xff6b6b, 0x4ecdc4];
const BOX_SIZE = 0.6; // metres

// Text label that always faces the camera
const makeLabel = (text) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    context.fillStyle = 'rgba(255,255,255,0.9)';
    if (context.roundRect) {
        context.beginPath();
        context.roundRect(4, 4, canvas.width - 8, canvas.height - 8, 24);
        context.fill();
    } else {
        context.fillRect(4, 4, canvas.width - 8, canvas.height - 8);
    }
    context.fillStyle = '#111';
    context.font = '56px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const label = text.length > 16 ? `${text.slice(0, 15)}…` : text;
    context.fillText(label, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
    sprite.scale.set(1.2, 0.3, 1);
    sprite.renderOrder = 1;
    return sprite;
};

/**
 * 3D view of a room. Containers with x/y/z coordinates (metres from the room's corner) are
 * drawn where they are; others are laid out in a grid on the floor. Tap a box to open it.
 */
const ThreeScene = ({ room, onSelectContainer }) => {
    const mountRef = useRef(null);
    const onSelectRef = useRef(onSelectContainer);
    onSelectRef.current = onSelectContainer;

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount || !room) return undefined;

        const width = room.width || 5;
        const length = room.length || 5;
        const height = room.height || 3;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf3f5f8);

        // Camera setup – start from a top diagonal view that fits the room
        const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        const span = Math.max(width, length, height);
        camera.position.set(span * 0.9, span * 1.1, span * 1.2);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        // Mouse, touch and pinch-zoom
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.enableDamping = true;
        controls.maxPolarAngle = Math.PI / 2 - 0.05;
        controls.minDistance = 1;
        controls.maxDistance = span * 4;
        controls.update();

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(width, height * 3, length);
        scene.add(directionalLight);

        // Floor, grid (1m) and room outline, centred on the origin
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(width, length),
            new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        const grid = new THREE.GridHelper(Math.max(width, length), Math.max(width, length), 0xcccccc, 0xe5e5e5);
        grid.position.y = 0.001;
        scene.add(grid);

        const outline = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, length)),
            new THREE.LineBasicMaterial({ color: 0x90a4ae })
        );
        outline.position.y = height / 2;
        scene.add(outline);

        // Containers
        const boxes = [];
        const containers = room.containers || [];
        const perRow = Math.max(1, Math.floor(width / (BOX_SIZE * 2)));
        let autoIndex = 0;
        containers.forEach((container, index) => {
            const material = new THREE.MeshLambertMaterial({ color: COLORS[index % COLORS.length], transparent: true, opacity: 0.9 });
            const cube = new THREE.Mesh(new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE), material);

            let x;
            let y;
            let z;
            if (container.xCoor != null || container.zCoor != null) {
                x = container.xCoor || 0;
                z = container.zCoor || 0;
                y = container.yCoor || 0;
            } else {
                // No position saved: line them up along the front wall
                x = BOX_SIZE + (autoIndex % perRow) * BOX_SIZE * 2;
                z = BOX_SIZE + Math.floor(autoIndex / perRow) * BOX_SIZE * 2;
                y = 0;
                autoIndex += 1;
            }
            cube.position.set(x - width / 2, y + BOX_SIZE / 2, z - length / 2);
            cube.userData.container = container;

            const label = makeLabel(container.name || `Container ${index + 1}`);
            label.position.set(0, BOX_SIZE * 0.95, 0);
            cube.add(label);

            scene.add(cube);
            boxes.push(cube);
        });

        // Tap / click a box to open it (ignore drags)
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        let downAt = null;
        const handlePointerDown = (event) => { downAt = { x: event.clientX, y: event.clientY }; };
        const handlePointerUp = (event) => {
            if (!downAt || Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) > 6) return;
            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const hit = raycaster.intersectObjects(boxes, false)[0];
            if (hit) onSelectRef.current?.(hit.object.userData.container);
        };
        renderer.domElement.addEventListener('pointerdown', handlePointerDown);
        renderer.domElement.addEventListener('pointerup', handlePointerUp);

        // Animation loop
        renderer.setAnimationLoop(() => {
            controls.update();
            renderer.render(scene, camera);
        });

        // Keep the canvas sized to its container (window resize, phone rotation, layout changes)
        const resizeObserver = new ResizeObserver(() => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            if (!w || !h) return;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
        resizeObserver.observe(mount);

        // Cleanup
        return () => {
            renderer.setAnimationLoop(null);
            resizeObserver.disconnect();
            renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
            renderer.domElement.removeEventListener('pointerup', handlePointerUp);
            controls.dispose();
            scene.traverse((obj) => {
                obj.geometry?.dispose();
                if (obj.material) {
                    obj.material.map?.dispose();
                    obj.material.dispose();
                }
            });
            renderer.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, [room]);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: 'min(60vh, 480px)',
                minHeight: 280,
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '8px',
                overflow: 'hidden',
                touchAction: 'none',
            }}
        />
    );
};

export default ThreeScene;
