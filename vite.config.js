import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    define: {
      'process.env': {}
    },
    build: isProduction ? {
      outDir: 'build',
      cssCodeSplit: false,
      lib: {
        entry: resolve(__dirname, 'src/main.jsx'),
        name: 'CotizadorInteriores',
        fileName: () => 'cotizador.js',
        formats: ['iife']
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            'react': 'React',
            'react-dom': 'ReactDOM'
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'cotizador.css';
            }
            return assetInfo.name || 'asset';
          },
          inlineDynamicImports: true,
        }
      },
    } : {
      outDir: 'dist'
    },
    server: {
      port: 3000,
      open: '/index.html'
    }
  };
});