import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  build: {
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    cssMinify: 'lightningcss',
    assetsInlineLimit: 4096,
    target: 'es2022',
    rollupOptions: {
      output: {
        // Split heavy third-party code out of page chunks so route-level
        // lazy loading actually shrinks what each navigation downloads.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@react-google-maps')) return 'vendor-maps';
          if (id.includes('recharts')) return 'vendor-charts';
          if (id.includes('swiper')) return 'vendor-swiper';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('react-icons') || id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('@tanstack/react-query') || id.includes('axios') || id.includes('socket.io-client')) return 'vendor-data';
          if (id.includes('react-router-dom')) return 'vendor-router';
          // Keep React in main vendor to avoid createContext order bug (vendor-BiyTdn7a before vendor-react)
          return 'vendor';
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
