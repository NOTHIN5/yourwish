import './style.css';
import { SceneManager } from './World/Scene.js';
import { HUD } from './UI/HUD.js';

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    const uiLayer = document.getElementById('ui-layer');

    const sceneManager = new SceneManager(container);
    sceneManager.start();

    const hud = new HUD(uiLayer);
});
