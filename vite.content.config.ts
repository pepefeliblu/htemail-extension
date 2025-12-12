import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    build: {
        emptyOutDir: false, // Don't wipe the dist folder (built by main config)
        outDir: 'dist',
        lib: {
            entry: resolve(__dirname, 'src/content/index.ts'),
            name: 'HTEMAIL_Content', // Global variable name for IIFE (not used but required)
            fileName: () => 'content.js',
            formats: ['iife'], // Force IIFE to bundle everything and avoid imports
        },
        rollupOptions: {
            output: {
                // Ensure we don't get any code splitting
                inlineDynamicImports: true,
                extend: true,
            },
        },
    },
});
