import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL as NodeURL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new NodeURL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.git', '.cache'],
  },
  optimizeDeps: {
    exclude: ['elkjs'],
    include: ['react', 'react-dom'],
  },
  define: {
    global: 'globalThis',
  },
  server: {
    hmr: {
      overlay: false, // Disable error overlay for File redefinition issue
    },
  },
  build: {
    commonjsOptions: {
      include: [/elkjs/, /node_modules/],
    },
  },
})
