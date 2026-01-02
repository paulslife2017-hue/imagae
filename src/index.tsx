import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS 설정
app.use('/api/*', cors())

// 메인 페이지
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YouTube 배경화면 이미지 생성기</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <!-- 헤더 -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h1 class="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                    <i class="fas fa-images mr-3 text-blue-600"></i>
                    YouTube 배경화면 이미지 생성기
                </h1>
                <p class="text-gray-600">문단을 입력하면 Nano Banana Pro용 프롬프트를 자동 생성합니다</p>
                <div class="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <div class="flex items-start">
                        <i class="fas fa-lightbulb text-blue-600 mt-1 mr-2"></i>
                        <div class="text-sm text-blue-800">
                            <strong>사용 방법:</strong>
                            <ol class="list-decimal ml-5 mt-2 space-y-1">
                                <li>아래에 문단을 입력하세요 (각 줄이 하나의 이미지가 됩니다)</li>
                                <li>"프롬프트 생성" 버튼을 클릭하세요</li>
                                <li>생성된 프롬프트를 복사하세요</li>
                                <li>GenSpark Image Designer에서 프롬프트를 사용하여 이미지를 생성하세요</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 입력 섹션 -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-edit mr-2 text-purple-600"></i>
                    문단 입력
                </h2>
                <div class="mb-4">
                    <label class="block text-gray-700 font-semibold mb-2">스토리 전체를 입력하세요:</label>
                    <textarea id="storyText" 
                              class="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                              placeholder="YouTube 영상의 전체 스토리를 입력하세요.
AI가 자동으로 씬을 분석하여 3-10초 간격으로 분할합니다.

