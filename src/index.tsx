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
        <style>
          .loading-spinner {
            border: 4px solid #f3f4f6;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .paragraph-item {
            transition: all 0.3s ease;
          }
          .paragraph-item:hover {
            background-color: #f3f4f6;
          }
          .image-card {
            position: relative;
            overflow: hidden;
          }
          .image-card img {
            transition: transform 0.3s ease;
          }
          .image-card:hover img {
            transform: scale(1.05);
          }
        </style>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="container mx-auto px-4 py-8 max-w-6xl">
            <!-- 헤더 -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h1 class="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                    <i class="fas fa-images mr-3 text-blue-600"></i>
                    YouTube 배경화면 이미지 생성기
                </h1>
                <p class="text-gray-600">문단을 입력하면 Nano Banana Pro로 일관된 스타일의 이미지를 일괄 생성합니다</p>
                <div class="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <div class="flex items-start">
                        <i class="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-2"></i>
                        <div class="text-sm text-yellow-800">
                            <strong>데모 모드:</strong> 현재는 플레이스홀더 이미지로 UI를 테스트할 수 있습니다. 
                            실제 이미지 생성을 위해서는 GenSpark API 키가 필요합니다.
                        </div>
                    </div>
                </div>
            </div>

            <!-- 참고 이미지 섹션 -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-image mr-2 text-green-600"></i>
                    참고 이미지 (선택사항)
                </h2>
                <div class="mb-4">
                    <label class="block text-gray-700 font-semibold mb-2">이미지 URL을 입력하세요:</label>
                    <input type="text" id="referenceImage" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="https://example.com/image.jpg 또는 업로드한 이미지 URL"
                           value="https://www.genspark.ai/api/files/s/57W955Hh">
                    <p class="text-sm text-gray-500 mt-2">
                        <i class="fas fa-info-circle"></i>
                        참고 이미지를 입력하면 해당 스타일을 따라 이미지가 생성됩니다
                    </p>
                </div>
                <div id="referencePreview" class="mt-4">
                    <img id="refPreviewImg" src="https://www.genspark.ai/api/files/s/57W955Hh" alt="Reference" class="max-w-sm rounded-lg shadow-md">
                </div>
            </div>

            <!-- 입력 섹션 -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-edit mr-2 text-purple-600"></i>
                    문단 입력
                </h2>
                <div class="mb-4">
                    <label class="block text-gray-700 font-semibold mb-2">문단을 입력하세요 (한 줄에 하나씩):</label>
                    <textarea id="paragraphs" 
                              class="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                              placeholder="첫 번째 문단을 입력하세요.
두 번째 문단을 입력하세요.
세 번째 문단을 입력하세요.

