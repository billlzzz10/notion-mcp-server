import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3002,
    open: true,
    host: true
  },
  build: {
    target: 'esnext',
    outDir: 'web-build',
    emptyOutDir: true
  },
  // Do not expose sensitive environment variables to the client here.
})
