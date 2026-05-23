import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  resolve: {
    alias: {
      '@core': '/src/core',
      '@entity': '/src/entity',
      '@system': '/src/system',
      '@ui': '/src/ui',
      '@config': '/src/config',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
