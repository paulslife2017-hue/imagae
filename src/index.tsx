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
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8">
    <div class="max-w-4xl mx-auto">
        <!-- 헤더 -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
                <i class="fas fa-images mr-2 text-blue-600"></i>
                YouTube 이미지 생성기
            </h1>
            <p class="text-gray-600">AI가 스토리를 분석하고 일관성 있는 이미지를 생성합니다</p>
        </div>

        <!-- 입력 섹션 -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-edit mr-2 text-purple-600"></i>
                스토리 입력
            </h2>
            <textarea id="storyInput" 
                      class="w-full h-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="YouTube 영상의 전체 스토리를 입력하세요...">1974년, 미국 한 대학교의 강연장에 레이 A. 크록이 연설을 하고 있습니다. 맥도날드 창업자 레이 A. 크록은 학생들에게 성공의 비결에 대해 이야기합니다. "성공의 비결은 끈기와 비전입니다. 포기하지 마세요." 학생들은 크록의 열정적인 강연에 경청하며 메모를 합니다.</textarea>
            
            <button id="analyzeBtn" 
                    class="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition">
                <i class="fas fa-magic mr-2"></i>
                <span id="btnText">AI 씬 분석 시작</span>
            </button>
        </div>

        <!-- 씬 분석 결과 -->
        <div id="sceneSection" class="bg-white rounded-lg shadow-lg p-6 mb-6 hidden">
            <h2 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-film mr-2 text-indigo-600"></i>
                씬 분석 결과
            </h2>
            <div id="sceneList" class="space-y-3 mb-4"></div>
            <button id="generateBtn" 
                    class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition">
                <i class="fas fa-play mr-2"></i>
                이미지 생성 시작
            </button>
        </div>

        <!-- 이미지 생성 진행 -->
        <div id="progressSection" class="bg-white rounded-lg shadow-lg p-6 mb-6 hidden">
            <h2 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-spinner fa-spin mr-2 text-purple-600"></i>
                이미지 생성 중...
            </h2>
            <div id="progressList" class="space-y-4"></div>
        </div>

        <!-- 생성 완료 -->
        <div id="completedSection" class="bg-white rounded-lg shadow-lg p-6 mb-6 hidden">
            <h2 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-check-circle mr-2 text-green-600"></i>
                생성 완료
            </h2>
            <div id="imageGrid" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"></div>
            
            <button id="downloadBtn" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition">
                <i class="fas fa-download mr-2"></i>
                모든 이미지 다운로드 (ZIP)
            </button>
        </div>

        <!-- 제목 및 썸네일 추천 -->
        <div id="recommendSection" class="bg-white rounded-lg shadow-lg p-6 hidden">
            <h2 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-star mr-2 text-yellow-600"></i>
                제목 및 썸네일 추천
            </h2>
            
            <div class="mb-6">
                <h3 class="font-semibold text-gray-700 mb-3">추천 제목 (클릭하여 복사)</h3>
                <div id="titleList" class="space-y-2"></div>
            </div>
            
            <div>
                <h3 class="font-semibold text-gray-700 mb-3">추천 썸네일 (3개)</h3>
                <div id="thumbnailGrid" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
            </div>
        </div>

        <!-- 로딩 -->
        <div id="loading" class="text-center py-8 hidden">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p class="text-gray-600 font-semibold" id="loadingText">처리 중...</p>
        </div>
    </div>

    <script>
        console.log('페이지 로드됨');
        
        let scenes = [];
        let generatedImages = [];
        
        const analyzeBtn = document.getElementById('analyzeBtn');
        const generateBtn = document.getElementById('generateBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const storyInput = document.getElementById('storyInput');
        
        // 씬 분석
        analyzeBtn.addEventListener('click', async function() {
            console.log('씬 분석 시작');
            
            const story = storyInput.value.trim();
            if (!story) {
                alert('스토리를 입력하세요!');
                return;
            }
            
            analyzeBtn.disabled = true;
            document.getElementById('btnText').innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>분석 중...';
            showLoading('AI가 스토리를 분석하여 씬을 분할하고 있습니다...');
            
            try {
                const response = await fetch('/api/analyze-scenes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ story: story })
                });
                
                const data = await response.json();
                console.log('씬 분석 결과:', data);
                
                if (data.success) {
                    scenes = data.scenes;
                    displayScenes();
                } else {
                    alert('오류: ' + data.error);
                }
                
            } catch (error) {
                console.error('오류:', error);
                alert('오류 발생: ' + error.message);
            } finally {
                analyzeBtn.disabled = false;
                document.getElementById('btnText').textContent = 'AI 씬 분석 시작';
                hideLoading();
            }
        });
        
        // 씬 표시
        function displayScenes() {
            const sceneList = document.getElementById('sceneList');
            sceneList.innerHTML = '';
            
            let totalDuration = 0;
            scenes.forEach((scene, index) => {
                totalDuration += scene.duration;
                
                const div = document.createElement('div');
                div.className = 'border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r-lg';
                div.innerHTML = '<div class="flex justify-between items-start">' +
                    '<div class="flex-1">' +
                        '<span class="font-semibold text-gray-800">씬 ' + (index + 1) + '</span>' +
                        '<span class="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">' + scene.duration + '초</span>' +
                        '<p class="text-sm text-gray-700 mt-1">' + scene.description + '</p>' +
                    '</div>' +
                '</div>';
                sceneList.appendChild(div);
            });
            
            const summary = document.createElement('div');
            summary.className = 'mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg';
            summary.innerHTML = '<strong>총 ' + scenes.length + '개 씬</strong> | 예상 영상 길이: ' + totalDuration + '초 (' + Math.floor(totalDuration / 60) + '분 ' + (totalDuration % 60) + '초)';
            sceneList.appendChild(summary);
            
            document.getElementById('sceneSection').classList.remove('hidden');
        }
        
        // 이미지 생성
        generateBtn.addEventListener('click', async function() {
            console.log('이미지 생성 시작');
            
            if (!confirm('총 ' + scenes.length + '개 이미지를 생성합니다. 각 이미지당 약 2-3분 소요됩니다.\\n\\n계속하시겠습니까?')) {
                return;
            }
            
            generateBtn.disabled = true;
            document.getElementById('progressSection').classList.remove('hidden');
            document.getElementById('completedSection').classList.add('hidden');
            document.getElementById('recommendSection').classList.add('hidden');
            
            const progressList = document.getElementById('progressList');
            progressList.innerHTML = '';
            generatedImages = [];
            
            // 전체 스토리 컨텍스트 준비
            const fullStory = storyInput.value.trim();
            
            // 각 씬 이미지 생성
            for (let i = 0; i < scenes.length; i++) {
                const scene = scenes[i];
                
                const progressCard = document.createElement('div');
                progressCard.id = 'progress-' + i;
                progressCard.className = 'border rounded-lg p-4 bg-white';
                progressCard.innerHTML = '<div class="flex items-start gap-3">' +
                    '<div id="icon-' + i + '" class="flex-shrink-0">' +
                        '<div class="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>' +
                    '</div>' +
                    '<div class="flex-1">' +
                        '<div class="font-semibold">씬 ' + (i + 1) + ' / ' + scenes.length + '</div>' +
                        '<p class="text-sm text-gray-600 mt-1">' + scene.description.substring(0, 80) + '...</p>' +
                        '<div id="status-' + i + '" class="text-sm text-gray-500 mt-2">생성 중...</div>' +
                    '</div>' +
                '</div>';
                progressList.appendChild(progressCard);
                
                try {
                    const response = await fetch('/api/generate-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            scene: scene,
                            fullStory: fullStory,
                            sceneIndex: i,
                            totalScenes: scenes.length
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('icon-' + i).innerHTML = '<i class="fas fa-check-circle text-green-600 text-4xl"></i>';
                        document.getElementById('status-' + i).innerHTML = '<span class="text-green-600">✓ 생성 완료</span>';
                        
                        generatedImages.push({
                            index: i,
                            scene: scene,
                            imageUrl: data.imageUrl
                        });
                    } else {
                        document.getElementById('icon-' + i).innerHTML = '<i class="fas fa-times-circle text-red-600 text-4xl"></i>';
                        document.getElementById('status-' + i).innerHTML = '<span class="text-red-600">✗ ' + data.error + '</span>';
                    }
                    
                } catch (error) {
                    console.error('이미지 생성 오류:', error);
                    document.getElementById('icon-' + i).innerHTML = '<i class="fas fa-times-circle text-red-600 text-4xl"></i>';
                    document.getElementById('status-' + i).innerHTML = '<span class="text-red-600">✗ 오류 발생</span>';
                }
            }
            
            // 생성 완료 후 표시
            displayCompletedImages();
            
            // 제목 및 썸네일 추천
            await recommendTitlesAndThumbnails();
            
            generateBtn.disabled = false;
        });
        
        // 완료된 이미지 표시
        function displayCompletedImages() {
            const imageGrid = document.getElementById('imageGrid');
            imageGrid.innerHTML = '';
            
            generatedImages.forEach(item => {
                const card = document.createElement('div');
                card.className = 'bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition';
                card.innerHTML = '<img src="' + item.imageUrl + '" alt="Scene ' + (item.index + 1) + '" class="w-full h-48 object-cover">' +
                    '<div class="p-3">' +
                        '<div class="font-semibold mb-1">씬 ' + (item.index + 1) + '</div>' +
                        '<p class="text-xs text-gray-600 mb-2">' + item.scene.description.substring(0, 60) + '...</p>' +
                        '<a href="' + item.imageUrl + '" download="scene_' + (item.index + 1) + '.png" ' +
                           'class="block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded">' +
                            '<i class="fas fa-download mr-1"></i>다운로드' +
                        '</a>' +
                    '</div>';
                imageGrid.appendChild(card);
            });
            
            document.getElementById('completedSection').classList.remove('hidden');
        }
        
        // 제목 및 썸네일 추천
        async function recommendTitlesAndThumbnails() {
            showLoading('AI가 제목과 썸네일을 추천하고 있습니다...');
            
            try {
                const response = await fetch('/api/recommend', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        story: storyInput.value.trim()
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    displayRecommendations(data);
                }
                
            } catch (error) {
                console.error('추천 오류:', error);
            } finally {
                hideLoading();
            }
        }
        
        // 추천 표시
        function displayRecommendations(data) {
            // 제목 표시
            const titleList = document.getElementById('titleList');
            titleList.innerHTML = '';
            
            data.titles.forEach((title, index) => {
                const div = document.createElement('div');
                div.className = 'p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition';
                div.onclick = function() {
                    navigator.clipboard.writeText(title);
                    alert('제목이 복사되었습니다: ' + title);
                };
                div.innerHTML = '<i class="fas fa-star text-yellow-600 mr-2"></i>' + title;
                titleList.appendChild(div);
            });
            
            // 썸네일 표시
            const thumbnailGrid = document.getElementById('thumbnailGrid');
            thumbnailGrid.innerHTML = '';
            
            data.thumbnails.forEach((thumbnail, index) => {
                const card = document.createElement('div');
                card.className = 'bg-white border rounded-lg overflow-hidden shadow';
                card.innerHTML = '<img src="' + thumbnail.imageUrl + '" alt="Thumbnail ' + (index + 1) + '" class="w-full h-40 object-cover">' +
                    '<div class="p-2">' +
                        '<p class="text-xs text-gray-600 mb-2">' + thumbnail.concept + '</p>' +
                        '<a href="' + thumbnail.imageUrl + '" download="thumbnail_' + (index + 1) + '.png" ' +
                           'class="block text-center bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold py-2 rounded">' +
                            '<i class="fas fa-download mr-1"></i>다운로드' +
                        '</a>' +
                    '</div>';
                thumbnailGrid.appendChild(card);
            });
            
            document.getElementById('recommendSection').classList.remove('hidden');
        }
        
        // ZIP 다운로드
        downloadBtn.addEventListener('click', async function() {
            if (generatedImages.length === 0) {
                alert('다운로드할 이미지가 없습니다!');
                return;
            }
            
            showLoading('ZIP 파일을 생성하고 있습니다...');
            
            // JSZip 로드
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
            document.head.appendChild(script);
            
            await new Promise(resolve => { script.onload = resolve; });
            
            const zip = new JSZip();
            const folder = zip.folder('youtube_scenes');
            
            for (let i = 0; i < generatedImages.length; i++) {
                const item = generatedImages[i];
                const response = await fetch(item.imageUrl);
                const blob = await response.blob();
                const filename = 'scene_' + String(i + 1).padStart(2, '0') + '.png';
                folder.file(filename, blob);
            }
            
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'youtube_scenes_' + new Date().getTime() + '.zip';
            a.click();
            URL.revokeObjectURL(url);
            
            hideLoading();
            alert('다운로드가 완료되었습니다!');
        });
        
        function showLoading(text) {
            document.getElementById('loadingText').textContent = text;
            document.getElementById('loading').classList.remove('hidden');
        }
        
        function hideLoading() {
            document.getElementById('loading').classList.add('hidden');
        }
        
        console.log('이벤트 리스너 등록 완료');
    </script>
