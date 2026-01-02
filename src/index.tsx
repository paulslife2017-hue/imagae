import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  GOOGLE_AI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube 이미지 생성기</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-3xl font-bold mb-6 text-gray-800">YouTube 이미지 생성기</h1>
        
        <!-- 스토리 입력 -->
        <div class="mb-4">
            <label class="block text-gray-700 font-semibold mb-2">스토리 입력:</label>
            <textarea id="storyInput" 
                      class="w-full h-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="스토리를 입력하세요...">1974년, 미국 한 대학교의 강연장에 레이 A. 크록이 연설을 하고 있습니다.</textarea>
        </div>
        
        <!-- 버튼 -->
        <button id="analyzeBtn" 
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
            씬 분석 시작
        </button>
        
        <!-- 결과 표시 -->
        <div id="result" class="mt-4 hidden">
            <div class="bg-green-50 border-l-4 border-green-500 p-4">
                <h2 class="font-bold text-green-800">분석 결과</h2>
                <div id="resultContent" class="mt-2 text-gray-700"></div>
            </div>
        </div>
        
        <!-- 로딩 표시 -->
        <div id="loading" class="mt-4 text-center text-gray-600 hidden">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2">분석 중...</p>
        </div>
    </div>

    <script>
        console.log('페이지 로드됨');
        
        const btn = document.getElementById('analyzeBtn');
        const storyInput = document.getElementById('storyInput');
        const result = document.getElementById('result');
        const resultContent = document.getElementById('resultContent');
        const loading = document.getElementById('loading');
        
        console.log('버튼:', btn);
        console.log('입력:', storyInput);
        
        btn.addEventListener('click', async function() {
            console.log('버튼 클릭됨!');
            
            const story = storyInput.value.trim();
            console.log('스토리:', story);
            
            if (!story) {
                alert('스토리를 입력하세요!');
                return;
            }
            
            // UI 업데이트
            btn.disabled = true;
            btn.textContent = '분석 중...';
            loading.classList.remove('hidden');
            result.classList.add('hidden');
            
            try {
                console.log('API 호출 시작...');
                
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ story: story })
                });
                
                console.log('응답 상태:', response.status);
                
                const data = await response.json();
                console.log('응답 데이터:', data);
                
                if (data.success) {
                    resultContent.innerHTML = '<p>씬 개수: <strong>' + data.scenes.length + '</strong>개</p>' +
                        '<p class="mt-2">' + JSON.stringify(data.scenes[0], null, 2) + '</p>';
                    result.classList.remove('hidden');
                } else {
                    alert('오류: ' + data.error);
                }
                
            } catch (error) {
                console.error('오류:', error);
                alert('오류 발생: ' + error.message);
            } finally {
                btn.disabled = false;
                btn.textContent = '씬 분석 시작';
                loading.classList.add('hidden');
            }
        });
        
        console.log('이벤트 리스너 등록 완료');
    </script>
</body>
</html>
  `)
})

// 간단한 씬 분석 API
app.post('/api/analyze', async (c) => {
  try {
    const { story } = await c.req.json()
    
    if (!story) {
      return c.json({ success: false, error: '스토리가 비어있습니다' })
    }

    // 간단한 씬 분석 (AI 없이)
    const words = story.split(' ')
    const duration = Math.max(3, Math.min(10, Math.floor(words.length / 5)))
    
    const scenes = [{
      index: 1,
      description: story,
      visualElements: '스토리 내용을 시각화한 일러스트레이션',
      duration: duration,
      startTime: 0,
      endTime: duration
    }]

    return c.json({ 
      success: true, 
      scenes: scenes,
      totalDuration: duration
    })
    
  } catch (error) {
    console.error('오류:', error)
    return c.json({ success: false, error: error.message })
  }
})

export default app
