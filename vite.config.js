import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/(authenticate|login|saveCard|newCard|deleteCard|getCardsQA|uploadImage|notes|newNotes|updateMaps|getMap|getImage)': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