</body>
</html>
  `)
})

// 씬 분석 API (AI 사용)
app.post('/api/analyze-scenes', async (c) => {
  try {
    const { story } = await c.req.json()
    
    if (!story) {
      return c.json({ success: false, error: '스토리가 비어있습니다' })
    }

    const apiKey = c.env?.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return c.json({ success: false, error: 'API 키가 설정되지 않았습니다' })
    }

    // Gemini로 씬 분석
    const prompt = `다음 스토리를 YouTube 쇼츠/영상용 씬으로 분할하세요.

스토리:
${story}

요구사항:
1. 각 씬은 3-5초, 최대 10초
2. 장면 전환이 자연스러운 지점에서 분할
3. 각 씬에 시각적 설명 포함
4. JSON 형식으로 응답

응답 형식:
{
  "scenes": [
    {
      "index": 1,
      "description": "씬 설명",
      "visualElements": "시각적 요소",
      "duration": 5,
      "startTime": 0,
      "endTime": 5
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
        
        // 시간 계산
        let currentTime = 0
        result.scenes.forEach((scene: any, index: number) => {
          scene.index = index + 1
          scene.startTime = currentTime
          scene.endTime = currentTime + scene.duration
          currentTime += scene.duration
        })
        
        return c.json({ success: true, scenes: result.scenes, totalDuration: currentTime })
      }
    }
    
    return c.json({ success: false, error: '씬 분석 실패' })
    
  } catch (error: any) {
    console.error('오류:', error)
    return c.json({ success: false, error: error.message })
  }
})

