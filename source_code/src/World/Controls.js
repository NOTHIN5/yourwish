import * as THREE from 'three';

export class Controls {
    constructor(camera, container) {
        this.camera = camera;
        this.container = container;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        // Event Listeners
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('click', this.onClick.bind(this));

        this.events = {
            click: [],
            mousemove: []
        };
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.events.mousemove.forEach(cb => cb(this.mouse));
    }

    onClick(event) {
        // Raycast
        this.raycaster.setFromCamera(this.mouse, this.camera);
        // Dispatch to listeners (we'll implement specific raycasting logic in Scene or interaction manager)
        this.events.click.forEach(cb => cb(this.raycaster));
    }

    on(event, callback) {
        if (this.events[event]) {
            this.events[event].push(callback);
        }
    }
}
