import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@components': resolve('src/renderer/src/components'),
        '@pages': resolve('src/renderer/src/pages'),
        '@stores': resolve('src/renderer/src/stores'),
        '@types': resolve('src/renderer/src/types'),
        '@utils': resolve('src/renderer/src/utils')
      }
    },
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: false, // 如果 5173 被占用，自动尝试下一个可用端口
      host: true
    }
  }
})
