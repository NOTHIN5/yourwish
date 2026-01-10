// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// --- Audio System ---
const sfxHover = document.getElementById('sfx-hover');
const sfxClick = document.getElementById('sfx-click');

function playSound(type) {
    // In a real app, we'd have real samples. For now, we simulate success implicitly.
    // console.log("Playing Sound: " + type);
}

// --- Loading Screen ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen');
    gsap.to(loader, {
        opacity: 0,
        duration: 0.5,
        delay: 1.5,
        onComplete: () => loader.style.display = 'none'
    });

    // Init World
    initWorld();
});

// --- Three.js World ---
let scene, camera, renderer, characterHead, characterGroup;
let isNight = false;

function initWorld() {
    const container = document.getElementById('canvas-container');
    const width = window.innerWidth;
    const height = window.innerHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1, 5); // Eye level

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // --- Lighting (Toon Friendly) ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- Materials (Cel Shading Attempt) ---
    // Note: True Gradient Maps require texture loading. We use simple colors for now with ToonMaterial.
    const skinMat = new THREE.MeshToonMaterial({ color: 0xFFDFC4, gradientMap: null });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x3FEEE6, gradientMap: null }); // Cyan Hair
    const outfitMat = new THREE.MeshToonMaterial({ color: 0x1A1A1D, gradientMap: null });

    // --- Character Construction (Procedural Anime) ---
    characterGroup = new THREE.Group();
    scene.add(characterGroup);

    // 1. Head
    const headGeo = new THREE.SphereGeometry(0.7, 32, 32);
    // Flatten chin
    headGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 1.1, 1));
    characterHead = new THREE.Mesh(headGeo, skinMat);
    characterHead.castShadow = true;
    characterGroup.add(characterHead);

    // 2. Hair (Spikes)
    const hairGroup = new THREE.Group();
    characterHead.add(hairGroup);

    const spikeGeo = new THREE.ConeGeometry(0.15, 0.6, 16);

    // Back Hair (Radiating spikes)
    for (let i = 0; i < 12; i++) {
        const spike = new THREE.Mesh(spikeGeo, hairMat);
        const angle = (i / 12) * Math.PI * 2;
        const radius = 0.6;
        spike.position.set(Math.cos(angle) * radius, 0.4, Math.sin(angle) * radius);
        spike.lookAt(0, 0.4, 0);
        // Tilt out
        spike.rotateX(-Math.PI / 4);
        hairGroup.add(spike);
    }

    // Top Hair
    for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(spikeGeo, hairMat);
        spike.position.set((Math.random() - 0.5) * 0.5, 0.8, (Math.random() - 0.5) * 0.5);
        spike.rotation.x = (Math.random() - 0.5);
        spike.rotation.z = (Math.random() - 0.5);
        hairGroup.add(spike);
    }

    // Bangs
    const bangGeo = new THREE.ConeGeometry(0.1, 0.4, 16);
    for (let i = 0; i < 5; i++) {
        const bang = new THREE.Mesh(bangGeo, hairMat);
        bang.position.set((i - 2) * 0.15, 0.5, 0.65);
        bang.rotation.x = -0.5;
        hairGroup.add(bang);
    }

    // 3. Eyes (Planes with Texture/Shapes)
    // Procedural Eyes using basic shapes
    const eyeWhiteGeo = new THREE.PlaneGeometry(0.25, 0.2);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const eyeL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeL.position.set(-0.25, 0.05, 0.65);
    eyeL.rotation.y = 0.2;
    characterHead.add(eyeL);

    const eyeR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeR.position.set(0.25, 0.05, 0.65);
    eyeR.rotation.y = -0.2;
    characterHead.add(eyeR);

    // Pupils (Black)
    const pupilGeo = new THREE.PlaneGeometry(0.1, 0.15);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.z = 0.01; // Layer on top
    eyeL.add(pupilL);

    const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
    pupilR.position.z = 0.01;
    eyeR.add(pupilR);

    // 4. Body (Shoulders)
    const neckGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = -0.6;
    characterGroup.add(neck);

    const torsoGeo = new THREE.BoxGeometry(0.8, 0.8, 0.4);
    const torso = new THREE.Mesh(torsoGeo, outfitMat);
    torso.position.y = -1.1;
    characterGroup.add(torso);

    // POSITION CHARACTER
    characterGroup.position.set(1.5, -0.5, 0); // To the right side
    characterGroup.rotation.y = -0.3;


    // --- Environment (Sakura Particles) ---
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    const particleSpeeds = [];

    for (let i = 0; i < particlesCount; i++) {
        posArray[i * 3] = (Math.random() - 0.5) * 15; // x
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 15; // y
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
        particleSpeeds.push(0.01 + Math.random() * 0.02);
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Pink Sakura Material
    const particlesMat = new THREE.PointsMaterial({
        color: 0xFFC0CB,
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const sakuraSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(sakuraSystem);


    // --- Interaction Logic ---
    let mouse = new THREE.Vector2();
    let targetLook = new THREE.Vector3(0, 0, 5);

    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / width) * 2 - 1;
        mouse.y = -(e.clientY / height) * 2 + 1;

        // Character Head Tracking
        // We want the head to look at the mouse position projected into 3D space approx
        targetLook.x = mouse.x * 2;
        targetLook.y = mouse.y * 2;
        targetLook.z = 5; // Look at camera plane
    });

    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('night-mode');
        // Change Three.js lights colors
        if (document.body.classList.contains('night-mode')) {
            hemiLight.groundColor.setHex(0x203A43);
            hemiLight.color.setHex(0x0F2027);
        } else {
            hemiLight.groundColor.setHex(0x444444);
            hemiLight.color.setHex(0xffffff);
        }
    });


    // --- Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // 1. Head Tracking (Smooth Lerp)
        if (characterHead) {
            const lookTarget = new THREE.Vector3().copy(targetLook);
            // Limit neck rotation
            lookTarget.x = Math.max(-1, Math.min(1, lookTarget.x));

            // Current rotation lerp to target
            const currentRot = characterHead.rotation.clone();
            characterHead.lookAt(lookTarget);
            const targetRot = characterHead.rotation.clone();
            characterHead.rotation.copy(currentRot); // Reset

            characterHead.rotation.x += (targetRot.x - characterHead.rotation.x) * 0.1;
            characterHead.rotation.y += (targetRot.y - characterHead.rotation.y) * 0.1;
        }

        // 2. Idle Breathing
        characterGroup.position.y = -0.5 + Math.sin(time * 2) * 0.02;

        // 3. Sakura Fall
        const positions = sakuraSystem.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
            positions[i * 3 + 1] -= particleSpeeds[i]; // Fall down directly using array index
            positions[i * 3] += Math.sin(time + i) * 0.005; // Sway

            if (positions[i * 3 + 1] < -5) {
                positions[i * 3 + 1] = 5; // Reset to top
            }
        }
        sakuraSystem.geometry.attributes.position.needsUpdate = true; // IMPORTANT

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    });
}
