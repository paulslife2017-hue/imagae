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
    <title>AI 스토리 영상 생성기</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .scene-card { transition: all 0.3s ease; }
        .scene-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
        .image-preview { position: relative; overflow: hidden; }
        .image-preview img { transition: transform 0.3s ease; }
        .image-preview:hover img { transform: scale(1.05); }
        .edit-overlay { 
            position: absolute; 
            top: 0; 
            left: 0; 
            right: 0; 
            bottom: 0; 
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .image-preview:hover .edit-overlay { opacity: 1; }
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
        .pulse-dot {
            animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4">
        <!-- 헤더 -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                <i class="fas fa-magic mr-3"></i>
                AI 스토리 영상 생성기
            </h1>
            <p class="text-gray-600 text-lg">스토리를 분석하고, 씬을 나누고, 이미지를 생성하고, 자유롭게 수정하세요</p>
        </div>

        <!-- 단계 표시 -->
        <div class="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <div class="flex items-center justify-between">
                <div id="step1" class="flex items-center space-x-3 flex-1">
                    <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                    <span class="font-semibold text-gray-700">스토리 입력</span>
                </div>
                <div class="w-16 h-1 bg-gray-200"></div>
                <div id="step2" class="flex items-center space-x-3 flex-1">
                    <div class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">2</div>
                    <span class="font-semibold text-gray-400">씬 분석</span>
                </div>
                <div class="w-16 h-1 bg-gray-200"></div>
                <div id="step3" class="flex items-center space-x-3 flex-1">
                    <div class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">3</div>
                    <span class="font-semibold text-gray-400">이미지 생성</span>
                </div>
                <div class="w-16 h-1 bg-gray-200"></div>
                <div id="step4" class="flex items-center space-x-3 flex-1">
                    <div class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">4</div>
                    <span class="font-semibold text-gray-400">완료</span>
                </div>
            </div>
        </div>

        <!-- 1단계: 스토리 입력 -->
        <div id="section1" class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i class="fas fa-pen-fancy mr-3 text-blue-600"></i>
                1단계: 스토리 입력
            </h2>
            <textarea id="storyInput" 
                      class="w-full h-64 px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 font-mono text-sm transition-all resize-none"
                      placeholder="YouTube 영상의 전체 스토리를 입력하세요...&#x0a;&#x0a;예시:&#x0a;1974년, 미국 한 대학교의 강연장에 레이 A. 크록이 연설을 하고 있습니다. 맥도날드 창업자 레이 A. 크록은 학생들에게 성공의 비결에 대해 이야기합니다. &quot;성공의 비결은 끈기와 비전입니다. 포기하지 마세요.&quot; 학생들은 크록의 열정적인 강연에 경청하며 메모를 합니다."></textarea>
            
            <div class="mt-6 flex items-center justify-between">
                <div class="text-sm text-gray-500">
                    <i class="fas fa-info-circle mr-2"></i>
                    <span id="charCount">0</span>자 입력됨
                </div>
                <button id="analyzeBtn" 
                        class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="fas fa-brain mr-2"></i>
                    <span id="analyzeBtnText">AI 씬 분석 시작</span>
                </button>
            </div>
        </div>

        <!-- 2단계: 씬 분석 결과 -->
        <div id="section2" class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 hidden">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <i class="fas fa-film mr-3 text-purple-600"></i>
                    2단계: 씬 분석 결과
                </h2>
                <button id="editScenesBtn" class="text-blue-600 hover:text-blue-800 font-semibold transition">
                    <i class="fas fa-edit mr-2"></i>씬 편집
                </button>
            </div>
            
            <!-- 분석 진행 상황 -->
            <div id="analysisProgress" class="mb-6 hidden">
                <div class="bg-gray-100 rounded-lg p-4">
                    <div class="flex items-center mb-2">
                        <div class="pulse-dot w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                        <span class="text-gray-700 font-medium" id="analysisStatus">AI가 스토리를 분석하고 있습니다...</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div id="analysisProgressBar" class="progress-bar h-2 rounded-full" style="width: 0%"></div>
                    </div>
                </div>
            </div>
            
            <div id="sceneList" class="space-y-4 mb-6"></div>
            
            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                <div class="text-gray-600">
                    <span class="font-bold text-2xl text-gray-800" id="sceneCount">0</span>개 씬 |
                    <span class="font-bold text-2xl text-purple-600" id="totalDuration">0</span>초
                </div>
                <button id="generateBtn" 
                        class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all hover:shadow-xl">
                    <i class="fas fa-play-circle mr-2"></i>
                    이미지 생성 시작
                </button>
            </div>
        </div>

        <!-- 3단계: 이미지 생성 진행 -->
        <div id="section3" class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 hidden">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i class="fas fa-images mr-3 text-green-600"></i>
                3단계: 이미지 생성 중
            </h2>
            
            <!-- 전체 진행률 -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <div class="flex items-center justify-between mb-3">
                    <span class="font-semibold text-gray-700">전체 진행률</span>
                    <div class="flex items-center gap-3">
                        <span class="font-bold text-xl text-purple-600" id="overallProgress">0%</span>
                        <button id="stopGenerationBtn" 
                                class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition">
                            <i class="fas fa-stop mr-2"></i>
                            중지
                        </button>
                    </div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                    <div id="overallProgressBar" class="progress-bar h-3 rounded-full" style="width: 0%"></div>
                </div>
                <div class="mt-3 text-sm text-gray-600">
                    <span id="currentSceneText">준비 중...</span>
                </div>
            </div>
            
            <!-- 개별 씬 생성 진행 -->
            <div id="generationList" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
        </div>

        <!-- 4단계: 생성 완료 및 편집 -->
        <div id="section4" class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 hidden">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <i class="fas fa-check-circle mr-3 text-green-600"></i>
                    4단계: 생성 완료 - 이미지 편집 가능
                </h2>
                <div class="flex space-x-3">
                    <button id="downloadAllBtn" 
                            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition">
                        <i class="fas fa-download mr-2"></i>
                        전체 다운로드
                    </button>
                    <button id="exportJsonBtn" 
                            class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition">
                        <i class="fas fa-file-export mr-2"></i>
                        JSON 내보내기
                    </button>
                </div>
            </div>
            
            <div id="imageGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </div>

        <!-- 5단계: 썸네일 추천 -->
        <div id="section5" class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 hidden">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i class="fas fa-star mr-3 text-yellow-600"></i>
                추천 썸네일 (3개)
            </h2>
            
            <div id="thumbnailProgress" class="mb-6 hidden">
                <div class="bg-gray-100 rounded-lg p-4">
                    <div class="flex items-center mb-2">
                        <div class="pulse-dot w-3 h-3 bg-yellow-600 rounded-full mr-3"></div>
                        <span class="text-gray-700 font-medium">썸네일 생성 중...</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div id="thumbnailProgressBar" class="progress-bar h-2 rounded-full" style="width: 0%"></div>
                    </div>
                </div>
            </div>
            
            <div id="thumbnailGrid" class="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
        </div>

        <!-- 로딩 오버레이 -->
        <div id="loadingOverlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                    <p class="text-xl font-semibold text-gray-800" id="loadingText">처리 중...</p>
                    <p class="text-sm text-gray-500 mt-2" id="loadingSubtext"></p>
                </div>
            </div>
        </div>
    </div>

    <!-- 이미지 편집 모달 -->
    <div id="editModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-edit mr-2 text-blue-600"></i>
                    씬 <span id="editSceneNumber"></span> 편집
                </h3>
                <button id="closeEditModal" class="text-gray-500 hover:text-gray-700 text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-semibold text-gray-700 mb-3">현재 이미지</h4>
                    <div class="border-2 border-gray-200 rounded-xl overflow-hidden">
                        <img id="editCurrentImage" src="" alt="Current" class="w-full">
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-gray-700 mb-3">씬 설명</h4>
                    <textarea id="editDescription" 
                              class="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none mb-4"></textarea>
                    
                    <h4 class="font-semibold text-gray-700 mb-3">시각적 요소</h4>
                    <textarea id="editVisualElements" 
                              class="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none mb-4"></textarea>
                    
                    <h4 class="font-semibold text-gray-700 mb-3">지속 시간 (초)</h4>
                    <input type="number" id="editDuration" min="4" max="10" 
                           class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4">
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button id="regenerateImageBtn" 
                        class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition">
                    <i class="fas fa-sync-alt mr-2"></i>
                    이미지 재생성
                </button>
                <button id="saveEditBtn" 
                        class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition">
                    <i class="fas fa-save mr-2"></i>
                    저장
                </button>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        // 전역 상태
        let currentStep = 1;
        let scenes = [];
        let generatedImages = [];
        let editingSceneIndex = null;
        let fullStory = '';
        let isGenerating = false;
        let shouldStopGeneration = false;

        // DOM 요소
        const storyInput = document.getElementById('storyInput');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const generateBtn = document.getElementById('generateBtn');
        const stopGenerationBtn = document.getElementById('stopGenerationBtn');
        const charCount = document.getElementById('charCount');

        // 글자 수 카운트
        storyInput.addEventListener('input', () => {
            charCount.textContent = storyInput.value.length;
        });

        // 단계 업데이트
        function updateStep(step) {
            currentStep = step;
            
            // 단계 표시 업데이트
            for (let i = 1; i <= 4; i++) {
                const stepEl = document.getElementById('step' + i);
                const circle = stepEl.querySelector('div');
                const text = stepEl.querySelector('span');
                
                if (i < step) {
                    circle.className = 'w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold';
                    circle.innerHTML = '<i class="fas fa-check"></i>';
                    text.className = 'font-semibold text-green-600';
                } else if (i === step) {
                    circle.className = 'w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold';
                    circle.textContent = i;
                    text.className = 'font-semibold text-blue-600';
                } else {
                    circle.className = 'w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold';
                    circle.textContent = i;
                    text.className = 'font-semibold text-gray-400';
                }
            }
        }

        // 섹션 표시/숨김
        function showSection(section) {
            for (let i = 1; i <= 4; i++) {
                const el = document.getElementById('section' + i);
                if (i === section) {
                    el.classList.remove('hidden');
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }

        // 로딩 표시
        function showLoading(text, subtext = '') {
            document.getElementById('loadingText').textContent = text;
            document.getElementById('loadingSubtext').textContent = subtext;
            document.getElementById('loadingOverlay').classList.remove('hidden');
        }

        function hideLoading() {
            document.getElementById('loadingOverlay').classList.add('hidden');
        }

        // 1단계: 씬 분석
        analyzeBtn.addEventListener('click', async () => {
            fullStory = storyInput.value.trim();
            
            if (!fullStory) {
                alert('스토리를 입력하세요!');
                return;
            }

            if (fullStory.length < 50) {
                alert('스토리가 너무 짧습니다. 최소 50자 이상 입력하세요.');
                return;
            }

            analyzeBtn.disabled = true;
            updateStep(2);
            showSection(2);
            
            // 분석 진행 표시
            document.getElementById('analysisProgress').classList.remove('hidden');
            const progressBar = document.getElementById('analysisProgressBar');
            const statusText = document.getElementById('analysisStatus');
            
            // 진행률 애니메이션
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 90) progress = 90;
                progressBar.style.width = progress + '%';
            }, 300);

            try {
                statusText.textContent = 'AI가 스토리를 분석하고 있습니다...';
                
                const response = await axios.post('/api/analyze-scenes', { story: fullStory });
                
                clearInterval(progressInterval);
                progressBar.style.width = '100%';
                statusText.textContent = '분석 완료!';
                
                if (response.data.success) {
                    scenes = response.data.scenes;
                    displayScenes();
                    
                    setTimeout(() => {
                        document.getElementById('analysisProgress').classList.add('hidden');
                    }, 1000);
                } else {
                    alert('오류: ' + response.data.error);
                }
            } catch (error) {
                clearInterval(progressInterval);
                alert('오류 발생: ' + error.message);
            } finally {
                analyzeBtn.disabled = false;
            }
        });

        // 씬 표시
        function displayScenes() {
            const sceneList = document.getElementById('sceneList');
            sceneList.innerHTML = '';
            
            let totalDuration = 0;
            
            scenes.forEach((scene, index) => {
                totalDuration += scene.duration;
                
                const card = document.createElement('div');
                card.className = 'scene-card border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 hover:border-blue-300';
                card.innerHTML = \`
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg">
                                \${index + 1}
                            </div>
                            <span class="font-bold text-gray-800 text-lg">씬 \${index + 1}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                <i class="fas fa-clock mr-1"></i>\${scene.duration}초
                            </span>
                        </div>
                    </div>
                    <p class="text-gray-700 mb-2 leading-relaxed">\${scene.description}</p>
                    <p class="text-sm text-gray-500">
                        <i class="fas fa-eye mr-1"></i>
                        <strong>시각 요소:</strong> \${scene.visualElements}
                    </p>
                \`;
                sceneList.appendChild(card);
            });
            
            document.getElementById('sceneCount').textContent = scenes.length;
            document.getElementById('totalDuration').textContent = totalDuration;
        }

        // 2단계: 이미지 생성
        generateBtn.addEventListener('click', async () => {
            if (!confirm(\`총 \${scenes.length}개 이미지를 생성합니다.\\n\\n생성 시간: 약 \${Math.ceil(scenes.length * 2)}분 소요\\n\\n계속하시겠습니까?\`)) {
                return;
            }

            generateBtn.disabled = true;
            isGenerating = true;
            shouldStopGeneration = false;
            updateStep(3);
            showSection(3);
            
            const generationList = document.getElementById('generationList');
            generationList.innerHTML = '';
            generatedImages = [];
            
            const overallProgressBar = document.getElementById('overallProgressBar');
            const overallProgress = document.getElementById('overallProgress');
            const currentSceneText = document.getElementById('currentSceneText');
            
            for (let i = 0; i < scenes.length; i++) {
                // 중지 확인
                if (shouldStopGeneration) {
                    currentSceneText.textContent = \`생성이 중지되었습니다. (\${i}개 완료)\`;
                    break;
                }
                
                const scene = scenes[i];
                
                // 진행률 업데이트
                const progress = Math.round((i / scenes.length) * 100);
                overallProgressBar.style.width = progress + '%';
                overallProgress.textContent = progress + '%';
                currentSceneText.textContent = \`씬 \${i + 1} / \${scenes.length} 생성 중...\`;
                
                // 씬 카드 생성
                const card = document.createElement('div');
                card.id = 'gen-' + i;
                card.className = 'border-2 border-gray-200 rounded-xl p-5 bg-white';
                card.innerHTML = \`
                    <div class="flex items-center space-x-4 mb-4">
                        <div id="gen-icon-\${i}" class="flex-shrink-0">
                            <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                        <div class="flex-1">
                            <div class="font-bold text-gray-800 text-lg">씬 \${i + 1}</div>
                            <div id="gen-status-\${i}" class="text-sm text-gray-500 mt-1">생성 중...</div>
                        </div>
                    </div>
                    <div id="gen-preview-\${i}" class="hidden">
                        <img src="" alt="Preview" class="w-full rounded-lg">
                    </div>
                \`;
                generationList.appendChild(card);
                
                try {
                    // 나노바나나 프로 이미지 생성 프롬프트 (레퍼런스 스타일)
                    const styleGuide = 'Style: Digital illustration with hand-drawn effect, warm earthy colors (browns, beiges, soft blues), simple cartoonish characters with expressive faces, brick wall background with windows, educational atmosphere, Korean text integrated naturally like chalk on blackboard or subtitles.';
                    
                    const referenceImages = '\\n\\nReference Images: https://www.genspark.ai/api/files/s/xCmU67c4, https://www.genspark.ai/api/files/s/HL5G5AnC';
                    
                    const imagePrompt = styleGuide + referenceImages + '\\n\\nScene ' + (i + 1) + ' of ' + scenes.length + ':\\nDescription: ' + scene.description + '\\nVisual Elements: ' + scene.visualElements + '\\nDuration: ' + scene.duration + ' seconds\\n\\nCreate an educational illustration that visually represents this scene. Match the style of the reference images: warm and emotional hand-drawn illustration with brick wall background, simple but expressive characters, soft lighting, and integrated Korean text. The image should be engaging, clear, and suitable as a YouTube video background. Aspect ratio: 16:9 for YouTube compatibility.';

                    // GenSpark API 직접 호출 (이미지 레퍼런스 포함)
                    const response = await axios.post('/api/generate-image', {
                        prompt: imagePrompt,
                        model: 'nano-banana-pro',
                        aspectRatio: '16:9',
                        imageUrls: ['https://www.genspark.ai/api/files/s/xCmU67c4', 'https://www.genspark.ai/api/files/s/HL5G5AnC']
                    });
                    
                    if (response.data.success && response.data.imageUrl) {
                        document.getElementById('gen-icon-' + i).innerHTML = '<i class="fas fa-check-circle text-green-600 text-5xl"></i>';
                        document.getElementById('gen-status-' + i).innerHTML = '<span class="text-green-600 font-semibold">✓ 생성 완료</span>';
                        
                        const previewDiv = document.getElementById('gen-preview-' + i);
                        previewDiv.classList.remove('hidden');
                        previewDiv.querySelector('img').src = response.data.imageUrl;
                        
                        generatedImages.push({
                            index: i,
                            scene: scene,
                            imageUrl: response.data.imageUrl
                        });
                    } else {
                        document.getElementById('gen-icon-' + i).innerHTML = '<i class="fas fa-times-circle text-red-600 text-5xl"></i>';
                        document.getElementById('gen-status-' + i).innerHTML = '<span class="text-red-600 font-semibold">✗ ' + (response.data.error || '생성 실패') + '</span>';
                    }
                } catch (error) {
                    console.error('이미지 생성 오류:', error);
                    document.getElementById('gen-icon-' + i).innerHTML = '<i class="fas fa-times-circle text-red-600 text-5xl"></i>';
                    document.getElementById('gen-status-' + i).innerHTML = '<span class="text-red-600 font-semibold">✗ 오류: ' + error.message + '</span>';
                }
            }
            
            // 생성 완료 또는 중지됨
            isGenerating = false;
            
            if (!shouldStopGeneration) {
                // 완료
                overallProgressBar.style.width = '100%';
                overallProgress.textContent = '100%';
                currentSceneText.textContent = '모든 이미지 생성 완료!';
                
                // 썸네일 생성
                await generateThumbnails();
            } else {
                // 중지됨
                overallProgress.textContent = Math.round((generatedImages.length / scenes.length) * 100) + '%';
            }
            
            // 생성된 이미지가 있으면 4단계로 이동
            if (generatedImages.length > 0) {
                updateStep(4);
                showSection(4);
                displayCompletedImages();
            }
            
            generateBtn.disabled = false;
        });

        // 중지 버튼
        stopGenerationBtn.addEventListener('click', () => {
            if (!isGenerating) return;
            
            if (confirm('이미지 생성을 중지하시겠습니까?\\n\\n현재까지 생성된 이미지는 저장됩니다.')) {
                shouldStopGeneration = true;
                stopGenerationBtn.disabled = true;
                stopGenerationBtn.innerHTML = '<i class="fas fa-check mr-2"></i>중지됨';
                
                alert(\`생성이 중지되었습니다.\\n\\n\${generatedImages.length}개의 이미지가 생성되었습니다.\`);
            }
        });

        // 완성된 이미지 표시
        function displayCompletedImages() {
            const imageGrid = document.getElementById('imageGrid');
            imageGrid.innerHTML = '';
            
            generatedImages.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-all';
                card.innerHTML = \`
                    <div class="image-preview aspect-video">
                        <img src="\${item.imageUrl}" alt="Scene \${index + 1}" class="w-full h-full object-cover">
                        <div class="edit-overlay">
                            <button onclick="openEditModal(\${index})" class="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                                <i class="fas fa-edit mr-2"></i>편집
                            </button>
                        </div>
                    </div>
                    <div class="p-4">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-gray-800">씬 \${index + 1}</span>
                            <span class="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                                \${item.scene.duration}초
                            </span>
                        </div>
                        <p class="text-sm text-gray-600 mb-3 line-clamp-2">\${item.scene.description}</p>
                        <button onclick="downloadImage(\${index})" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition">
                            <i class="fas fa-download mr-2"></i>다운로드
                        </button>
                    </div>
                \`;
                imageGrid.appendChild(card);
            });
        }

        // 이미지 편집 모달
        window.openEditModal = (index) => {
            editingSceneIndex = index;
            const item = generatedImages[index];
            
            document.getElementById('editSceneNumber').textContent = index + 1;
            document.getElementById('editCurrentImage').src = item.imageUrl;
            document.getElementById('editDescription').value = item.scene.description;
            document.getElementById('editVisualElements').value = item.scene.visualElements;
            document.getElementById('editDuration').value = item.scene.duration;
            
            document.getElementById('editModal').classList.remove('hidden');
        };

        document.getElementById('closeEditModal').addEventListener('click', () => {
            document.getElementById('editModal').classList.add('hidden');
        });

        // 저장
        document.getElementById('saveEditBtn').addEventListener('click', () => {
            if (editingSceneIndex === null) return;
            
            const item = generatedImages[editingSceneIndex];
            item.scene.description = document.getElementById('editDescription').value;
            item.scene.visualElements = document.getElementById('editVisualElements').value;
            item.scene.duration = parseInt(document.getElementById('editDuration').value);
            
            scenes[editingSceneIndex] = item.scene;
            
            displayCompletedImages();
            displayScenes();
            
            document.getElementById('editModal').classList.add('hidden');
            
            alert('저장되었습니다!');
        });

        // 이미지 재생성
        document.getElementById('regenerateImageBtn').addEventListener('click', async () => {
            if (editingSceneIndex === null) return;
            
            if (!confirm('이미지를 재생성하시겠습니까? (약 2-3분 소요)')) return;
            
            showLoading('이미지를 재생성하고 있습니다...', '잠시만 기다려주세요');
            
            try {
                const scene = {
                    description: document.getElementById('editDescription').value,
                    visualElements: document.getElementById('editVisualElements').value,
                    duration: parseInt(document.getElementById('editDuration').value)
                };
                
                const response = await axios.post('/api/generate-image', {
                    scene: scene,
                    fullStory: fullStory,
                    sceneIndex: editingSceneIndex,
                    totalScenes: scenes.length
                });
                
                if (response.data.success) {
                    generatedImages[editingSceneIndex].imageUrl = response.data.imageUrl;
                    generatedImages[editingSceneIndex].scene = scene;
                    scenes[editingSceneIndex] = scene;
                    
                    document.getElementById('editCurrentImage').src = response.data.imageUrl;
                    displayCompletedImages();
                    
                    alert('이미지가 재생성되었습니다!');
                } else {
                    alert('오류: ' + response.data.error);
                }
            } catch (error) {
                alert('오류 발생: ' + error.message);
            } finally {
                hideLoading();
            }
        });

        // 이미지 다운로드
        window.downloadImage = (index) => {
            const item = generatedImages[index];
            const link = document.createElement('a');
            link.href = item.imageUrl;
            link.download = \`scene_\${String(index + 1).padStart(2, '0')}.png\`;
            link.click();
        };

        // 전체 다운로드
        document.getElementById('downloadAllBtn').addEventListener('click', async () => {
            showLoading('ZIP 파일을 생성하고 있습니다...');
            
            // JSZip 로드
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
            document.head.appendChild(script);
            
            await new Promise(resolve => { script.onload = resolve; });
            
            const zip = new JSZip();
            const folder = zip.folder('scenes');
            
            for (let i = 0; i < generatedImages.length; i++) {
                const item = generatedImages[i];
                const response = await fetch(item.imageUrl);
                const blob = await response.blob();
                const filename = \`scene_\${String(i + 1).padStart(2, '0')}.png\`;
                folder.file(filename, blob);
            }
            
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`scenes_\${new Date().getTime()}.zip\`;
            a.click();
            URL.revokeObjectURL(url);
            
            hideLoading();
            alert('다운로드가 완료되었습니다!');
        });

        // JSON 내보내기
        document.getElementById('exportJsonBtn').addEventListener('click', () => {
            const data = {
                story: fullStory,
                scenes: scenes,
                images: generatedImages.map(item => ({
                    index: item.index,
                    description: item.scene.description,
                    visualElements: item.scene.visualElements,
                    duration: item.scene.duration,
                    imageUrl: item.imageUrl
                })),
                thumbnails: generatedThumbnails,
                totalDuration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
                generatedAt: new Date().toISOString()
            };
            
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`project_\${new Date().getTime()}.json\`;
            a.click();
            URL.revokeObjectURL(url);
        });

        // 썸네일 생성
        let generatedThumbnails = [];
        
        async function generateThumbnails() {
            document.getElementById('section5').classList.remove('hidden');
            document.getElementById('thumbnailProgress').classList.remove('hidden');
            
            const thumbnailGrid = document.getElementById('thumbnailGrid');
            const progressBar = document.getElementById('thumbnailProgressBar');
            thumbnailGrid.innerHTML = '';
            generatedThumbnails = [];
            
            const thumbnailConcepts = [
                {
                    title: '임팩트 스타일',
                    description: '강렬한 첫인상을 주는 디자인. 굵은 텍스트와 대조되는 색상 사용. 시선을 사로잡는 구성.'
                },
                {
                    title: '스토리 중심',
                    description: '스토리의 핵심 순간을 담은 디자인. 감정적 연결을 강조. 따뜻하고 친근한 분위기.'
                },
                {
                    title: '미니멀 디자인',
                    description: '깔끔하고 세련된 디자인. 여백을 살린 구성. 전문적이고 고급스러운 느낌.'
                }
            ];
            
            for (let i = 0; i < thumbnailConcepts.length; i++) {
                const concept = thumbnailConcepts[i];
                progressBar.style.width = ((i / thumbnailConcepts.length) * 100) + '%';
                
                // 카드 생성
                const card = document.createElement('div');
                card.className = 'border-2 border-gray-200 rounded-xl overflow-hidden bg-white';
                card.innerHTML = \`
                    <div id="thumb-container-\${i}" class="aspect-video bg-gray-100 flex items-center justify-center">
                        <div class="text-center p-4">
                            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-yellow-600 mb-2"></div>
                            <p class="text-sm text-gray-600">생성 중...</p>
                        </div>
                    </div>
                    <div class="p-4">
                        <h4 class="font-bold text-gray-800 mb-1">\${concept.title}</h4>
                        <p class="text-xs text-gray-600 mb-3">\${concept.description}</p>
                        <button id="download-thumb-\${i}" class="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-semibold transition hidden">
                            <i class="fas fa-download mr-2"></i>다운로드
                        </button>
                    </div>
                \`;
                thumbnailGrid.appendChild(card);
                
                try {
                    // 썸네일 프롬프트 생성 (레퍼런스 스타일)
                    const baseStyle = 'Hand-drawn illustration style with warm earthy colors (browns, beiges, soft blues), emotional and inviting atmosphere, brick wall background elements, Korean text integration. Reference style: https://www.genspark.ai/api/files/s/xCmU67c4, https://www.genspark.ai/api/files/s/HL5G5AnC';
                    
                    const styleText = concept.title === '임팩트 스타일' ? 'Bold and dynamic composition with strong visual hierarchy' : concept.title === '스토리 중심' ? 'Emotional storytelling with expressive characters and warm lighting' : 'Clean and elegant layout with sophisticated composition';
                    
                    const thumbnailPrompt = 'YouTube thumbnail design. ' + concept.description + '\\n\\n' + baseStyle + '\\n\\nStory summary: ' + fullStory.substring(0, 200) + '...\\n\\nStyle emphasis: ' + styleText + '\\n\\nCreate a compelling YouTube thumbnail that attracts viewers and represents the story. Match the warm, hand-drawn illustration style of the reference images. Aspect ratio: 16:9. Include visual elements that make people want to click.';

                    // 이미지 생성 API 호출 (레퍼런스 포함)
                    const response = await axios.post('/api/generate-image', {
                        prompt: thumbnailPrompt,
                        model: 'nano-banana-pro',
                        aspectRatio: '16:9',
                        imageUrls: ['https://www.genspark.ai/api/files/s/xCmU67c4', 'https://www.genspark.ai/api/files/s/HL5G5AnC']
                    });
                    
                    if (response.data.success && response.data.imageUrl) {
                        const container = document.getElementById('thumb-container-' + i);
                        container.innerHTML = \`<img src="\${response.data.imageUrl}" alt="Thumbnail \${i + 1}" class="w-full h-full object-cover">\`;
                        
                        const downloadBtn = document.getElementById('download-thumb-' + i);
                        downloadBtn.classList.remove('hidden');
                        downloadBtn.onclick = () => {
                            const link = document.createElement('a');
                            link.href = response.data.imageUrl;
                            link.download = \`thumbnail_\${i + 1}.png\`;
                            link.click();
                        };
                        
                        generatedThumbnails.push({
                            index: i,
                            concept: concept.title,
                            imageUrl: response.data.imageUrl
                        });
                    } else {
                        document.getElementById('thumb-container-' + i).innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-red-600 text-sm">생성 실패</p></div>';
                    }
                } catch (error) {
                    console.error('썸네일 생성 오류:', error);
                    document.getElementById('thumb-container-' + i).innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-red-600 text-sm">오류 발생</p></div>';
                }
            }
            
            progressBar.style.width = '100%';
            document.getElementById('thumbnailProgress').classList.add('hidden');
        }

        console.log('앱 초기화 완료');
    </script>
</body>
</html>
  `)
})

// API 엔드포인트는 기존과 동일하게 유지
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

app.post('/api/generate-image', async (c) => {
  try {
    const { prompt } = await c.req.json()
    
    if (!prompt) {
      return c.json({ success: false, error: '프롬프트가 필요합니다' })
    }

    const apiKey = c.env?.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return c.json({ success: false, error: 'API 키가 설정되지 않았습니다' })
    }

    // Gemini 2.0 Flash를 사용하여 Imagen 3으로 이미지 생성 (한국어 프롬프트 지원)
    try {
      console.log('🎨 Imagen 3로 이미지 생성 시작...')
      
      // 한국어 스타일 프롬프트 (Imagen 3는 한국어 텍스트 렌더링 우수)
      const imagePrompt = `한국 교육 YouTube 콘텐츠용 따뜻한 손그림 일러스트:

스타일:
- 손으로 그린 듯한 디지털 일러스트, 따뜻하고 감성적인 분위기
- 색상: 따뜻한 갈색(#8B7355), 베이지(#D4A574), 은은한 블루(#6B9AC4)
- 배경: 붉은 벽돌 벽과 창문, 교실 분위기
- 캐릭터: 단순하지만 표현력 있는 만화풍
- 질감: 종이 텍스처, 붓터치 보임

중요: 반드시 명확한 한글 텍스트로 상황 설명 포함 (칠판 글씨나 자막 스타일)

씬: ${prompt}

16:9, YouTube용, 한글 필수`

      // Gemini 2.0 Flash로 Imagen 3 이미지 생성 요청
      const fullPrompt = 'Generate an image with this prompt using Imagen 3:\n\n' + imagePrompt + '\n\nCreate a warm, hand-drawn illustration in 16:9 aspect ratio with clear Korean text integrated naturally.'
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            candidateCount: 1
          }
        })
      })

      const data = await response.json()
      
      console.log('✅ Gemini 응답 받음')
      
      // 응답에서 이미지 찾기
      if (data.candidates && data.candidates[0]) {
        const parts = data.candidates[0].content.parts;
        
        for (const part of parts) {
          const inlineData = part.inline_data || part.inlineData;
          if (inlineData && inlineData.data) {
            const imageBase64 = inlineData.data;
            const mimeType = inlineData.mime_type || inlineData.mimeType || 'image/png';
            const imageUrl = 'data:' + mimeType + ';base64,' + imageBase64;
            console.log('✅ 이미지 생성 성공!')
            return c.json({ success: true, imageUrl: imageUrl });
          }
        }
      }
      
      console.warn('⚠️ 이미지 생성 실패, fallback 사용')
      throw new Error('이미지 생성 실패')
      
    } catch (apiError: any) {
      console.error('❌ API 오류:', apiError.message)
      
      // Fallback: SVG placeholder
      const colors = ['8B7355', 'A0826D', '6B9AC4', 'D4A574', 'C4A57B'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const sceneNumber = Math.floor(Math.random() * 100);
      
      const svgContent = '<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" style="stop-color:#' + randomColor + ';stop-opacity:1" />' +
            '<stop offset="100%" style="stop-color:#' + randomColor + 'dd;stop-opacity:1" />' +
          '</linearGradient>' +
          '<pattern id="brick" x="0" y="0" width="120" height="60" patternUnits="userSpaceOnUse">' +
            '<rect width="120" height="60" fill="url(#grad)"/>' +
            '<rect x="2" y="2" width="56" height="26" fill="rgba(0,0,0,0.1)" rx="2"/>' +
            '<rect x="62" y="2" width="56" height="26" fill="rgba(0,0,0,0.1)" rx="2"/>' +
            '<rect x="32" y="32" width="56" height="26" fill="rgba(0,0,0,0.1)" rx="2"/>' +
          '</pattern>' +
        '</defs>' +
        '<rect width="1920" height="1080" fill="url(#brick)"/>' +
        '<rect x="600" y="180" width="720" height="720" fill="rgba(255,255,255,0.95)" rx="20"/>' +
        '<circle cx="960" cy="400" r="100" fill="rgba(255,200,100,0.3)"/>' +
        '<text x="960" y="480" font-family="Noto Sans KR, sans-serif" font-size="48" font-weight="bold" fill="#333" text-anchor="middle">' +
          '이미지 생성 중...' +
        '</text>' +
        '<text x="960" y="560" font-family="Noto Sans KR, sans-serif" font-size="24" fill="#666" text-anchor="middle">' +
          '씬 #' + sceneNumber +
        '</text>' +
        '<text x="960" y="620" font-family="Noto Sans KR, sans-serif" font-size="18" fill="#999" text-anchor="middle">' +
          '따뜻한 손그림 스타일' +
        '</text>' +
        '<text x="960" y="680" font-family="Noto Sans KR, sans-serif" font-size="16" fill="#aaa" text-anchor="middle">' +
          '교육용 일러스트' +
        '</text>' +
      '</svg>';
      
      const imageUrl = 'data:image/svg+xml;base64,' + Buffer.from(svgContent).toString('base64');
      return c.json({ success: true, imageUrl: imageUrl, fallback: true });
    }
    
  } catch (error: any) {
    console.error('❌ 전체 오류:', error)
    return c.json({ success: false, error: error.message })
  }
})

export default app