// 이미지 생성 API
app.post('/api/generate-image', async (c) => {
  try {
    const { scene, fullStory, sceneIndex, totalScenes } = await c.req.json()
    
    const apiKey = c.env?.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return c.json({ success: false, error: 'API 키가 설정되지 않았습니다' })
    }

    // 일관성 있는 프롬프트 생성
    const styleGuide = 'Style: Digital illustration with consistent visual language, warm colors, simple cartoonish characters, educational atmosphere, 16:9 aspect ratio for YouTube.'
    
    const prompt = `${styleGuide}

전체 스토리 컨텍스트: ${fullStory}

현재 씬 (${sceneIndex + 1}/${totalScenes}):
- 설명: ${scene.description}
- 시각적 요소: ${scene.visualElements}
- 지속 시간: ${scene.duration}초

이 씬에 맞는 일관된 스타일의 이미지를 생성하세요. 
전체 스토리의 맥락을 유지하면서 이 씬의 핵심 내용을 시각화하세요.`

    // 실제로는 이미지 생성 API를 호출해야 하지만, 
    // 여기서는 테스트용 placeholder 사용
    // 실제 구현 시 GenSpark image_generation 도구 사용
    
    const imageUrl = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
        <rect width="1280" height="720" fill="#4F46E5"/>
        <text x="640" y="360" font-family="Arial" font-size="32" fill="white" text-anchor="middle">
          씬 ${sceneIndex + 1}: ${scene.description.substring(0, 50)}...
        </text>
      </svg>
    `)
    
    return c.json({ success: true, imageUrl: imageUrl })
    
  } catch (error: any) {
    console.error('오류:', error)
    return c.json({ success: false, error: error.message })
  }
})

// 제목 및 썸네일 추천 API
app.post('/api/recommend', async (c) => {
  try {
    const { story } = await c.req.json()
    
    const apiKey = c.env?.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return c.json({ success: false, error: 'API 키가 설정되지 않았습니다' })
    }

    // 제목 추천
    const titlePrompt = `다음 스토리를 기반으로 YouTube에서 인기있을 만한 제목 5개를 추천하세요.

스토리: ${story}

요구사항:
- 짧고 임팩트있게 (10-20자)
- 클릭을 유도하는 제목
- 감정을 자극하는 단어 사용

JSON 형식으로 응답:
{"titles": ["제목1", "제목2", "제목3", "제목4", "제목5"]}`

    const titleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: titlePrompt }] }],
        generationConfig: { temperature: 0.9 }
      })
    })

    const titleData = await titleResponse.json()
    let titles = []
    
    if (titleData.candidates && titleData.candidates[0]) {
      const text = titleData.candidates[0].content.parts[0].text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        titles = result.titles || []
      }
    }

    // 썸네일 컨셉 생성
    const thumbnailPrompt = `다음 스토리를 기반으로 YouTube 썸네일 3개의 컨셉을 제안하세요.

스토리: ${story}

요구사항:
- 눈에 띄고 클릭을 유도하는 디자인
- 각각 다른 스타일/접근법

JSON 형식으로 응답:
{"thumbnails": [
  {"concept": "컨셉 설명1"},
  {"concept": "컨셉 설명2"},
  {"concept": "컨셉 설명3"}
]}`

    const thumbResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: thumbnailPrompt }] }],
        generationConfig: { temperature: 0.9 }
      })
    })

    const thumbData = await thumbResponse.json()
    let thumbnails = []
    
    if (thumbData.candidates && thumbData.candidates[0]) {
      const text = thumbData.candidates[0].content.parts[0].text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        thumbnails = result.thumbnails || []
        
        // 각 썸네일에 placeholder 이미지 추가
        thumbnails = thumbnails.map((thumb: any, index: number) => ({
          ...thumb,
          imageUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
              <rect width="1280" height="720" fill="#${['FF6B6B', '4ECDC4', 'FFE66D'][index]}"/>
              <text x="640" y="360" font-family="Arial" font-size="28" fill="white" text-anchor="middle">
                썸네일 ${index + 1}: ${thumb.concept.substring(0, 30)}
              </text>
            </svg>
          `)
        }))
      }
    }

    return c.json({ success: true, titles: titles, thumbnails: thumbnails })
    
  } catch (error: any) {
    console.error('오류:', error)
    return c.json({ success: false, error: error.message })
  }
})

export default app
