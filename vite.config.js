import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    historyApiFallback: true, // Garante que rotas manuais voltem para o index.html
  },
  plugins: [react()],
})
