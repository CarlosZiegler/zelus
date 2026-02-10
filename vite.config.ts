import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import devtoolsJson from 'vite-plugin-devtools-json' // https://github.com/ChromeDevTools/vite-plugin-devtools-json

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    // Large visualization libraries (mermaid, cytoscape) exceed 500kB - this is expected
    chunkSizeWarningLimit: 1000,
    rollupOptions: isSsrBuild ? { input: './server/app.ts' } : undefined,
  },
  plugins: [devtoolsJson(), tailwindcss(), reactRouter(), tsconfigPaths()],
}))
