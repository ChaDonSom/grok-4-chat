import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // Expose to network
    port: 5173,
  },
})
