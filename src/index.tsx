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
                    <button onclick="generatePrompts()" 
                            class="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
                        <i class="fas fa-magic mr-2"></i>
                        프롬프트 생성
                    </button>
                    <button onclick="clearAll()" 
                            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300">
                        <i class="fas fa-trash mr-2"></i>
                        초기화
                    </button>
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
            
            let generationList = [];

            function estimateDuration(text) {
                const length = text.length;
                if (length < 50) return 3;
                if (length < 100) return 5;
                if (length < 200) return 7;
                return 10;
            }

            function createPrompt(paragraph, duration) {
                return STYLE_PROMPT + '\\n\\n' +
                    'Reference Image: ' + REFERENCE_IMAGE + '\\n' +
                    '(Please analyze and replicate the visual style from this reference image)\\n\\n' +
                    'Korean Content: ' + paragraph + '\\n\\n' +
                    'Create an educational illustration that visually represents this Korean text content. ' +
                    'The image should be engaging, clear, and suitable as a YouTube video background for approximately ' + duration + ' seconds of narration. ' +
                    'Maintain consistent visual language with warm, inviting colors and clear composition. ' +
                    'Aspect ratio: 16:9 for YouTube compatibility. ' +
                    'Use Nano Banana Pro model for best quality.';
            }

            function generatePrompts() {
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

                // 생성 목록 만들기
                generationList = [];
                let totalDuration = 0;

                paragraphs.forEach((paragraph, index) => {
                    const duration = estimateDuration(paragraph);
                    const prompt = createPrompt(paragraph, duration);
                    
                    generationList.push({
                        index: index + 1,
                        paragraph: paragraph,
                        estimatedDuration: duration,
                        prompt: prompt,
                        outputFilename: 'youtube_bg_' + String(index + 1).padStart(2, '0') + '.png'
                    });
                    
                    totalDuration += duration;
                });

                // 결과 표시
                displayResults(totalDuration);
            }

            function displayResults(totalDuration) {
                const resultSection = document.getElementById('resultSection');
                const summary = document.getElementById('summary');
                const promptList = document.getElementById('promptList');
                
                resultSection.classList.remove('hidden');
                
                // 요약 정보
                const minutes = Math.floor(totalDuration / 60);
                const seconds = totalDuration % 60;
                summary.innerHTML = '<div class="flex items-center justify-between">' +
                    '<div><i class="fas fa-info-circle text-blue-600 mr-2"></i>' +
                    '<strong>총 ' + generationList.length + '개 프롬프트 생성</strong></div>' +
                    '<div class="text-blue-800">' +
                    '예상 총 재생 시간: ' + totalDuration + '초 (' + minutes + '분 ' + seconds + '초)' +
                    '</div></div>';
                
                // 프롬프트 목록
                promptList.innerHTML = '';
                
                generationList.forEach((item) => {
                    const card = document.createElement('div');
                    card.className = 'border border-gray-200 rounded-lg p-4 hover:shadow-md transition';
                    card.innerHTML = '<div class="flex justify-between items-start mb-2">' +
                        '<div class="font-semibold text-gray-800">문단 ' + item.index + '</div>' +
                        '<div class="flex gap-2">' +
                        '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">' +
                        '<i class="fas fa-clock mr-1"></i>' + item.estimatedDuration + '초</span>' +
                        '<button onclick="copyPrompt(' + (item.index - 1) + ')" ' +
                        'class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition">' +
                        '<i class="fas fa-copy mr-1"></i>복사</button>' +
                        '</div></div>' +
                        '<div class="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded">' +
                        item.paragraph + '</div>' +
                        '<div class="text-xs text-gray-500 mb-2"><strong>프롬프트:</strong></div>' +
                        '<textarea readonly class="w-full text-xs font-mono p-2 bg-gray-50 border border-gray-200 rounded h-32 resize-none">' +
                        item.prompt + '</textarea>';
                    
                    promptList.appendChild(card);
                });
                
                // 스크롤
                resultSection.scrollIntoView({ behavior: 'smooth' });
            }

            function copyPrompt(index) {
                const prompt = generationList[index].prompt;
                navigator.clipboard.writeText(prompt).then(() => {
                    alert('프롬프트가 클립보드에 복사되었습니다!\\n\\nGenSpark Image Designer에 붙여넣어 사용하세요.');
                }).catch(err => {
                    alert('복사 실패: ' + err);
                });
            }

            function downloadJSON() {
                const dataStr = JSON.stringify(generationList, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'youtube_bg_generation_list.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                alert('JSON 파일이 다운로드되었습니다!');
            }

            function clearAll() {
                if (confirm('모든 내용을 초기화하시겠습니까?')) {
                    document.getElementById('paragraphs').value = '';
                    document.getElementById('resultSection').classList.add('hidden');
                    generationList = [];
                }
            }
        </script>
    </body>
    </html>
  `)
})

export default app
