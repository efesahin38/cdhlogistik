import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative paths
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        impressum: resolve(__dirname, 'impressum.html'),
        datenschutz: resolve(__dirname, 'datenschutz.html')
      }
    }
  }
});
