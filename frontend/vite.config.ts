import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Get the API URL from environment variable or use a default
  const apiBaseUrl = process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:8000/api'
  console.log('Building with API URL:', apiBaseUrl)

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      exclude: ['@radix-ui/react-slot', '@radix-ui/react-select', '@radix-ui/react-dialog'],
      include: ['plotly.js-dist']
    },
    build: {
      // Reduce build strictness for Docker deployment
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // Changed to false to keep console logs
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
      commonjsOptions: {
        include: [/plotly\.js-dist/, /node_modules/],
      },
    },
    server: {
      port: 5174,
      host: true
    },
    define: {
      // Ensure environment variables are exposed
      __API_BASE_URL__: JSON.stringify(apiBaseUrl),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
      'import.meta.env': JSON.stringify({
        ...env,
        VITE_API_BASE_URL: apiBaseUrl,
        DEV: mode === 'development',
        PROD: mode === 'production',
        SSR: false,
        BASE_URL: '/'
      })
    },
  }
})
