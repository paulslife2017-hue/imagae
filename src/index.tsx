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

    // 스토리를 더 세밀하게 분석하여 의미 있는 장면 전환 찾기
    const scenes = []
    let currentTime = 0

    // 핵심 키워드와 주제를 기반으로 장면 분석
    const storyLower = story.toLowerCase()
    
    // 1. 문제 제기 / 현실 인식 장면
    if (story.includes('열심히') || story.includes('노력') || story.includes('제자리')) {
      const duration = 6
      scenes.push({
        index: scenes.length + 1,
        description: '열심히 살고 있는데 항상 돈이 없는 현실. 남들보다 덜 노력하는 것도 아닌데 왜 늘 제자리인가에 대한 고민.',
        visualElements: '고민하는 사람, 지갑이 비어있는 모습, 반복되는 일상, 답답한 표정, 어두운 톤의 배경',
        duration: duration,
        startTime: currentTime,
        endTime: currentTime + duration,
        sceneType: '문제 제기'
      })
      currentTime += duration
    }

    // 2. 어린 시절 / 가르침 장면
    if (story.includes('어릴 때') || story.includes('성실') || story.includes('들어왔다')) {
      const duration = 5
      scenes.push({
        index: scenes.length + 1,
        description: '어릴 때부터 들어온 말들. "성실하면 잘 된다", "열심히 하면 보상받는다". 많은 사람들이 불평하지 않고 참고 버티는 모습.',
        visualElements: '어린 시절 회상, 선생님이나 부모의 가르침, 참고 일하는 사람들, 희망적이지만 순진한 분위기',
        duration: duration,
        startTime: currentTime,
        endTime: currentTime + duration,
        sceneType: '배경/가치관'
      })
      currentTime += duration
    }

    // 3. 구조적 문제 인식
    if (story.includes('구조') || story.includes('시간을 써서')) {
      const duration = 7
      scenes.push({
        index: scenes.length + 1,
        description: '개인의 문제가 아닌 구조의 문제. 대부분의 사람은 시간을 써서 돈을 벌고, 일한 만큼 받고, 쉬면 수입이 멈춘다.',
        visualElements: '시계와 돈의 교환, 톱니바퀴 시스템, 쳇바퀴 돌리는 모습, 멈추지 못하는 사람, 시스템 다이어그램',
        duration: duration,
        startTime: currentTime,
        endTime: currentTime + duration,
        sceneType: '핵심 문제'
      })
      currentTime += duration
    }

    // 4. 절약의 한계
    if (story.includes('아끼') || story.includes('커피') || story.includes('참고')) {
      const duration = 6
      scenes.push({
        index: scenes.length + 1,
        description: '돈이 없을수록 더 아끼려 한다. 커피를 줄이고, 사고 싶은 걸 참고, 하고 싶은 걸 미룬다. 하지만 이것만으로는 바뀌지 않는다.',
        visualElements: '계산기, 가계부, 절약하는 모습, 참는 표정, 답답한 분위기, 한계를 느끼는 손동작',
        duration: duration,
        startTime: currentTime,
        endTime: currentTime + duration,
        sceneType: '잘못된 접근'
      })
      currentTime += duration
    }

    // 5. 돈의 흐름 이해
    if (story.includes('흘러가') || story.includes('관심')) {
      const duration = 7
      scenes.push({
        index: scenes.length + 1,
        description: '아낄 수 있는 돈에는 한계가 있지만 벌 수 있는 돈에는 한계가 없다. 돈이 되는 사람들은 돈의 흐름을 본다. 돈은 관심을 주지 않는 사람 곁에 머물지 않는다.',
        visualElements: '돈의 흐름 화살표, 관찰하는 사람, 분석하는 모습, 돈이 흘러가는 방향, 밝아지는 표정',
        duration: duration,
        startTime: currentTime,
        endTime: currentTime + duration,
        sceneType: '핵심 깨달음'
      })
      currentTime += duration
    }

    // 6. 안정의 역설
    if (story.includes('안정') || story.includes('하나뿐') || story.includes('월급')) {
      const duration = 6
      scenes.push({
        index: scenes.length + 1,
        description: '안정적인 삶을 원하지만, 수입이 하나뿐인 상태가 가장 불안정할 수 있다. 회사 하나, 월급 하나에 모든 걸 맡긴 삶은 쉽게 흔들린다.',
        visualElements: '한 줄로 연결된 수입원, 위태로운 균형, 흔들리는 모습, 불안한 표정, 위험 신호',
        duration: duration,
        startTime: currentTime,
        endTime: currentTime + duration,
        sceneType: '위험 인식'
      })
      currentTime += duration
    }

    // 7. 해결책 / 방향 전환
    if (story.includes('벗어나는') || story.includes('달라지고') || story.includes('방향')) {
      const duration = 8
      scenes.push({
        index: scenes.length + 1,
        description: '가난에서 벗어나는 사람들의 특징. 시간을 쓰는 방식이 달라지고, 돈이 되는 경험을 만들고, 한 번 한 일을 여러 번 쓰고, 작은 수입을 하나씩 늘려간다.',
        visualElements: '여러 개의 수입 파이프라인, 자산을 만드는 모습, 성장하는 그래프, 희망적인 분위기, 밝은 미래',
        duration: duration,
        startTime: currentTime,
        endTime: currentTime + duration,
        sceneType: '해결책'
      })
      currentTime += duration
    }

    // 8. 위로와 메시지
    if (story.includes('잘못') || story.includes('부족') || story.includes('질문')) {
      const duration = 7
      scenes.push({
        index: scenes.length + 1,
        description: '당신이 힘든 이유는 부족해서도 뒤처져서도 아니다. 열심히 사는 법만 배웠지 구조는 배운 적이 없었을 뿐이다. 이건 당신 잘못이 아니다. 마지막 질문: 지금의 노력은 나를 어디로 데려가는가?',
        visualElements: '위로하는 손길, 따뜻한 빛, 질문 텍스트, 희망의 길, 새로운 방향, 긍정적인 결말',
        duration: duration,
        startTime: currentTime,
        endTime: currentTime + duration,
        sceneType: '위로/메시지'
      })
      currentTime += duration
    }

    // 만약 장면이 하나도 생성되지 않았다면 전체를 분석
    if (scenes.length === 0) {
      // 문단을 나눠서 처리
      const paragraphs = story.split('\n\n').filter(p => p.trim())
      
      paragraphs.forEach((para, index) => {
        const length = para.length
        let duration = 5
        if (length < 50) duration = 3
        else if (length < 100) duration = 5
        else if (length < 200) duration = 7
        else duration = 10

        scenes.push({
          index: index + 1,
          description: para.substring(0, 150) + (para.length > 150 ? '...' : ''),
          visualElements: '스토리 내용을 시각화한 일러스트레이션',
          duration: duration,
          startTime: currentTime,
          endTime: currentTime + duration,
          sceneType: '일반 장면'
        })
        currentTime += duration
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
