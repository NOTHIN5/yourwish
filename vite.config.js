import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    publicDir: 'public',
    base: './', // Relative base for GitHub Pages
    build: {
        outDir: 'docs',
        assetsDir: 'assets',
        emptyOutDir: true
    },
    server: {
        port: 3000,
        open: true,
    }
});
