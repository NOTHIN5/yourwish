export class HUD {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.id = 'minecraft-hud';
        this.element.style.position = 'absolute';
        this.element.style.bottom = '10px';
        this.element.style.left = '50%';
        this.element.style.transform = 'translateX(-50%)';
        this.element.style.textAlign = 'center';

        this.render();
        this.container.appendChild(this.element);

        window.addEventListener('show-modal', (e) => {
            this.showModal(e.detail.title, e.detail.content);
        });
    }

    render() {
        // Hotbar
        const hotbar = document.createElement('div');
        hotbar.className = 'hotbar';
        hotbar.style.display = 'flex';
        hotbar.style.gap = '2px';
        hotbar.style.padding = '5px';
        hotbar.style.background = 'rgba(0, 0, 0, 0.5)';
        hotbar.style.border = '2px solid #555';

        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.style.width = '40px';
            slot.style.height = '40px';
            slot.style.border = '2px solid #888';
            slot.style.backgroundColor = '#333';

            // Dummy items
            if (i === 0) slot.innerText = '🗡️'; // Sword
            if (i === 1) slot.innerText = '⛏️'; // Pickaxe

            slot.style.display = 'flex';
            slot.style.justifyContent = 'center';
            slot.style.alignItems = 'center';
            slot.style.fontSize = '24px';

            hotbar.appendChild(slot);
        }

        this.element.appendChild(hotbar);

        // XP Bar (below hotbar usually, or above)
        const xpBar = document.createElement('div');
        xpBar.style.width = '100%';
        xpBar.style.height = '5px';
        xpBar.style.background = 'green';
        xpBar.style.marginTop = '5px';
        this.element.appendChild(xpBar);
    }

    showModal(title, content) {
        // Simple modal implementation
        let modal = document.getElementById('hud-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'hud-modal';
        modal.style.position = 'absolute';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = '#C6C6C6'; // Minecraft UI gray
        modal.style.border = '4px solid #373737';
        modal.style.padding = '20px';
        modal.style.color = '#373737';
        modal.style.fontFamily = "'Press Start 2P', cursive";
        modal.style.minWidth = '300px';
        modal.style.textAlign = 'center';
        modal.style.pointerEvents = 'auto'; // Make clickable

        const h2 = document.createElement('h2');
        h2.innerText = title;
        modal.appendChild(h2);

        const p = document.createElement('p');
        p.innerText = content;
        p.style.fontSize = '12px';
        p.style.lineHeight = '1.5';
        modal.appendChild(p);

        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Close';
        closeBtn.style.marginTop = '20px';
        closeBtn.style.padding = '10px 20px';
        closeBtn.style.fontFamily = 'inherit';
        closeBtn.style.background = '#777';
        closeBtn.style.border = '2px solid #fff';
        closeBtn.style.color = '#fff';
        closeBtn.style.cursor = 'pointer';

        closeBtn.onclick = () => modal.remove();

        modal.appendChild(closeBtn);
        this.element.appendChild(modal);
    }
}
