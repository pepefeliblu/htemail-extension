import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'popup.html'),
                editor: resolve(__dirname, 'editor.html'),
                background: resolve(__dirname, 'src/background/index.ts'),
                content: resolve(__dirname, 'src/content/index.ts'),
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name === 'background') return 'background.js';
                    if (chunkInfo.name === 'content') return 'content.js';
                    return 'assets/[name]-[hash].js';
                },
            },
        },
    },
});