각 줄이 하나의 이미지가 됩니다.">1974년, 미국 한 대학교의 강연장에 레이 A. 크록(Ray A. Kroc)이 연설을 하고 있습니다.
맥도날드 창업자 레이 A. 크록은 학생들에게 성공의 비결에 대해 이야기합니다.
"성공의 비결은 끈기와 비전입니다. 포기하지 마세요."
학생들은 크록의 열정적인 강연에 경청하며 메모를 합니다.</textarea>
                </div>
                <div class="flex gap-4">
                    <button onclick="generateImages()" 
                            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
                        <i class="fas fa-magic mr-2"></i>
                        일괄 생성 시작
                    </button>
                    <button onclick="clearAll()" 
                            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300">
                        <i class="fas fa-trash mr-2"></i>
                        초기화
                    </button>
                </div>
            </div>

            <!-- 진행 상황 -->
            <div id="progressSection" class="bg-white rounded-lg shadow-lg p-6 mb-6 hidden">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-tasks mr-2 text-orange-600"></i>
                    생성 진행 상황
                </h2>
                <div class="mb-4">
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-700 font-semibold">진행률</span>
                        <span id="progressText" class="text-gray-700 font-semibold">0 / 0</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-6">
                        <div id="progressBar" class="bg-blue-600 h-6 rounded-full transition-all duration-500" style="width: 0%">
                            <span id="progressPercent" class="flex items-center justify-center h-full text-white font-bold text-sm"></span>
                        </div>
                    </div>
                </div>
                <div id="paragraphList" class="space-y-3 max-h-96 overflow-y-auto"></div>
            </div>

            <!-- 결과 섹션 -->
            <div id="resultSection" class="bg-white rounded-lg shadow-lg p-6 hidden">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-check-circle mr-2 text-green-600"></i>
                        생성된 이미지
                    </h2>
                    <button onclick="downloadAllImages()" 
                            class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300">
                        <i class="fas fa-download mr-2"></i>
                        전체 다운로드
                    </button>
                </div>
                <div id="imageGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            let generatedImages = [];
            let referenceImageUrl = 'https://www.genspark.ai/api/files/s/57W955Hh';

            // 참고 이미지 미리보기
            document.getElementById('referenceImage').addEventListener('input', function(e) {
                const url = e.target.value.trim();
                const preview = document.getElementById('referencePreview');
                const img = document.getElementById('refPreviewImg');
                
                if (url) {
                    img.src = url;
                    preview.classList.remove('hidden');
                    referenceImageUrl = url;
                } else {
                    preview.classList.add('hidden');
                    referenceImageUrl = '';
                }
            });

            async function generateImages() {
                const paragraphsText = document.getElementById('paragraphs').value.trim();
                if (!paragraphsText) {
                    alert('문단을 입력해주세요!');
                    return;
                }

                const paragraphs = paragraphsText.split('\\n').filter(p => p.trim());
                if (paragraphs.length === 0) {
                    alert('유효한 문단을 입력해주세요!');
                    return;
                }

                // 진행 상황 섹션 표시
                const progressSection = document.getElementById('progressSection');
                const resultSection = document.getElementById('resultSection');
                const paragraphList = document.getElementById('paragraphList');
                
                progressSection.classList.remove('hidden');
                resultSection.classList.add('hidden');
                paragraphList.innerHTML = '';
                generatedImages = [];

                // 문단 목록 생성
                paragraphs.forEach((para, index) => {
                    const item = document.createElement('div');
                    item.id = \`para-\${index}\`;
                    item.className = 'paragraph-item flex items-start gap-3 p-4 border border-gray-200 rounded-lg';
                    item.innerHTML = \`
                        <div class="flex-shrink-0 mt-1">
                            <div id="spinner-\${index}" class="loading-spinner"></div>
                            <i id="check-\${index}" class="fas fa-check-circle text-green-600 text-3xl hidden"></i>
                            <i id="error-\${index}" class="fas fa-times-circle text-red-600 text-3xl hidden"></i>
                        </div>
                        <div class="flex-1">
                            <div class="font-semibold text-gray-700 mb-1">문단 \${index + 1}</div>
                            <div class="text-gray-600 text-sm">\${para.substring(0, 100)}\${para.length > 100 ? '...' : ''}</div>
                            <div id="status-\${index}" class="text-sm text-gray-500 mt-2">대기중...</div>
                        </div>
                    \`;
                    paragraphList.appendChild(item);
                });

                // 이미지 생성 시작
                let completed = 0;
                const total = paragraphs.length;

                for (let i = 0; i < paragraphs.length; i++) {
                    try {
                        updateStatus(i, '이미지 생성 중... (최대 2-3분 소요)');
                        
                        const response = await axios.post('/api/generate', {
                            paragraph: paragraphs[i],
                            index: i,
                            referenceImage: referenceImageUrl
                        }, {
                            timeout: 180000 // 3분 타임아웃
                        });

                        if (response.data.success) {
                            generatedImages.push({
                                index: i,
                                paragraph: paragraphs[i],
                                imageUrl: response.data.imageUrl,
                                estimatedDuration: response.data.estimatedDuration || 5
                            });
                            updateStatus(i, \`완료! (예상 재생 시간: \${response.data.estimatedDuration}초)\`, true);
                        } else {
                            throw new Error(response.data.error || '생성 실패');
                        }
                    } catch (error) {
                        console.error(\`문단 \${i + 1} 생성 실패:\`, error);
                        updateStatus(i, \`실패: \${error.message}\`, false);
                    }

                    completed++;
                    updateProgress(completed, total);
                }

                // 결과 표시
                displayResults();
            }

            function updateStatus(index, message, success = null) {
                const statusEl = document.getElementById(\`status-\${index}\`);
                const spinner = document.getElementById(\`spinner-\${index}\`);
                const check = document.getElementById(\`check-\${index}\`);
                const error = document.getElementById(\`error-\${index}\`);

                statusEl.textContent = message;

                if (success === true) {
                    spinner.classList.add('hidden');
                    check.classList.remove('hidden');
                    statusEl.classList.add('text-green-600', 'font-semibold');
                } else if (success === false) {
                    spinner.classList.add('hidden');
                    error.classList.remove('hidden');
                    statusEl.classList.add('text-red-600', 'font-semibold');
                }
            }

            function updateProgress(completed, total) {
                const progressBar = document.getElementById('progressBar');
                const progressText = document.getElementById('progressText');
                const progressPercent = document.getElementById('progressPercent');
                
                const percent = Math.round((completed / total) * 100);
                progressBar.style.width = percent + '%';
                progressText.textContent = \`\${completed} / \${total}\`;
                progressPercent.textContent = percent + '%';
            }

            function displayResults() {
                const resultSection = document.getElementById('resultSection');
                const imageGrid = document.getElementById('imageGrid');
                
                resultSection.classList.remove('hidden');
                imageGrid.innerHTML = '';

                generatedImages.sort((a, b) => a.index - b.index);

                let totalDuration = 0;
                generatedImages.forEach((item) => {
                    totalDuration += item.estimatedDuration || 5;
                    
                    const card = document.createElement('div');
                    card.className = 'image-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300';
                    card.innerHTML = \`
                        <img src="\${item.imageUrl}" alt="Image \${item.index + 1}" class="w-full h-48 object-cover">
                        <div class="p-4">
                            <div class="flex justify-between items-center mb-2">
                                <div class="font-semibold text-gray-800">문단 \${item.index + 1}</div>
                                <div class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    <i class="fas fa-clock mr-1"></i>\${item.estimatedDuration}초
                                </div>
                            </div>
                            <div class="text-sm text-gray-600 mb-3 line-clamp-3">\${item.paragraph}</div>
                            <a href="\${item.imageUrl}" download="youtube-bg-\${item.index + 1}.png" 
                               class="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300">
                                <i class="fas fa-download mr-2"></i>다운로드
                            </a>
                        </div>
                    \`;
                    imageGrid.appendChild(card);
                });

                // 총 재생 시간 표시
                const totalInfo = document.createElement('div');
                totalInfo.className = 'col-span-full bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mt-4';
                totalInfo.innerHTML = \`
                    <div class="flex items-center">
                        <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                        <div class="text-blue-800">
                            <strong>총 \${generatedImages.length}개 이미지 생성 완료</strong>
                            <span class="ml-2">|</span>
                            <span class="ml-2">예상 총 재생 시간: 약 \${totalDuration}초 (\${Math.floor(totalDuration / 60)}분 \${totalDuration % 60}초)</span>
                        </div>
                    </div>
                \`;
                imageGrid.appendChild(totalInfo);
            }

            async function downloadAllImages() {
                for (let i = 0; i < generatedImages.length; i++) {
                    const item = generatedImages[i];
                    const link = document.createElement('a');
                    link.href = item.imageUrl;
                    link.download = \`youtube-bg-\${item.index + 1}.png\`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // 다운로드 간격 (브라우저 제한 회피)
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                alert(\`\${generatedImages.length}개 이미지 다운로드를 시작했습니다!\`);
            }

            function clearAll() {
                if (confirm('모든 내용을 초기화하시겠습니까?')) {
                    document.getElementById('paragraphs').value = '';
                    document.getElementById('progressSection').classList.add('hidden');
                    document.getElementById('resultSection').classList.add('hidden');
                    generatedImages = [];
                }
            }
        </script>
    </body>
    </html>
  `)
})

