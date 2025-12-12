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
                // content: built separately via vite.content.config.ts
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name === 'background') return 'background.js';
                    if (chunkInfo.name === 'content') return 'content.js';
                    return 'assets/[name]-[hash].js';
                },
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'vendor-react';
                        }
                        if (id.includes('@milkdown') || id.includes('prosemirror')) {
                            return 'vendor-milkdown';
                        }
                        return 'vendor';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1200, // CodeMirror is ~1MB, this covers it without suppressing valid warnings
    },
});
