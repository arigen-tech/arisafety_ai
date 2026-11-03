import react from '@vitejs/plugin-react'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { API_HOST } from './src/config/apiConfig.js'

function configureIisApiProxy(apiBaseUrl) {
  return {
    name: 'configure-iis-api-proxy',
    apply: 'build',
    async closeBundle() {
      const configPath = resolve(process.cwd(), 'dist', 'web.config')
      const config = await readFile(configPath, 'utf8')
      if (!config.includes('__API_BASE_URL__')) {
        throw new Error('IIS web.config is missing the API base URL placeholder')
      }
      await writeFile(
        configPath,
        config.replaceAll('__API_BASE_URL__', apiBaseUrl),
      )
    },
  }
}

export default defineConfig(() => {
  let apiBaseUrl

  try {
    const parsedUrl = new URL(API_HOST)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error()
    }
    if (parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash) {
      throw new Error()
    }
    apiBaseUrl = parsedUrl.origin
  } catch {
    throw new Error(
      'API_HOST in src/config/apiConfig.js must be an absolute HTTP(S) origin with no path, query, or fragment',
    )
  }

  return {
    plugins: [react(), configureIisApiProxy(apiBaseUrl)],
    server: {
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
