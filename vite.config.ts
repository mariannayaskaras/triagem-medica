import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // ← necessário para usar path.resolve

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // ← aqui o alias é configurado
    }
  }
})
