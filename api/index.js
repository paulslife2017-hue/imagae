import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from '@hono/node-server/vercel'
import { readFile } from 'fs/promises'

const app = new Hono()

app.use('/*', cors())

// 메인 페이지
app.get('/', async (c) => {
  try {
    const html = await readFile('./test_page.html', 'utf-8')
    return c.html(html)
  } catch (error) {
    return c.html('<h1>페이지를 찾을 수 없습니다</h1><p>' + error.message + '</p>')
  }
})

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    apiKey: process.env.GOOGLE_AI_API_KEY ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  })
})

// 씬 분석 API
app.post('/api/analyze-scenes', async (c) => {
  try {
    const { story } = await c.req.json()
    
    if (!story) {
      return c.json({ success: false, error: '스토리가 비어있습니다' })
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return c.json({ success: false, error: 'Google AI API 키가 설정되지 않았습니다' })
    }

    const prompt = `다음 스토리를 YouTube 영상용 씬으로 분할하세요.

스토리:
${story}

요구사항:
1. 각 씬은 최소 3초, 최대 10초 (시청자가 지루하지 않도록 최적의 길이로 자동 조절)
2. 중요한 장면은 7~10초, 짧은 전환 장면은 3~5초로 조절
3. 장면이 너무 짧게 나뉘지 않도록 자연스러운 전환점에서만 분할
4. 전체 스토리가 자연스럽게 흐르도록 구성
5. 각 씬에 상세한 시각적 설명 포함
6. JSON 형식으로 응답

응답 형식:
{
  "scenes": [
    {
      "index": 1,
      "description": "씬 설명 (간결하지만 명확하게)",
      "visualElements": "시각적 요소 (캐릭터, 배경, 분위기 등)",
      "duration": 6,
      "startTime": 0,
      "endTime": 6
    }
  ]
}`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API 오류:', response.status, errorText)
      return c.json({ success: false, error: `Gemini API 오류: ${response.status}` })
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0]) {
      const text = data.candidates[0].content.parts[0].text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        
        let currentTime = 0
        result.scenes.forEach((scene, index) => {
          scene.index = index + 1
          scene.startTime = currentTime
          scene.endTime = currentTime + scene.duration
          currentTime += scene.duration
        })
        
        return c.json({ success: true, scenes: result.scenes, totalDuration: currentTime })
      }
    }
    
    return c.json({ success: false, error: '씬 분석 실패' })
    
  } catch (error) {
    console.error('씬 분석 오류:', error)
    return c.json({ success: false, error: error.message })
  }
})

// 나노바나나프로 이미지 생성 API
app.post('/api/generate-image', async (c) => {
  try {
    const { prompt, aspectRatio = '16:9' } = await c.req.json()
    
    if (!prompt) {
      return c.json({ success: false, error: '프롬프트가 필요합니다' })
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return c.json({ success: false, error: 'Google AI API 키가 설정되지 않았습니다' })
    }

    console.log('🎨 나노바나나프로 이미지 생성 시작...')
    
    const stylePrompt = `한국 교육 YouTube 콘텐츠용 따뜻한 손그림 일러스트:

핵심 스타일:
- 손으로 그린 듯한 디지털 일러스트, 따뜻하고 감성적인 분위기
- 색상: 따뜻한 갈색(#8B7355), 베이지(#D4A574), 은은한 블루(#6B9AC4)
- 배경: 붉은 벽돌 벽과 창문이 있는 교실 분위기
- 캐릭터: 단순하지만 표현력 있는 만화풍, 감정이 명확히 드러남
- 조명: 부드럽고 따뜻한 확산 조명
- 질감: 종이/캔버스 텍스처, 붓터치가 보임

중요: 반드시 명확하고 읽기 쉬운 한글 텍스트로 상황을 설명해야 합니다.
칠판에 쓴 글씨처럼 또는 자막처럼 자연스럽게 배치하세요.

씬 내용: ${prompt}

${aspectRatio} 비율, YouTube용, 한글 텍스트 필수 포함`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: stylePrompt }]
        }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API 오류:', response.status, errorText)
      
      const svg = `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="1920" height="1080" fill="#8B7355"/>
        <text x="960" y="540" font-size="60" fill="white" text-anchor="middle">이미지 생성 실패</text>
        <text x="960" y="620" font-size="30" fill="white" text-anchor="middle" opacity="0.8">${response.status} 오류</text>
      </svg>`
      
      return c.json({ 
        success: false, 
        error: `Gemini API 오류: ${response.status}`,
        imageUrl: 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'),
        fallback: true
      })
    }

    const data = await response.json()
    console.log('Gemini 응답 받음')
    
    if (data.candidates && data.candidates[0]) {
      const parts = data.candidates[0].content.parts
      
      for (const part of parts) {
        const inlineData = part.inline_data || part.inlineData
        if (inlineData && inlineData.data) {
          const imageBase64 = inlineData.data
          const mimeType = inlineData.mime_type || inlineData.mimeType || 'image/png'
          const imageUrl = `data:${mimeType};base64,${imageBase64}`
          console.log('✅ 이미지 생성 성공!')
          return c.json({ success: true, imageUrl })
        }
      }
    }
    
    console.log('응답에 이미지 없음')
    
    const svg = `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <rect width="1920" height="1080" fill="#D4A574"/>
      <text x="960" y="540" font-size="60" fill="white" text-anchor="middle">이미지 없음</text>
    </svg>`
    
    return c.json({ 
      success: false, 
      error: '응답에 이미지 없음',
      imageUrl: 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'),
      fallback: true
    })
    
  } catch (error) {
    console.error('이미지 생성 오류:', error)
    
    const svg = `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <rect width="1920" height="1080" fill="#6B9AC4"/>
      <text x="960" y="540" font-size="60" fill="white" text-anchor="middle">오류 발생</text>
      <text x="960" y="620" font-size="30" fill="white" text-anchor="middle" opacity="0.8">${error.message}</text>
    </svg>`
    
    return c.json({ 
      success: false, 
      error: error.message,
      imageUrl: 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'),
      fallback: true
    })
  }
})

export default handle(app)
