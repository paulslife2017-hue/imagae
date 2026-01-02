import { serve } from '@hono/node-server'
import { config } from 'dotenv'

// .dev.vars 파일에서 환경 변수 로드
config({ path: '.dev.vars' })

// Vite 빌드 결과물 import
const appModule = await import('./dist/_worker.js')
const app = appModule.default

const port = process.env.PORT || 3000
const host = process.env.HOST || '0.0.0.0'

console.log(`🚀 Starting server on http://${host}:${port}`)
console.log(`📝 API Key loaded: ${process.env.GOOGLE_AI_API_KEY ? '✓ (length: ' + process.env.GOOGLE_AI_API_KEY.length + ')' : '✗ NOT FOUND'}`)

// Hono 앱의 fetch 함수를 래핑하여 환경 변수 전달
serve({
  fetch: (request, env) => {
    // process.env를 env 객체로 전달
    const envWithProcessEnv = {
      ...env,
      GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY
    }
    return app.fetch(request, envWithProcessEnv)
  },
  port: parseInt(port),
  hostname: host
}, (info) => {
  console.log(`✅ Server is running on http://${info.address}:${info.port}`)
})