// 이미지 생성 API - 데모 버전 (플레이스홀더)
app.post('/api/generate', async (c) => {
  try {
    const { paragraph, index, referenceImage } = await c.req.json()
    
    if (!paragraph) {
      return c.json({ success: false, error: '문단이 비어있습니다' })
    }

    // 스타일 참고 프롬프트 (분석된 이미지 스타일 기반)
    const stylePrompt = 'Style: Digital illustration with hand-drawn effect, warm earthy colors (browns, beiges, soft blues), simple cartoonish characters with expressive faces, brick wall background with windows, educational atmosphere, Korean text integrated naturally like chalk on blackboard or subtitles.'

    // 문단 길이에 따라 이미지 지속 시간 추정 (3-10초)
    const textLength = paragraph.length
    let estimatedDuration = 5 // 기본 5초
    if (textLength < 50) estimatedDuration = 3
    else if (textLength < 100) estimatedDuration = 5
    else if (textLength < 200) estimatedDuration = 7
    else estimatedDuration = 10

    // 실제 이미지 생성 프롬프트
    const referenceText = referenceImage ? `Reference image style: ${referenceImage}` : ''
    const fullPrompt = `${stylePrompt}

Korean Content: ${paragraph}

Create an educational illustration that visually represents this Korean text content. 
The image should be engaging, clear, and suitable as a YouTube video background for approximately ${estimatedDuration} seconds of narration.
${referenceText}
Maintain consistent visual language with warm, inviting colors and clear composition.`

    // 데모 모드: 플레이스홀더 이미지 반환
    // 실제 구현 시에는 여기서 GenSpark image_generation API를 호출해야 합니다
    // 예: POST to GenSpark API endpoint with the fullPrompt and referenceImage
    
    // 시뮬레이션을 위한 지연
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 실제 구현 예시:
    /*
    const imageResponse = await fetch('YOUR_IMAGE_GENERATION_API', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nano-banana-pro',
        query: fullPrompt,
        image_urls: referenceImage ? [referenceImage] : [],
        aspect_ratio: '16:9',
        task_summary: 'Generate YouTube background image for narration'
      })
    })
    */
    
    return c.json({ 
      success: true, 
      imageUrl: `https://placehold.co/1920x1080/${getRandomColor()}/ffffff?text=${encodeURIComponent('문단 ' + (index + 1))}&font=noto-sans-kr`,
      prompt: fullPrompt,
      estimatedDuration,
      note: 'This is a demo placeholder. Integrate with GenSpark API for real image generation.'
    })
    
  } catch (error) {
    console.error('Image generation error:', error)
    return c.json({ success: false, error: error.message })
  }
})

// 랜덤 색상 생성 (플레이스홀더용)
function getRandomColor() {
  const colors = ['3b82f6', '8b5cf6', '10b981', 'f59e0b', 'ef4444', '06b6d4']
  return colors[Math.floor(Math.random() * colors.length)]
}

export default app
