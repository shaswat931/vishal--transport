// three-scene.js

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.165.0/three.module.min.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) {
        console.warn('Three.js canvas not found. Skipping 3D scene setup.');
        return;
    }

    let scene, camera, renderer;
    let grid, movingCubes = [];
    let particleGeometry, particleMaterial, particles;

    const init = () => {
        // 1. Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0A2463); // Dark background matching primary-color

        // 2. Camera setup
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 10, 30); // Position camera slightly above and further back
        camera.lookAt(0, 0, 0);

        // 3. Renderer setup
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true, // Smooths edges
            alpha: true // Allow transparency for CSS overlay
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0); // Transparent background for overlay content

        // 4. Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Brighter light from a direction
        directionalLight.position.set(5, 10, 7);
        scene.add(directionalLight);

        // 5. Create 3D Elements
        // Ground Grid (representing a network/road)
        const gridSize = 100;
        const divisions = 100; // More divisions for a denser grid
        const gridColor = 0x007BFF; // Bright blue for grid lines
        grid = new THREE.GridHelper(gridSize, divisions, gridColor, gridColor);
        grid.material.opacity = 0.3; // Subtle opacity
        grid.material.transparent = true;
        grid.position.y = 0;
        scene.add(grid);

        // Moving "Vehicles" (simple cubes/spheres)
        const numCubes = 10;
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 3); // Slightly elongated to look like vehicles
        const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x28a745 }); // Accent green
        const sphereGeometry = new THREE.SphereGeometry(0.7, 16, 16);
        const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x00bfff }); // Sky blue

        for (let i = 0; i < numCubes; i++) {
            let mesh;
            if (Math.random() > 0.5) {
                mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
            } else {
                mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            }

            mesh.position.x = (Math.random() - 0.5) * gridSize * 0.8; // Random X within grid
            mesh.position.y = Math.random() * 2 + 0.5; // Slightly above ground
            mesh.position.z = Math.random() * -gridSize; // Start far back

            mesh.userData.speed = Math.random() * 0.2 + 0.1; // Random speed
            movingCubes.push(mesh);
            scene.add(mesh);
        }

        // Particle System (Subtle, dynamic background effect)
        const particleCount = 500;
        particleGeometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const pColor1 = new THREE.Color(0x007BFF); // Bright blue
        const pColor2 = new THREE.Color(0x00bfff); // Sky blue

        for (let i = 0; i < particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * gridSize * 1.5, // x
                (Math.random() - 0.5) * 50,           // y
                (Math.random() - 0.5) * gridSize * 1.5 // z
            );
            // Assign a color blend based on position or randomness
            const color = new THREE.Color().lerpColors(pColor1, pColor2, Math.random());
            colors.push(color.r, color.g, color.b);
        }
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        particleMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending // For glowing effect
        });
        particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Resize handler
        window.addEventListener('resize', onWindowResize);
    };

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);

        // Animate grid
        grid.position.z += 0.05; // Make grid move forward slightly
        if (grid.position.z > (grid.geometry.parameters.size / grid.geometry.parameters.divisions)) {
            grid.position.z = 0; // Reset when it moves a full division
        }

        // Animate moving "vehicles"
        movingCubes.forEach(cube => {
            cube.position.z += cube.userData.speed; // Move forward
            if (cube.position.z > camera.position.z + 5) { // If it goes past camera, reset it
                cube.position.x = (Math.random() - 0.5) * grid.geometry.parameters.size * 0.8;
                cube.position.y = Math.random() * 2 + 0.5;
                cube.position.z = Math.random() * -grid.geometry.parameters.size * 0.8 - 50; // Reset far back
                cube.userData.speed = Math.random() * 0.2 + 0.1; // New random speed
            }
            cube.rotation.y += 0.01; // Subtle rotation
        });

        // Animate particles
        particles.rotation.y += 0.0005; // Slow rotation
        particles.position.z += 0.02; // Particles slowly float forward
        if (particles.position.z > 20) { // Reset particles if they move too far
            particles.position.z = -50;
        }


        renderer.render(scene, camera);
    };

    // Initialize and start animation if canvas is available
    if (canvas) {
        init();
        animate();
    }
});