import { defineConfig } from 'vite';

export default defineConfig({
    root: 'source_code',
    publicDir: 'public',
    base: './', // Relative base for GitHub Pages
    build: {
        outDir: '../',
        assetsDir: 'assets',
        emptyOutDir: false
    },
    server: {
        port: 3000,
        open: true,
    }
});
