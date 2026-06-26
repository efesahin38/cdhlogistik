import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative paths
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        startseite: resolve(__dirname, 'startseite.html'),
        impressum: resolve(__dirname, 'impressum.html'),
        datenschutz: resolve(__dirname, 'datenschutz.html')
      }
    }
  }
});
