/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_NOTION_TOKEN: string
  readonly VITE_NOTION_PROJECTS_DB_ID: string
  readonly VITE_NOTION_CHARACTERS_DB_ID: string
  readonly VITE_NOTION_SCENES_DB_ID: string
  readonly VITE_NOTION_LOCATIONS_DB_ID: string
  readonly VITE_DEV_MODE: string
  readonly VITE_AUTO_LOAD_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