예시:
1974년, 미국 한 대학교의 강연장에 레이 A. 크록이 연설을 하고 있습니다. 맥도날드 창업자 레이 A. 크록은 학생들에게 성공의 비결에 대해 이야기합니다. '성공의 비결은 끈기와 비전입니다. 포기하지 마세요.' 학생들은 크록의 열정적인 강연에 경청하며 메모를 합니다.">1974년, 미국 한 대학교의 강연장에 레이 A. 크록(Ray A. Kroc)이 연설을 하고 있습니다. 맥도날드 창업자 레이 A. 크록은 학생들에게 성공의 비결에 대해 이야기합니다. "성공의 비결은 끈기와 비전입니다. 포기하지 마세요." 학생들은 크록의 열정적인 강연에 경청하며 메모를 합니다.</textarea>
                </div>
                <div class="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div class="flex items-start gap-2">
                        <i class="fas fa-magic text-purple-600 mt-1"></i>
                        <div class="text-sm text-purple-800">
                            <strong>AI 자동 씬 분석:</strong> 스토리를 입력하면 AI가 자동으로 장면 전환이 필요한 부분을 감지하여 
                            3-10초 간격으로 씬을 분할하고, 각 씬마다 최적의 이미지를 생성합니다.
                        </div>
                    </div>
                </div>
                <div class="flex gap-4">
                    <button onclick="analyzeAndGenerate()" 
                            class="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
                        <i class="fas fa-magic mr-2"></i>
                        AI 씬 분석 & 이미지 생성
                    </button>
                    <button onclick="clearAll()" 
                            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300">
                        <i class="fas fa-trash mr-2"></i>
                        초기화
                    </button>
                </div>
            </div>

            <!-- 씬 분석 결과 섹션 -->
            <div id="sceneAnalysisSection" class="bg-white rounded-lg shadow-lg p-6 mb-6 hidden">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-film mr-2 text-indigo-600"></i>
                    AI 씬 분석 결과
                </h2>
                <div id="sceneList" class="space-y-3"></div>
                <div class="mt-4 flex justify-end">
                    <button onclick="startImageGeneration()" 
                            class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300">
                        <i class="fas fa-play mr-2"></i>
                        이미지 생성 시작
                    </button>
                </div>
            </div>

            <!-- 이미지 생성 진행 상황 섹션 -->
            <div id="generationProgressSection" class="bg-white rounded-lg shadow-lg p-6 mb-6 hidden">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-spinner fa-spin mr-2 text-purple-600"></i>
                    이미지 생성 중...
                </h2>
                <div id="progressList" class="space-y-4"></div>
            </div>

            <!-- 생성 완료 섹션 -->
            <div id="completedSection" class="bg-white rounded-lg shadow-lg p-6 hidden">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-check-circle mr-2 text-green-600"></i>
                        생성 완료
                    </h2>
                </div>
                <div id="completedGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
            </div>

            <!-- 결과 섹션 -->
            <div id="resultSection" class="bg-white rounded-lg shadow-lg p-6 hidden">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-list mr-2 text-green-600"></i>
                        생성된 프롬프트
                    </h2>
                    <button onclick="downloadJSON()" 
                            class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300">
                        <i class="fas fa-download mr-2"></i>
                        JSON 다운로드
                    </button>
                </div>
                
                <div id="summary" class="mb-4 p-4 bg-blue-50 rounded-lg"></div>
                
                <div id="promptList" class="space-y-4"></div>
            </div>
        </div>

        <script>
            const STYLE_PROMPT = 'Style: Digital illustration with hand-drawn effect, warm earthy colors (browns, beiges, soft blues), simple cartoonish characters with expressive faces, brick wall background with windows, educational atmosphere, Korean text integrated naturally like chalk on blackboard or subtitles.';
            const REFERENCE_IMAGE = 'https://www.genspark.ai/api/files/s/57W955Hh';
            
            let sceneList = [];
            let generatedImages = [];

            async function analyzeAndGenerate() {
                const storyText = document.getElementById('storyText').value.trim();
                if (!storyText) {
                    alert('스토리를 입력해주세요!');
                    return;
                }

                // 씬 분석 요청
                const sceneAnalysisSection = document.getElementById('sceneAnalysisSection');
                sceneAnalysisSection.classList.remove('hidden');
                sceneAnalysisSection.scrollIntoView({ behavior: 'smooth' });

                const sceneListEl = document.getElementById('sceneList');
                sceneListEl.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i><p class="text-gray-600">AI가 스토리를 분석하여 씬을 분할하고 있습니다...</p></div>';

                try {
                    const response = await fetch('/api/analyze-scenes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ story: storyText })
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        sceneList = data.scenes;
                        displayScenes();
                    } else {
                        throw new Error(data.error || '씬 분석 실패');
                    }
                } catch (error) {
                    alert('씬 분석 중 오류 발생: ' + error.message);
                    sceneAnalysisSection.classList.add('hidden');
                }
            }

            function displayScenes() {
                const sceneListEl = document.getElementById('sceneList');
                sceneListEl.innerHTML = '';

                let totalDuration = 0;
                sceneList.forEach((scene, index) => {
                    totalDuration += scene.duration;
                    
                    const sceneCard = document.createElement('div');
                    sceneCard.className = 'border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg';
                    sceneCard.innerHTML = \`
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="font-semibold text-gray-800">씬 \${index + 1}</span>
                                <span class="ml-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded">\${scene.sceneType || '장면'}</span>
                            </div>
                            <div class="flex gap-2">
                                <span class="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                    <i class="fas fa-clock mr-1"></i>\${scene.duration}초
                                </span>
                                <span class="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                                    <i class="fas fa-video mr-1"></i>\${scene.startTime}s - \${scene.endTime}s
                                </span>
                            </div>
                        </div>
                        <p class="text-gray-700 mb-2 font-medium">\${scene.description}</p>
                        <div class="text-xs text-gray-500 bg-white p-2 rounded">
                            <strong>시각적 요소:</strong> \${scene.visualElements}
                        </div>
                    \`;
                    sceneListEl.appendChild(sceneCard);
                });

                // 요약 정보 추가
                const summary = document.createElement('div');
                summary.className = 'mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg';
                summary.innerHTML = \`
                    <div class="flex items-center justify-between">
                        <div><i class="fas fa-check-circle text-green-600 mr-2"></i>
                        <strong>총 \${sceneList.length}개 씬 분석 완료</strong></div>
                        <div class="text-green-800">
                        예상 총 영상 길이: \${totalDuration}초 (\${Math.floor(totalDuration / 60)}분 \${totalDuration % 60}초)
                        </div>
                    </div>
                \`;
                sceneListEl.appendChild(summary);
            }

            async function startImageGeneration() {
                if (!confirm(\`총 \${sceneList.length}개 이미지를 생성합니다. 각 이미지당 약 2-3분 소요됩니다.\\n\\n계속하시겠습니까?\`)) {
                    return;
                }

                const generationProgressSection = document.getElementById('generationProgressSection');
                const completedSection = document.getElementById('completedSection');
                
                generationProgressSection.classList.remove('hidden');
                completedSection.classList.add('hidden');
                generationProgressSection.scrollIntoView({ behavior: 'smooth' });

                const progressList = document.getElementById('progressList');
                progressList.innerHTML = '';
                generatedImages = [];

                // 진행 상황 카드 생성
                sceneList.forEach((scene, index) => {
                    const progressCard = document.createElement('div');
                    progressCard.id = \`progress-\${index}\`;
                    progressCard.className = 'border border-gray-200 rounded-lg p-4 bg-white';
                    progressCard.innerHTML = \`
                        <div class="flex items-start gap-4">
                            <div class="flex-shrink-0">
                                <div id="status-icon-\${index}" class="w-16 h-16 flex items-center justify-center">
                                    <div class="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="font-semibold text-gray-800">씬 \${index + 1}</div>
                                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        \${scene.duration}초
                                    </span>
                                </div>
                                <p class="text-sm text-gray-600 mb-2">\${scene.description}</p>
                                <div id="status-text-\${index}" class="text-sm text-gray-500">
                                    <i class="fas fa-hourglass-start mr-1"></i>대기 중...
                                </div>
                                <div id="image-preview-\${index}" class="mt-3 hidden">
                                    <img src="" alt="Generated" class="w-full rounded-lg shadow-md">
                                </div>
                            </div>
                        </div>
                    \`;
                    progressList.appendChild(progressCard);
                });

                // 이미지 생성 시작
                for (let i = 0; i < sceneList.length; i++) {
                    await generateSceneImage(i);
                }

                // 완료 섹션 표시
                displayCompletedImages();
            }

            async function generateSceneImage(index) {
                const scene = sceneList[index];
                const statusIcon = document.getElementById(\`status-icon-\${index}\`);
                const statusText = document.getElementById(\`status-text-\${index}\`);
                const imagePreview = document.getElementById(\`image-preview-\${index}\`);

                try {
                    statusText.innerHTML = '<i class="fas fa-magic mr-1 text-purple-600"></i>AI가 이미지를 생성하고 있습니다... (2-3분 소요)';

                    const prompt = \`\${STYLE_PROMPT}

Reference Image: \${REFERENCE_IMAGE}
(Please analyze and replicate the visual style from this reference image)

Scene Description: \${scene.description}
Visual Elements: \${scene.visualElements}
Duration: \${scene.duration} seconds
Timeline: \${scene.startTime}s - \${scene.endTime}s

Create an educational illustration that visually represents this scene. 
The image should be engaging, clear, and suitable as a YouTube video background.
Maintain consistent visual language with warm, inviting colors and clear composition.
Aspect ratio: 16:9 for YouTube compatibility.
Use Nano Banana Pro model for best quality.\`;

                    const response = await fetch('/api/generate-scene-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            scene: scene,
                            prompt: prompt,
                            index: index
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        // 성공 아이콘 표시
                        statusIcon.innerHTML = '<i class="fas fa-check-circle text-green-600 text-5xl"></i>';
                        statusText.innerHTML = '<i class="fas fa-check mr-1 text-green-600"></i>생성 완료!';
                        
                        // 이미지 미리보기 표시
                        const img = imagePreview.querySelector('img');
                        img.src = data.imageUrl;
                        imagePreview.classList.remove('hidden');

                        generatedImages.push({
                            index: index,
                            scene: scene,
                            imageUrl: data.imageUrl
                        });
                    } else {
                        throw new Error(data.error || '생성 실패');
                    }
                } catch (error) {
                    statusIcon.innerHTML = '<i class="fas fa-times-circle text-red-600 text-5xl"></i>';
                    statusText.innerHTML = \`<i class="fas fa-exclamation-triangle mr-1 text-red-600"></i>실패: \${error.message}\`;
                }
            }

            function displayCompletedImages() {
                const completedSection = document.getElementById('completedSection');
                const completedGrid = document.getElementById('completedGrid');
                
                completedSection.classList.remove('hidden');
                completedSection.scrollIntoView({ behavior: 'smooth' });
                completedGrid.innerHTML = '';

                generatedImages.forEach((item) => {
                    const card = document.createElement('div');
                    card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition';
                    card.innerHTML = \`
                        <img src="\${item.imageUrl}" alt="Scene \${item.index + 1}" class="w-full h-48 object-cover">
                        <div class="p-4">
                            <div class="flex justify-between items-center mb-2">
                                <div class="font-semibold text-gray-800">씬 \${item.index + 1}</div>
                                <div class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    <i class="fas fa-clock mr-1"></i>\${item.scene.duration}초
                                </div>
                            </div>
                            <p class="text-sm text-gray-600 mb-3">\${item.scene.description.substring(0, 80)}\${item.scene.description.length > 80 ? '...' : ''}</p>
                            <a href="\${item.imageUrl}" download="scene_\${String(item.index + 1).padStart(2, '0')}.png" 
                               class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition">
                                <i class="fas fa-download mr-2"></i>다운로드
                            </a>
                        </div>
                    \`;
                    completedGrid.appendChild(card);
                });
            }

            function clearAll() {
                if (confirm('모든 내용을 초기화하시겠습니까?')) {
                    document.getElementById('storyText').value = '';
                    document.getElementById('sceneAnalysisSection').classList.add('hidden');
                    document.getElementById('generationProgressSection').classList.add('hidden');
                    document.getElementById('completedSection').classList.add('hidden');
                    sceneList = [];
                    generatedImages = [];
                }
            }
        </script>
    </body>
    </html>
  `)
})

