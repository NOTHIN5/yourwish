import * as THREE from 'three';

export class ContactManager {
    constructor(scene) {
        this.scene = scene;
        this.interactables = [];
        this.createContactBlock();
    }

    createContactBlock() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        // Crafting Table simple texture simulation (Wood + Details)
        // We'll use a brown color for now or procedural texture if we had time.
        // Let's use a distinct color.
        const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // SaddleBrown

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0.5, 5); // In front
        this.mesh.userData = { isContact: true };

        this.scene.add(this.mesh);
        this.interactables.push(this.mesh);
    }
}
