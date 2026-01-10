import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { Environment } from './Environment.js';
import { VoxelCharacter } from '../Character/VoxelCharacter.js';
import { ProjectShowcase } from './ProjectShowcase.js';
import { ContactManager } from './ContactManager.js';
import { Controls } from './Controls.js';

export class SceneManager {
    constructor(container) {
        this.container = container;
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 50);

        // Camera
        this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Lights
        this.initLights();

        this.initWorld();

        this.controls = new Controls(this.camera, this.container);
        this.character = new VoxelCharacter(this.scene);
        this.projectShowcase = new ProjectShowcase(this.scene);
        this.contactManager = new ContactManager(this.scene);

        // Interaction
        this.controls.on('click', (raycaster) => {
            const interactables = [...this.projectShowcase.interactables, ...this.contactManager.interactables];
            const intersects = raycaster.intersectObjects(interactables);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (object.userData.isProject) {
                    const project = object.userData.project;
                    window.dispatchEvent(new CustomEvent('show-modal', {
                        detail: {
                            title: project.name,
                            content: project.description
                        }
                    }));
                } else if (object.userData.isContact) {
                    window.dispatchEvent(new CustomEvent('show-modal', {
                        detail: {
                            title: 'Contact Us',
                            content: 'Email: hello@hyperdev.online\n\nCraft your message!'
                        }
                    }));
                }
            }
        });

        // Helpers
        // const axesHelper = new THREE.AxesHelper( 5 );
        // this.scene.add( axesHelper );

        // Event Listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Loop binding
        this.update = this.update.bind(this);
    }

    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);
        this.dirLight = dirLight; // Save reference
    }

    initWorld() {
        this.environment = new Environment(this.scene);
    }

    onWindowResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    start() {
        this.renderer.setAnimationLoop(this.update);
    }

    update(time) {
        TWEEN.update(time);

        // Day/Night Cycle
        const cycleDuration = 60000; // 1 minute per day
        const dayTime = (time % cycleDuration) / cycleDuration;
        const angle = dayTime * Math.PI * 2;
        const sunDist = 20;

        if (this.dirLight) {
            this.dirLight.position.set(Math.cos(angle) * sunDist, Math.sin(angle) * sunDist, 10);

            // Sky Color
            const sunHeight = Math.sin(angle);
            let r, g, b;

            if (sunHeight > 0) {
                // Day
                r = 0.5; g = 0.8; b = 1.0; // Sky blue
            } else {
                // Night
                r = 0.05; g = 0.05; b = 0.2; // Midnight blue
            }

            // Simple interpolation could be better but this works for blocky feel
            this.scene.background.setRGB(r * (0.5 + 0.5 * sunHeight), g * (0.5 + 0.5 * sunHeight), b);
            // Fog matches sky
            this.scene.fog.color.copy(this.scene.background);
        }

        if (this.environment) this.environment.update(time);

        if (this.character) this.character.update(time / 1000, this.controls ? this.controls.mouse : null);
        if (this.projectShowcase) this.projectShowcase.update(time / 1000);

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}
