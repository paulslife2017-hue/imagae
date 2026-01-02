import { Hono } from 'hono'
import { cors } from 'hono/cors'

// 환경 변수 타입 정의
type Bindings = {
  GOOGLE_AI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

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
                    <label class="block text-gray-700 font-semibold mb-2">영상 제목:</label>
                    <div class="flex gap-2">
                        <input type="text" id="videoTitle" 
                               class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                               placeholder="예: 성공하는 사람들의 아침 루틴"
                               value="가난에서 벗어나는 사람들의 비밀">
                        <button onclick="recommendTitle()" 
                                class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition">
                            <i class="fas fa-lightbulb mr-2"></i>제목 추천
                        </button>
                    </div>
                    <div id="titleRecommendations" class="mt-2 space-y-2 hidden"></div>
                </div>
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
            <div id="completedSection" class="bg-white rounded-lg shadow-lg p-6 mb-6 hidden">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-check-circle mr-2 text-green-600"></i>
                        생성 완료
                    </h2>
                    <button onclick="downloadAllImages()" 
                            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300">
                        <i class="fas fa-download mr-2"></i>
                        전체 다운로드 (ZIP)
                    </button>
                </div>
                <div id="completedGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
            </div>

            <!-- 썸네일 생성 섹션 -->
            <div id="thumbnailSection" class="bg-white rounded-lg shadow-lg p-6 mb-6 hidden">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-image mr-2 text-pink-600"></i>
                    YouTube 썸네일
                </h2>
                <div id="thumbnailStatus" class="mb-4 p-3 bg-gray-100 rounded-lg text-center">
                    대기 중...
                </div>
                <div id="thumbnailPreview" class="mb-4 hidden">
                    <img src="" alt="Thumbnail" class="w-full rounded-lg shadow-md">
                </div>
                <div class="text-center">
                    <a id="thumbnailDownload" href="#" download="thumbnail.png" 
                       class="hidden inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition">
                        <i class="fas fa-download mr-2"></i>썸네일 다운로드
                    </a>
                </div>
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
                    sceneCard.innerHTML = '<div class="flex justify-between items-start mb-2">' +
                            '<div>' +
                                '<span class="font-semibold text-gray-800">씬 ' + (index + 1) + '</span>' +
                                '<span class="ml-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded">' + (scene.sceneType || '장면') + '</span>' +
                            '</div>' +
                            '<div class="flex gap-2">' +
                                '<span class="text-xs bg-blue-600 text-white px-2 py-1 rounded">' +
                                    '<i class="fas fa-clock mr-1"></i>' + scene.duration + '초' +
                                '</span>' +
                                '<span class="text-xs bg-purple-600 text-white px-2 py-1 rounded">' +
                                    '<i class="fas fa-video mr-1"></i>' + scene.startTime + 's - ' + scene.endTime + 's' +
                                '</span>' +
                            '</div>' +
                        '</div>' +
                        '<p class="text-gray-700 mb-2 font-medium">' + scene.description + '</p>' +
                        '<div class="text-xs text-gray-500 bg-white p-2 rounded">' +
                            '<strong>시각적 요소:</strong> ' + scene.visualElements +
                        '</div>';
                    sceneListEl.appendChild(sceneCard);
                });

                // 요약 정보 추가
                const summary = document.createElement('div');
                summary.className = 'mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg';
                summary.innerHTML = '<div class="flex items-center justify-between">' +
                        '<div><i class="fas fa-check-circle text-green-600 mr-2"></i>' +
                        '<strong>총 ' + sceneList.length + '개 씬 분석 완료</strong></div>' +
                        '<div class="text-green-800">' +
                        '예상 총 영상 길이: ' + totalDuration + '초 (' + Math.floor(totalDuration / 60) + '분 ' + (totalDuration % 60) + '초)' +
                        '</div>' +
                    '</div>';
                sceneListEl.appendChild(summary);
            }

            async function startImageGeneration() {
                if (!confirm('총 ' + sceneList.length + '개 이미지를 생성합니다. 각 이미지당 약 2-3분 소요됩니다.\\n\\n계속하시겠습니까?')) {
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
                    progressCard.id = 'progress-' + index;
                    progressCard.className = 'border border-gray-200 rounded-lg p-4 bg-white';
                    progressCard.innerHTML = '<div class="flex items-start gap-4">' +
                            '<div class="flex-shrink-0">' +
                                '<div id="status-icon-' + index + '" class="w-16 h-16 flex items-center justify-center">' +
                                    '<div class="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="flex-1">' +
                                '<div class="flex justify-between items-start mb-2">' +
                                    '<div class="font-semibold text-gray-800">씬 ' + (index + 1) + '</div>' +
                                    '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">' +
                                        scene.duration + '초' +
                                    '</span>' +
                                '</div>' +
                                '<p class="text-sm text-gray-600 mb-2">' + scene.description + '</p>' +
                                '<div id="status-text-' + index + '" class="text-sm text-gray-500">' +
                                    '<i class="fas fa-hourglass-start mr-1"></i>대기 중...' +
                                '</div>' +
                                '<div id="image-preview-' + index + '" class="mt-3 hidden">' +
                                    '<img src="" alt="Generated" class="w-full rounded-lg shadow-md">' +
                                '</div>' +
                            '</div>' +
                        '</div>';
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
                const statusIcon = document.getElementById('status-icon-' + index);
                const statusText = document.getElementById('status-text-' + index);
                const imagePreview = document.getElementById('image-preview-' + index);

                try {
                    statusText.innerHTML = '<i class="fas fa-magic mr-1 text-purple-600"></i>AI가 이미지를 생성하고 있습니다... (2-3분 소요)';

                    const prompt = STYLE_PROMPT + '\n\nReference Image: ' + REFERENCE_IMAGE + '\n(Please analyze and replicate the visual style from this reference image)\n\nScene Description: ' + scene.description + '\nVisual Elements: ' + scene.visualElements + '\nDuration: ' + scene.duration + ' seconds\nTimeline: ' + scene.startTime + 's - ' + scene.endTime + 's\n\nCreate an educational illustration that visually represents this scene. \nThe image should be engaging, clear, and suitable as a YouTube video background.\nMaintain consistent visual language with warm, inviting colors and clear composition.\nAspect ratio: 16:9 for YouTube compatibility.\nUse Nano Banana Pro model for best quality.';

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
                    statusText.innerHTML = '<i class="fas fa-exclamation-triangle mr-1 text-red-600"></i>실패: ' + error.message;
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
                    card.innerHTML = '<img src="' + item.imageUrl + '" alt="Scene ' + (item.index + 1) + '" class="w-full h-48 object-cover">' +
                        '<div class="p-4">' +
                            '<div class="flex justify-between items-center mb-2">' +
                                '<div class="font-semibold text-gray-800">씬 ' + (item.index + 1) + '</div>' +
                                '<div class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">' +
                                    '<i class="fas fa-clock mr-1"></i>' + item.scene.duration + '초' +
                                '</div>' +
                            '</div>' +
                            '<p class="text-sm text-gray-600 mb-3">' + item.scene.description.substring(0, 80) + (item.scene.description.length > 80 ? '...' : '') + '</p>' +
                            '<div class="flex gap-2">' +
                                '<a href="' + item.imageUrl + '" download="scene_' + String(item.index + 1).padStart(2, '0') + '.png" ' +
                                   'class="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition">' +
                                    '<i class="fas fa-download mr-1"></i>다운로드' +
                                '</a>' +
                                '<button onclick="regenerateImage(' + item.index + ')" ' +
                                        'class="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded transition">' +
                                    '<i class="fas fa-redo mr-1"></i>재생성' +
                                '</button>' +
                            '</div>' +
                        '</div>';
                    completedGrid.appendChild(card);
                });

                // 썸네일 생성 버튼 추가
                const thumbnailSection = document.createElement('div');
                thumbnailSection.className = 'col-span-full mt-6 text-center';
                thumbnailSection.innerHTML = '<button onclick="generateThumbnail()" ' +
                            'class="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">' +
                        '<i class="fas fa-image mr-2"></i>썸네일 생성하기' +
                    '</button>' +
                    '<p class="text-sm text-gray-600 mt-2">영상 제목을 기반으로 매력적인 썸네일을 생성합니다</p>';
                completedGrid.appendChild(thumbnailSection);
            }

            function clearAll() {
                if (confirm('모든 내용을 초기화하시겠습니까?')) {
                    document.getElementById('videoTitle').value = '';
                    document.getElementById('storyText').value = '';
                    document.getElementById('sceneAnalysisSection').classList.add('hidden');
                    document.getElementById('generationProgressSection').classList.add('hidden');
                    document.getElementById('completedSection').classList.add('hidden');
                    document.getElementById('thumbnailSection').classList.add('hidden');
                    sceneList = [];
                    generatedImages = [];
                }
            }

            async function regenerateImage(index) {
                if (!confirm('씬 ' + (index + 1) + '의 이미지를 다시 생성하시겠습니까? (약 2-3분 소요)')) {
                    return;
                }

                const scene = sceneList[index];
                const progressCard = document.getElementById(\`progress-\${index}\`);
                
                if (!progressCard) {
                    alert('진행 상황 카드를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
                    return;
                }

                // 진행 섹션으로 스크롤
                const generationProgressSection = document.getElementById('generationProgressSection');
                generationProgressSection.classList.remove('hidden');
                generationProgressSection.scrollIntoView({ behavior: 'smooth' });

                // 재생성 시작
                await generateSceneImage(index);

                // 완료된 이미지 목록 업데이트
                displayCompletedImages();
            }

            async function downloadAllImages() {
                if (generatedImages.length === 0) {
                    alert('다운로드할 이미지가 없습니다!');
                    return;
                }

                if (!confirm('총 ' + generatedImages.length + '개 이미지를 ZIP 파일로 다운로드하시겠습니까?')) {
                    return;
                }

                try {
                    // JSZip 라이브러리를 동적으로 로드
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
                    document.head.appendChild(script);

                    await new Promise(resolve => {
                        script.onload = resolve;
                    });

                    const zip = new JSZip();
                    const folder = zip.folder('youtube_scenes');

                    // 상태 표시
                    const statusDiv = document.createElement('div');
                    statusDiv.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                    statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>ZIP 파일 생성 중...';
                    document.body.appendChild(statusDiv);

                    // 각 이미지를 ZIP에 추가
                    for (let i = 0; i < generatedImages.length; i++) {
                        const item = generatedImages[i];
                        statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>이미지 추가 중... (' + (i + 1) + '/' + generatedImages.length + ')';
                        
                        try {
                            // Data URL을 Blob으로 변환
                            const response = await fetch(item.imageUrl);
                            const blob = await response.blob();
                            
                            // 파일명: scene_01.png, scene_02.png, ...
                            const filename = 'scene_' + String(i + 1).padStart(2, '0') + '.png';
                            folder.file(filename, blob);
                        } catch (error) {
                            console.error('이미지 ' + (i + 1) + ' 추가 실패:', error);
                        }
                    }

                    statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>ZIP 파일 압축 중...';

                    // ZIP 파일 생성 및 다운로드
                    const content = await zip.generateAsync({ type: 'blob' });
                    const url = URL.createObjectURL(content);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'youtube_scenes_' + new Date().getTime() + '.zip';
                    a.click();
                    URL.revokeObjectURL(url);

                    statusDiv.innerHTML = '<i class="fas fa-check-circle mr-2"></i>다운로드 완료!';
                    setTimeout(() => {
                        document.body.removeChild(statusDiv);
                    }, 2000);

                } catch (error) {
                    alert('ZIP 파일 생성 중 오류 발생: ' + error.message);
                }
            }

            async function recommendTitle() {
                const storyText = document.getElementById('storyText').value.trim();
                if (!storyText) {
                    alert('먼저 스토리 내용을 입력해주세요!');
                    return;
                }

                const recommendationsDiv = document.getElementById('titleRecommendations');
                recommendationsDiv.innerHTML = '<div class="text-center py-2"><i class="fas fa-spinner fa-spin text-blue-600"></i> AI가 제목을 추천하고 있습니다...</div>';
                recommendationsDiv.classList.remove('hidden');

                try {
                    const response = await fetch('/api/recommend-title', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ story: storyText })
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        recommendationsDiv.innerHTML = '';
                        
                        data.titles.forEach((title, index) => {
                            const titleCard = document.createElement('div');
                            titleCard.className = 'flex items-center gap-2 p-2 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 cursor-pointer transition';
                            titleCard.onclick = () => {
                                document.getElementById('videoTitle').value = title;
                                recommendationsDiv.classList.add('hidden');
                            };
                            titleCard.innerHTML = '<i class="fas fa-star text-yellow-500"></i>' +
                                '<span class="flex-1 text-gray-800">' + title + '</span>' +
                                '<i class="fas fa-chevron-right text-gray-400"></i>';
                            recommendationsDiv.appendChild(titleCard);
                        });
                    } else {
                        throw new Error(data.error || '제목 추천 실패');
                    }
                } catch (error) {
                    recommendationsDiv.innerHTML = '<div class="text-red-600 text-sm"><i class="fas fa-exclamation-triangle mr-1"></i>' + error.message + '</div>';
                }
            }

            async function generateThumbnail() {
                const videoTitle = document.getElementById('videoTitle').value.trim();
                if (!videoTitle) {
                    alert('영상 제목을 입력해주세요!');
                    return;
                }

                if (!confirm('"' + videoTitle + '" 제목으로 썸네일을 생성하시겠습니까? (약 2-3분 소요)')) {
                    return;
                }

                // 썸네일 섹션 표시
                const thumbnailSection = document.getElementById('thumbnailSection');
                thumbnailSection.classList.remove('hidden');
                thumbnailSection.scrollIntoView({ behavior: 'smooth' });

                const thumbnailStatus = document.getElementById('thumbnailStatus');
                const thumbnailPreview = document.getElementById('thumbnailPreview');
                const thumbnailDownload = document.getElementById('thumbnailDownload');

                thumbnailStatus.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>썸네일 생성 중... (2-3분 소요)';
                thumbnailPreview.classList.add('hidden');
                thumbnailDownload.classList.add('hidden');

                try {
                    const prompt = STYLE_PROMPT + '\n\nReference Image: ' + REFERENCE_IMAGE + '\n(Please analyze and replicate the visual style from this reference image)\n\nTitle: ' + videoTitle + '\n\nCreate an eye-catching YouTube thumbnail that represents this video title. \nThe thumbnail should be visually striking, professional, and engaging.\nInclude bold, readable text if needed to emphasize the main message.\nUse contrasting colors to make the thumbnail stand out.\nAspect ratio: 16:9 for YouTube compatibility.\nMake it click-worthy and attention-grabbing!';

                    const response = await fetch('/api/generate-scene-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            scene: { description: videoTitle, visualElements: 'YouTube thumbnail design', duration: 0 },
                            prompt: prompt,
                            index: -1
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        thumbnailStatus.innerHTML = '<i class="fas fa-check-circle text-green-600 mr-2"></i>썸네일 생성 완료!';
                        
                        const img = thumbnailPreview.querySelector('img');
                        img.src = data.imageUrl;
                        thumbnailPreview.classList.remove('hidden');

                        thumbnailDownload.href = data.imageUrl;
                        thumbnailDownload.classList.remove('hidden');
                    } else {
                        throw new Error(data.error || '생성 실패');
                    }
                } catch (error) {
                    thumbnailStatus.innerHTML = \`<i class="fas fa-exclamation-triangle text-red-600 mr-2"></i>실패: \${error.message}\`;
                }
            }
        </script>
    </body>
    </html>
  `)
})

