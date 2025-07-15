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
  define: {
    // Environment variables for runtime access
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
    'import.meta.env.VITE_NOTION_TOKEN': JSON.stringify(process.env.VITE_NOTION_TOKEN),
    'import.meta.env.VITE_NOTION_PROJECTS_DB_ID': JSON.stringify(process.env.VITE_NOTION_PROJECTS_DB_ID),
    'import.meta.env.VITE_NOTION_CHARACTERS_DB_ID': JSON.stringify(process.env.VITE_NOTION_CHARACTERS_DB_ID),
    'import.meta.env.VITE_NOTION_SCENES_DB_ID': JSON.stringify(process.env.VITE_NOTION_SCENES_DB_ID),
    'import.meta.env.VITE_NOTION_LOCATIONS_DB_ID': JSON.stringify(process.env.VITE_NOTION_LOCATIONS_DB_ID)
  }
})
