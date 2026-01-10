import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.blockSize = 1;
        this.textures = this.createTextures();
        this.materials = this.createMaterials();
        this.generateTerrain();
    }

    createTextures() {
        const loader = new THREE.TextureLoader();

        // Helper to create a simple noise texture or use colors
        // For now, we'll use simple colored textures with nearest filter for the pixel look
        // In a real app, we might load assets. Here we generate simple canvas textures.

        const createPixelTexture = (color, variance = 0.1) => {
            const size = 64;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, size, size);

            // Add noise
            for (let i = 0; i < 100; i++) {
                const x = Math.floor(Math.random() * size);
                const y = Math.floor(Math.random() * size);
                const w = Math.floor(Math.random() * 5 + 1);
                const h = Math.floor(Math.random() * 5 + 1);
                ctx.fillStyle = `rgba(0,0,0,${Math.random() * variance})`;
                ctx.fillRect(x, y, w, h);
            }

            const texture = new THREE.CanvasTexture(canvas);
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            return texture;
        };

        return {
            grassTop: createPixelTexture('#588106'),
            grassSide: createPixelTexture('#689f38'), // Simplified side
            dirt: createPixelTexture('#866043'),
            stone: createPixelTexture('#7d7d7d'),
        };
    }

    createMaterials() {
        // Minecraft grass block has different textures on top, bottom, and sides
        // 0: right, 1: left, 2: top, 3: bottom, 4: front, 5: back

        const grassMat = [
            new THREE.MeshStandardMaterial({ map: this.textures.grassSide }), // right
            new THREE.MeshStandardMaterial({ map: this.textures.grassSide }), // left
            new THREE.MeshStandardMaterial({ map: this.textures.grassTop }),  // top
            new THREE.MeshStandardMaterial({ map: this.textures.dirt }),      // bottom
            new THREE.MeshStandardMaterial({ map: this.textures.grassSide }), // front
            new THREE.MeshStandardMaterial({ map: this.textures.grassSide }), // back
        ];

        const dirtMat = new THREE.MeshStandardMaterial({ map: this.textures.dirt });
        const stoneMat = new THREE.MeshStandardMaterial({ map: this.textures.stone });

        return { grass: grassMat, dirt: dirtMat, stone: stoneMat };
    }

    generateTerrain() {
        // Create an island
        const size = 20;
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        // We use an instanced mesh for performance
        // But for multi-material blocks (grass), InstancedMesh handles one material array well.

        this.grassMesh = new THREE.InstancedMesh(geometry, this.materials.grass, size * size * 2);
        this.grassMesh.castShadow = true;
        this.grassMesh.receiveShadow = true;

        // Dirt layer
        this.dirtMesh = new THREE.InstancedMesh(geometry, this.materials.dirt, size * size * 5);
        this.dirtMesh.castShadow = true;
        this.dirtMesh.receiveShadow = true;

        let grassCount = 0;
        let dirtCount = 0;

        const matrix = new THREE.Matrix4();

        for (let x = -size / 2; x < size / 2; x++) {
            for (let z = -size / 2; z < size / 2; z++) {
                // Surface Grass
                let y = 0;
                // Add some basic terrain variation
                if (Math.abs(x) > size / 3 || Math.abs(z) > size / 3) {
                    // Edges might be lower? Or just flat for now.
                }

                // Grass Block
                matrix.setPosition(x, y, z);
                this.grassMesh.setMatrixAt(grassCount++, matrix);

                // Dirt below
                matrix.setPosition(x, y - 1, z);
                this.dirtMesh.setMatrixAt(dirtCount++, matrix);

                // Random extra dirt depth
                if (Math.random() > 0.5) {
                    matrix.setPosition(x, y - 2, z);
                    this.dirtMesh.setMatrixAt(dirtCount++, matrix);
                }
            }
        }

        this.scene.add(this.grassMesh);
        this.scene.add(this.dirtMesh);
    }

    update(time) {
        // Animate environment (e.g., clouds, swaying grass??)
    }
}