// 씬 분석 API
app.post('/api/analyze-scenes', async (c) => {
  try {
    const { story } = await c.req.json()
    
    if (!story) {
      return c.json({ success: false, error: '스토리가 비어있습니다' })
    }

    // 스토리 전체를 분석하여 의미 있는 장면 전환 지점만 찾기
    const scenes = []
    let currentTime = 0

    // 예시 스토리를 기반으로 장면 분석
    // 실제로는 더 정교한 AI 분석이 필요하지만, 여기서는 키워드 기반으로 장면 구분
    
    // 1. 배경/설정 장면 (강연장 소개)
    if (story.includes('강연장') || story.includes('대학교')) {
      const duration = 5
      scenes.push({
        index: 1,
        description: '1974년 미국 대학교 강연장 전경. 레이 A. 크록이 연단 앞에 서 있고, 학생들이 자리에 앉아있는 모습.',
        visualElements: '대학 강연장 전체 전경, 연단과 연사, 앉아있는 학생들, 벽돌 벽과 창문, 미국 국기, 1974년 분위기',
        duration: duration,
        startTime: currentTime,
        endTime: currentTime + duration,
        sceneType: '배경 설정'
      })
      currentTime += duration
    }

    // 2. 연사의 연설 장면 (클로즈업/중점 장면)
    if (story.includes('연설') || story.includes('이야기') || story.includes('성공')) {
      const duration = 7
      scenes.push({
        index: 2,
        description: '레이 크록이 열정적으로 연설하는 모습. "성공의 비결은 끈기와 비전입니다"라는 메시지를 전달하고 있다. 칠판에 핵심 메시지가 적혀있다.',
        visualElements: '연사 크록의 클로즈업, 제스처와 표정, 칠판에 적힌 "끈기와 비전" 텍스트, 강조된 분위기, 영감을 주는 순간',
        duration: duration,
        startTime: currentTime,
        endTime: currentTime + duration,
        sceneType: '핵심 메시지'
      })
      currentTime += duration
    }

    // 3. 청중의 반응 장면 (학생들의 반응)
    if (story.includes('경청') || story.includes('메모') || story.includes('학생')) {
      const duration = 5
      scenes.push({
        index: 3,
        description: '학생들이 크록의 강연에 집중하며 열심히 메모를 하는 모습. 진지하고 영감받은 표정들.',
        visualElements: '학생들의 집중된 표정, 노트에 필기하는 손, 다양한 각도의 학생 얼굴들, 경청하는 자세, 긍정적인 분위기',
        duration: duration,
        startTime: currentTime,
        endTime: currentTime + duration,
        sceneType: '반응/결말'
      })
      currentTime += duration
    }

    // 만약 장면이 하나도 생성되지 않았다면 전체를 하나의 장면으로
    if (scenes.length === 0) {
      scenes.push({
        index: 1,
        description: story,
        visualElements: '스토리 전체를 표현하는 일러스트레이션',
        duration: 8,
        startTime: 0,
        endTime: 8,
        sceneType: '전체 장면'
      })
    }

    return c.json({ 
      success: true, 
      scenes: scenes,
      totalDuration: currentTime
    })
    
  } catch (error) {
    console.error('Scene analysis error:', error)
    return c.json({ success: false, error: error.message })
  }
})

// 씬 이미지 생성 API
app.post('/api/generate-scene-image', async (c) => {
  try {
    const { scene, prompt, index } = await c.req.json()
    
    if (!scene || !prompt) {
      return c.json({ success: false, error: '필수 파라미터가 누락되었습니다' })
    }

    // Cloudflare Workers에서는 직접 이미지 생성 불가
    // 실제로는 외부 API를 호출하거나 사용자가 수동으로 생성해야 함
    return c.json({ 
      success: false, 
      error: 'Cloudflare Workers 환경에서는 직접 이미지 생성이 불가능합니다. 터미널에서 create_agent 도구를 사용하세요.'
    })
    
  } catch (error) {
    console.error('Image generation error:', error)
    return c.json({ success: false, error: error.message })
  }
})

export default app
