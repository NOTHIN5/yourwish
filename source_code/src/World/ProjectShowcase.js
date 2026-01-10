import * as THREE from 'three';

export class ProjectShowcase {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.projects = [
            { id: 'syncwatch', name: 'SyncWatch', color: 0xff0000, position: [-5, 1, -5], description: 'Watch videos together!' },
            { id: 'calculator', name: 'Chapri Calc', color: 0xffff00, position: [5, 1, -5], description: 'A unique calculator experience.' },
            { id: 'editor', name: 'Smart Text', color: 0x0000ff, position: [0, 1, -8], description: 'AI-powered text editor.' }
        ];

        this.interactables = [];
        this.createShowcase();
    }

    createShowcase() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const pedestalGeo = new THREE.BoxGeometry(1, 0.5, 1);
        const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x555555 }); // Stone

        this.projects.forEach(project => {
            const projectGroup = new THREE.Group();
            projectGroup.position.set(...project.position);

            // Pedestal
            const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
            pedestal.position.y = -0.25;
            projectGroup.add(pedestal);

            // Item (Floating Block)
            const material = new THREE.MeshStandardMaterial({ color: project.color });
            const item = new THREE.Mesh(geometry, material);
            item.position.y = 1;
            item.userData = { isProject: true, project: project };

            // Animation data
            item.userData.originalY = 1;
            item.userData.animate = (time) => {
                item.position.y = 1 + Math.sin(time * 2) * 0.1;
                item.rotation.y += 0.01;
            };

            projectGroup.add(item);
            this.interactables.push(item);

            // Label
            // Assuming we might add 3D text later or just use HTML overlay on hover

            this.group.add(projectGroup);
        });
    }

    update(time) {
        this.interactables.forEach(item => {
            if (item.userData.animate) {
                item.userData.animate(time);
            }
        });
    }
}
