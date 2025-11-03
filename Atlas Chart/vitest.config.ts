import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL as NodeURL } from 'node:url';

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
    
    // Performance and coverage settings
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Performance benchmarks
    benchmark: {
      outputFile: './test-results/benchmark.json',
      reporters: ['verbose', 'json']
    },
    
    // Test timeout and retry settings
    testTimeout: 10000,
    hookTimeout: 10000,
    retry: 2,
    
    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    },
    
    // Reporter configuration
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/index.html'
    },
    
    // Watch mode configuration
    watch: false,
    
    // Environment variables for testing
    env: {
      NODE_ENV: 'test',
      VITEST: 'true'
    }
  },
  
  // Build configuration
  build: {
    commonjsOptions: {
      include: [/elkjs/, /node_modules/],
    },
  },
  
  // Development server configuration
  server: {
    hmr: {
      overlay: false,
    },
  },
  
  // Define global constants
  define: {
    global: 'globalThis',
  },
  
  // Optimize dependencies
  optimizeDeps: {
    exclude: ['elkjs'],
    include: ['react', 'react-dom'],
  },
});




