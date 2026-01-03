import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from '@hono/node-server/vercel'

const app = new Hono()

app.use('/*', cors())

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

// 나노바나나프로 이미지 생성 API (Google AI API 사용)
app.post('/api/generate-image', async (c) => {
  try {
    const { prompt } = await c.req.json()
    
    if (!prompt) {
      return c.json({ success: false, error: '프롬프트가 필요합니다' })
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return c.json({ success: false, error: 'Google AI API 키가 설정되지 않았습니다' })
    }

    console.log('🎨 나노바나나프로 (Gemini 3 Pro Image)로 이미지 생성 시작...')
    
    // 한국어 스타일 프롬프트
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

16:9 비율, YouTube용, 한글 텍스트 필수 포함`

    // Gemini 3 Pro Image (나노바나나프로) API 호출
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=' + apiKey, {
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
      console.error('❌ Gemini API 오류:', response.status, errorText)
      throw new Error('Gemini API 오류: ' + response.status)
    }

    const data = await response.json()
    console.log('✅ 나노바나나프로 응답 받음')
    
    // 응답에서 이미지 찾기
    if (data.candidates && data.candidates[0]) {
      const parts = data.candidates[0].content.parts
      
      for (const part of parts) {
        const inlineData = part.inline_data || part.inlineData
        if (inlineData && inlineData.data) {
          const imageBase64 = inlineData.data
          const mimeType = inlineData.mime_type || inlineData.mimeType || 'image/png'
          const imageUrl = 'data:' + mimeType + ';base64,' + imageBase64
          console.log('✅ 나노바나나프로 이미지 생성 성공!')
          return c.json({ success: true, imageUrl: imageUrl })
        }
      }
    }
    
    console.warn('⚠️ 응답에 이미지 없음:', JSON.stringify(data).substring(0, 300))
    throw new Error('이미지 생성 실패: 응답에 이미지 없음')
    
  } catch (error) {
    console.error('❌ 이미지 생성 오류:', error.message)
    
    // Fallback placeholder
    const colors = ['8B7355', 'A0826D', '6B9AC4', 'D4A574', 'C4A57B']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    const sceneNumber = Math.floor(Math.random() * 100)
    
    const svg = '<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" style="stop-color:#' + randomColor + '"/>' +
          '<stop offset="100%" style="stop-color:#' + randomColor + 'dd"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect width="1920" height="1080" fill="url(#g)"/>' +
      '<circle cx="960" cy="540" r="150" fill="rgba(255,255,255,0.2)"/>' +
      '<text x="960" y="500" font-size="60" font-weight="bold" fill="white" text-anchor="middle">이미지 생성 중</text>' +
      '<text x="960" y="580" font-size="30" fill="white" text-anchor="middle" opacity="0.9">씬 #' + sceneNumber + '</text>' +
      '<text x="960" y="640" font-size="24" fill="white" text-anchor="middle" opacity="0.8">나노바나나프로</text>' +
    '</svg>'
    
    const imageUrl = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
    return c.json({ success: true, imageUrl: imageUrl, fallback: true, error: error.message })
  }
})

// 메인 페이지
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 스토리 영상 생성기</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .scene-card { transition: all 0.3s ease; }
        .scene-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
        .progress-bar {
            transition: width 0.5s ease;
            background: linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899);
            background-size: 200% 100%;
            animation: gradient 2s ease infinite;
        }
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4">
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                <i class="fas fa-magic mr-3"></i>
                AI 스토리 영상 생성기 (나노바나나프로)
            </h1>
            <p class="text-gray-600 text-lg">Vercel + Google Gemini 3 Pro Image (나노바나나프로)</p>
        </div>
        
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <h2 class="text-2xl font-bold mb-6">🎨 스토리 입력</h2>
            <textarea id="storyInput" 
                      class="w-full h-64 px-6 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-200" 
                      placeholder="YouTube 영상 스토리를 입력하세요..."></textarea>
            <button id="startBtn" 
                    class="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl">
                <i class="fas fa-play mr-2"></i>시작
            </button>
            <div id="result" class="mt-8"></div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        document.getElementById('startBtn').addEventListener('click', async () => {
            const story = document.getElementById('storyInput').value.trim()
            if (!story) {
                alert('스토리를 입력하세요!')
                return
            }
            
            const resultDiv = document.getElementById('result')
            resultDiv.innerHTML = '<div class="text-center"><div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div><p class="mt-4 text-gray-600">처리 중...</p></div>'
            
            try {
                // 씬 분석
                const sceneRes = await axios.post('/api/analyze-scenes', { story })
                if (!sceneRes.data.success) {
                    throw new Error(sceneRes.data.error)
                }
                
                const scenes = sceneRes.data.scenes
                resultDiv.innerHTML = '<h3 class="text-xl font-bold mb-4">분석 완료: ' + scenes.length + '개 씬</h3>'
                
                // 이미지 생성 (첫 번째 씬만 테스트)
                const scene = scenes[0]
                const imagePrompt = 'Scene 1: ' + scene.description + '\\nVisual: ' + scene.visualElements
                
                const imgRes = await axios.post('/api/generate-image', { prompt: imagePrompt })
                if (imgRes.data.success && imgRes.data.imageUrl) {
                    resultDiv.innerHTML += '<div class="mt-6"><img src="' + imgRes.data.imageUrl + '" class="rounded-xl shadow-lg max-w-full"/></div>'
                }
            } catch (error) {
                resultDiv.innerHTML = '<div class="text-red-600">오류: ' + error.message + '</div>'
            }
        })
    </script>
</body>
</html>
  `)
})

export default handle(app)
