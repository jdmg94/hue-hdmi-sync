import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  optimizeDeps: { 
    exclude: ['node-dns-sd', 'node-dtls-client'],    
  },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//], input: { CVWorker: './CVWorker.ts' } } }),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
