import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const baseVersion = process.env.npm_package_version || '0.0.0';
let buildMeta = '';
try {
  const hash = execSync('git rev-parse --short HEAD').toString().trim();
  const count = execSync('git rev-list --count HEAD').toString().trim();
  buildMeta = `${baseVersion}+${count}-${hash}`;
} catch {}

// ✅ Vite + React Router config (for local development)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  base: '/', // 👈 This is crucial for correct routing in production
  define: {
    __APP_VERSION__: JSON.stringify(
      (process.env.VITE_BUILD_VERSION || baseVersion).startsWith('v')
        ? (process.env.VITE_BUILD_VERSION || baseVersion)
        : `v${process.env.VITE_BUILD_VERSION || baseVersion}`
    ),
    __APP_BUILD_META__: JSON.stringify(buildMeta || baseVersion),
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    proxy: {
      // Forward API calls to FastAPI backend during development
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [], // keep empty
    }, // Build output directory
  },
  optimizeDeps: {
    include: ['react-data-table-component', 'file-saver', 'exceljs'],
  },
});