// 제목 추천 API
app.post('/api/recommend-title', async (c) => {
  try {
    const { story } = await c.req.json()
    
    if (!story) {
      return c.json({ success: false, error: '스토리가 비어있습니다' })
    }

    // 환경 변수에서 API 키 가져오기
    const apiKey = c.env?.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return c.json({ 
        success: false, 
        error: 'Google AI API 키가 설정되지 않았습니다.'
      })
    }

    // Google Gemini API로 제목 추천 요청
    const modelName = 'gemini-2.0-flash-exp'
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`
    
    const prompt = `다음 스토리를 읽고, 매력적이고 클릭을 유도하는 YouTube 영상 제목 5개를 추천해주세요.

스토리:
${story}

요구사항:
1. 짧고 임팩트있게 (10-15자 이내)
2. 호기심을 자극하는 제목
3. 감정을 자극하는 단어 사용
4. 숫자나 리스트 활용 가능
5. 질문형 또는 단언형 모두 가능

JSON 형식으로만 응답하세요:
{
  "titles": [
    "제목 1",
    "제목 2",
    "제목 3",
    "제목 4",
    "제목 5"
  ]
}`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('API Error:', errorData)
      return c.json({ 
        success: false, 
        error: `제목 추천 실패: ${response.status} ${response.statusText}`
      })
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates.length > 0) {
      const text = data.candidates[0].content.parts[0].text
      
      // JSON 파싱 시도
      try {
        // JSON 형식 추출 (코드 블록이 있을 수 있음)
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0])
          return c.json({ 
            success: true, 
            titles: jsonData.titles || []
          })
        }
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError)
      }
      
      // JSON 파싱 실패 시 텍스트에서 제목 추출
      const lines = text.split('\n').filter(line => line.trim() && !line.includes('{') && !line.includes('}'))
      const titles = lines
        .map(line => line.replace(/^[\d\-\.\*\s"]+/, '').replace(/["]+$/, '').trim())
        .filter(line => line.length > 0 && line.length < 50)
        .slice(0, 5)
      
      return c.json({ 
        success: true, 
        titles: titles
      })
    } else {
      return c.json({ 
        success: false, 
        error: '제목 추천 결과가 없습니다.'
      })
    }
    
  } catch (error) {
    console.error('Title recommendation error:', error)
    return c.json({ success: false, error: error.message })
  }
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
    
    // 1-1. 문제 제기 - 현실 인식
    if (story.includes('열심히') || story.includes('노력') || story.includes('제자리')) {
      const duration1 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '열심히 살고 있는데 항상 돈이 없는 현실.',
        visualElements: '고민하는 사람, 지갑이 비어있는 모습, 답답한 표정',
        duration: duration1,
        startTime: currentTime,
        endTime: currentTime + duration1,
        sceneType: '문제 제기'
      })
      currentTime += duration1

      // 1-2. 문제 제기 - 반복되는 패턴
      const duration2 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '남들보다 덜 노력하는 것도 아닌데 왜 늘 제자리인가에 대한 고민.',
        visualElements: '반복되는 일상, 쳇바퀴 같은 생활, 어두운 톤의 배경',
        duration: duration2,
        startTime: currentTime,
        endTime: currentTime + duration2,
        sceneType: '문제 제기'
      })
      currentTime += duration2
    }

    // 2-1. 어린 시절의 가르침
    if (story.includes('어릴 때') || story.includes('성실') || story.includes('들어왔다')) {
      const duration1 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '어릴 때부터 들어온 말들. "성실하면 잘 된다", "열심히 하면 보상받는다".',
        visualElements: '어린 시절 회상, 선생님이나 부모의 가르침, 희망적이지만 순진한 분위기',
        duration: duration1,
        startTime: currentTime,
        endTime: currentTime + duration1,
        sceneType: '배경/가치관'
      })
      currentTime += duration1

      // 2-2. 참고 버티는 사람들
      const duration2 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '많은 사람들이 불평하지 않고 참고 버티는 모습.',
        visualElements: '참고 일하는 사람들, 인내하는 표정, 묵묵히 일하는 장면',
        duration: duration2,
        startTime: currentTime,
        endTime: currentTime + duration2,
        sceneType: '배경/가치관'
      })
      currentTime += duration2
    }

    // 3-1. 개인이 아닌 구조의 문제
    if (story.includes('구조') || story.includes('시간을 써서')) {
      const duration1 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '개인의 문제가 아닌 구조의 문제. 대부분의 사람은 시간을 써서 돈을 번다.',
        visualElements: '시계와 돈의 교환, 톱니바퀴 시스템, 시스템 다이어그램',
        duration: duration1,
        startTime: currentTime,
        endTime: currentTime + duration1,
        sceneType: '핵심 문제'
      })
      currentTime += duration1

      // 3-2. 일한 만큼 받는 시스템
      const duration2 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '일한 만큼 받고, 쉬면 수입이 멈춘다.',
        visualElements: '쳇바퀴 돌리는 모습, 멈추지 못하는 사람, 끝없는 반복',
        duration: duration2,
        startTime: currentTime,
        endTime: currentTime + duration2,
        sceneType: '핵심 문제'
      })
      currentTime += duration2
    }

    // 4-1. 절약의 시작
    if (story.includes('아끼') || story.includes('커피') || story.includes('참고')) {
      const duration1 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '돈이 없을수록 더 아끼려 한다. 커피를 줄이고, 사고 싶은 걸 참는다.',
        visualElements: '계산기, 가계부, 절약하는 모습, 참는 표정',
        duration: duration1,
        startTime: currentTime,
        endTime: currentTime + duration1,
        sceneType: '잘못된 접근'
      })
      currentTime += duration1

      // 4-2. 절약의 한계
      const duration2 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '하고 싶은 걸 미루고 참지만, 이것만으로는 바뀌지 않는다.',
        visualElements: '답답한 분위기, 한계를 느끼는 손동작, 좌절하는 모습',
        duration: duration2,
        startTime: currentTime,
        endTime: currentTime + duration2,
        sceneType: '잘못된 접근'
      })
      currentTime += duration2
    }

    // 5-1. 돈의 한계 vs 무한 가능성
    if (story.includes('흘러가') || story.includes('관심')) {
      const duration1 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '아낄 수 있는 돈에는 한계가 있지만 벌 수 있는 돈에는 한계가 없다.',
        visualElements: '한계선과 무한대 기호, 대비되는 이미지, 새로운 시각',
        duration: duration1,
        startTime: currentTime,
        endTime: currentTime + duration1,
        sceneType: '핵심 깨달음'
      })
      currentTime += duration1

      // 5-2. 돈의 흐름을 보는 사람들
      const duration2 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '돈이 되는 사람들은 돈의 흐름을 본다. 돈은 관심을 주지 않는 사람 곁에 머물지 않는다.',
        visualElements: '돈의 흐름 화살표, 관찰하는 사람, 분석하는 모습, 밝아지는 표정',
        duration: duration2,
        startTime: currentTime,
        endTime: currentTime + duration2,
        sceneType: '핵심 깨달음'
      })
      currentTime += duration2
    }

    // 6-1. 안정의 역설
    if (story.includes('안정') || story.includes('하나뿐') || story.includes('월급')) {
      const duration1 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '안정적인 삶을 원하지만, 수입이 하나뿐인 상태가 가장 불안정할 수 있다.',
        visualElements: '한 줄로 연결된 수입원, 위태로운 균형, 불안한 표정',
        duration: duration1,
        startTime: currentTime,
        endTime: currentTime + duration1,
        sceneType: '위험 인식'
      })
      currentTime += duration1

      // 6-2. 쉽게 흔들리는 삶
      const duration2 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '회사 하나, 월급 하나에 모든 걸 맡긴 삶은 쉽게 흔들린다.',
        visualElements: '흔들리는 모습, 위험 신호, 깨지는 안전망',
        duration: duration2,
        startTime: currentTime,
        endTime: currentTime + duration2,
        sceneType: '위험 인식'
      })
      currentTime += duration2
    }

    // 7-1. 시간 사용 방식의 변화
    if (story.includes('벗어나는') || story.includes('달라지고') || story.includes('방향')) {
      const duration1 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '가난에서 벗어나는 사람들의 특징. 시간을 쓰는 방식이 달라지고, 돈이 되는 경험을 만든다.',
        visualElements: '시간 활용의 변화, 새로운 접근, 밝은 분위기',
        duration: duration1,
        startTime: currentTime,
        endTime: currentTime + duration1,
        sceneType: '해결책'
      })
      currentTime += duration1

      // 7-2. 자산 축적의 시작
      const duration2 = 5
      scenes.push({
        index: scenes.length + 1,
        description: '한 번 한 일을 여러 번 쓰고, 작은 수입을 하나씩 늘려간다.',
        visualElements: '여러 개의 수입 파이프라인, 자산을 만드는 모습, 성장하는 그래프, 희망적인 분위기',
        duration: duration2,
        startTime: currentTime,
        endTime: currentTime + duration2,
        sceneType: '해결책'
      })
      currentTime += duration2
    }

    // 8-1. 위로의 메시지
    if (story.includes('잘못') || story.includes('부족') || story.includes('질문')) {
      const duration1 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '당신이 힘든 이유는 부족해서도 뒤처져서도 아니다.',
        visualElements: '위로하는 손길, 따뜻한 빛, 긍정적인 분위기',
        duration: duration1,
        startTime: currentTime,
        endTime: currentTime + duration1,
        sceneType: '위로/메시지'
      })
      currentTime += duration1

      // 8-2. 구조에 대한 이해
      const duration2 = 4
      scenes.push({
        index: scenes.length + 1,
        description: '열심히 사는 법만 배웠지 구조는 배운 적이 없었을 뿐이다. 이건 당신 잘못이 아니다.',
        visualElements: '깨달음의 순간, 새로운 시각, 안도하는 표정',
        duration: duration2,
        startTime: currentTime,
        endTime: currentTime + duration2,
        sceneType: '위로/메시지'
      })
      currentTime += duration2

      // 8-3. 마지막 질문
      const duration3 = 5
      scenes.push({
        index: scenes.length + 1,
        description: '마지막 질문: 지금의 노력은 나를 어디로 데려가는가?',
        visualElements: '질문 텍스트, 희망의 길, 새로운 방향, 긍정적인 결말, 밝은 미래',
        duration: duration3,
        startTime: currentTime,
        endTime: currentTime + duration3,
        sceneType: '위로/메시지'
      })
      currentTime += duration3
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

    // 환경 변수에서 API 키 가져오기
    // Cloudflare Workers: c.env?.GOOGLE_AI_API_KEY
    // Node.js: process.env.GOOGLE_AI_API_KEY
    const apiKey = c.env?.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return c.json({ 
        success: false, 
        error: 'Google AI API 키가 설정되지 않았습니다. .dev.vars 파일을 확인하세요.'
      })
    }

    // Google Gemini Nano Banana Pro API 호출
    const modelName = 'gemini-3-pro-image-preview'
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('API Error:', errorData)
      return c.json({ 
        success: false, 
        error: `이미지 생성 실패: ${response.status} ${response.statusText}`,
        details: errorData
      })
    }

    const data = await response.json()
    
    // 생성된 이미지 데이터 추출
    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content.parts
      
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          // Base64 인코딩된 이미지 데이터
          const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
          
          return c.json({ 
            success: true, 
            imageUrl: imageUrl,
            index: index
          })
        }
      }
      
      return c.json({ 
        success: false, 
        error: '이미지 데이터를 찾을 수 없습니다.'
      })
    } else {
      return c.json({ 
        success: false, 
        error: '이미지 생성 결과가 없습니다.',
        response: data
      })
    }
    
  } catch (error) {
    console.error('Image generation error:', error)
    return c.json({ success: false, error: error.message })
  }
})

export default app
