import * as THREE from 'three';

export class VoxelCharacter {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Character Dimensions (Steve-ish)
        // 1 unit = 1 block
        this.pixelSize = 1 / 16; // If we were being precise, but let's keep it simple.

        this.skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffccaa }); // Skin
        this.shirtMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaaa }); // Cyan shirt
        this.pantsMaterial = new THREE.MeshStandardMaterial({ color: 0x0000aa }); // Blue pants
        this.eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x0000aa });

        this.createBody();

        // Initial Position
        this.group.position.set(0, 2, 0); // Stand on ground (y=0 is center of block usually 0.5 up)

        this.targetRotation = 0;
        this.walkSpeed = 0;
    }

    createBody() {
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);

        // Head (8x8x8 pixels roughly -> 0.5 units cubic?)
        // Let's say standard block is 1 unit. Steve is ~2 units tall.
        // Head: 0.5 x 0.5 x 0.5
        this.headGroup = new THREE.Group();
        const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), this.skinMaterial);
        this.headGroup.add(headMesh);
        this.headGroup.position.set(0, 1.5, 0);

        // Eyes
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.02), this.eyeMaterial);
        eyeL.position.set(-0.12, 0, 0.26);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.02), this.eyeMaterial);
        eyeR.position.set(0.12, 0, 0.26);

        // Pupils
        const pupilL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.02), this.pupilMaterial);
        pupilL.position.set(0.03, 0, 0.01); // Relative to eye
        eyeL.add(pupilL);

        const pupilR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.02), this.pupilMaterial);
        pupilR.position.set(-0.03, 0, 0.01);
        eyeR.add(pupilR);

        this.headGroup.add(eyeL);
        this.headGroup.add(eyeR);

        this.group.add(this.headGroup);

        // Body
        this.bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.25), this.shirtMaterial);
        this.bodyMesh.position.set(0, 0.875, 0);
        this.group.add(this.bodyMesh);

        // Arms
        this.armL = new THREE.Group();
        const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), this.shirtMaterial);
        armLMesh.position.set(0, -0.25, 0); // Pivot at shoulder
        this.armL.add(armLMesh);
        this.armL.position.set(-0.38, 1.15, 0);
        this.group.add(this.armL);

        this.armR = new THREE.Group();
        const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), this.shirtMaterial);
        armRMesh.position.set(0, -0.25, 0);
        this.armR.add(armRMesh);
        this.armR.position.set(0.38, 1.15, 0);
        this.group.add(this.armR);

        // Legs
        this.legL = new THREE.Group();
        const legLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), this.pantsMaterial);
        legLMesh.position.set(0, -0.375, 0);
        this.legL.add(legLMesh);
        this.legL.position.set(-0.125, 0.75, 0);
        this.group.add(this.legL);

        this.legR = new THREE.Group();
        const legRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), this.pantsMaterial);
        legRMesh.position.set(0, -0.375, 0);
        this.legR.add(legRMesh);
        this.legR.position.set(0.125, 0.75, 0);
        this.group.add(this.legR);
    }

    update(time, mouse) {
        // Idle Animation (Breathing)
        this.bodyMesh.scale.y = 1 + Math.sin(time * 2) * 0.02;
        this.headGroup.position.y = 1.5 + Math.sin(time * 2) * 0.01;

        // Head Tracking
        if (mouse) {
            // Target Look
            const targetX = mouse.x * 1;
            const targetY = mouse.y * 0.5;

            // Smoothly look
            this.headGroup.rotation.y += ((-targetX) - this.headGroup.rotation.y) * 0.1;
            this.headGroup.rotation.x += ((targetY) - this.headGroup.rotation.x) * 0.1;

            // Body rotation to face slightly
            this.group.rotation.y += ((-targetX * 0.5) - this.group.rotation.y) * 0.05;
        }
    }

    walkAnimation(time) {
        // Simple swing
        const speed = 10;
        this.armL.rotation.x = Math.sin(time * speed) * 0.5;
        this.armR.rotation.x = -Math.sin(time * speed) * 0.5;
        this.legL.rotation.x = -Math.sin(time * speed) * 0.5;
        this.legR.rotation.x = Math.sin(time * speed) * 0.5;
    }
}
