// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Loading Screen
window.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 1500);

    initThreeJS();
});

// Three.js Logic
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff9a9e, 1, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Character Group
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    // --- Create Cute Character (Procedural) ---
    // Materials
    const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9,
        transmission: 0.2, // Glass-like
        clearcoat: 1.0,
    });

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xff9a9e });

    // Body (Sphere)
    const bodyGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    characterGroup.add(body);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.15, 32, 32);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.5, 0.3, 1.3);
    characterGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.5, 0.3, 1.3);
    characterGroup.add(rightEye);

    // Blushes
    const blushGeo = new THREE.CircleGeometry(0.2, 32);

    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.8, 0.1, 1.25);
    leftBlush.rotation.y = -0.5;
    characterGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.8, 0.1, 1.25);
    rightBlush.rotation.y = 0.5;
    characterGroup.add(rightBlush);

    // Floating Particles
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 50;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xff9a9e,
        transparent: true,
        opacity: 0.8
    });

    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);


    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = width / 2;
    const windowHalfY = height / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Handle Resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Idle Animation (Bobbing)
        characterGroup.position.y = Math.sin(elapsedTime * 2) * 0.1;

        // Mouse Looking (Smooth)
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        characterGroup.rotation.y += 0.05 * (targetX - characterGroup.rotation.y);
        characterGroup.rotation.x += 0.05 * (targetY - characterGroup.rotation.x);

        // Particle Animation
        particlesMesh.rotation.y = elapsedTime * 0.1;
        particlesMesh.rotation.x = elapsedTime * 0.05;

        renderer.render(scene, camera);
    }

    animate();

    // Click Interaction (Jump)
    container.addEventListener('click', () => {
        gsap.to(characterGroup.position, {
            y: 1.0,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: "power2.out"
        });

        // Happy spin
        gsap.to(characterGroup.rotation, {
            y: characterGroup.rotation.y + Math.PI * 2,
            duration: 0.8,
            ease: "back.out(1.7)"
        });
    });
}
