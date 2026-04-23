import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: [
        { find: /^@react-three\/drei$/, replacement: path.resolve(__dirname, 'src/lib/drei.ts') },
        { find: /^lucide-react$/, replacement: path.resolve(__dirname, 'src/lib/lucide.ts') },
        { find: /^@\//, replacement: `${path.resolve(__dirname, '.')}/` },
      ],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/archive/**',
          '**/apps/**',
          '**/dist/**',
          '**/.codex-build-probe/**',
        ],
      },
    },
    build: {
      cssMinify: false,
    },
  };
});
