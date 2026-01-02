# YouTube 배경화면 이미지 생성기

## 프로젝트 개요
- **이름**: YouTube 배경화면 이미지 생성기
- **목적**: 문단별로 Nano Banana Pro용 이미지 생성 프롬프트를 자동으로 만들어주는 도구
- **주요 기능**: 
  - 문단 텍스트 입력 (여러 줄 지원)
  - 일관된 스타일의 프롬프트 자동 생성
  - 문단 길이 기반 재생 시간 자동 계산 (3-10초)
  - 프롬프트 개별 복사 기능
  - JSON 파일 다운로드

## 🌐 URLs
- **프로덕션 (샌드박스)**: https://3000-i56x5nh4xinmzp74cqlq8-5185f4aa.sandbox.novita.ai

## 📊 완료된 기능
1. ✅ **문단 입력 시스템**
   - 여러 줄 텍스트 입력 지원
   - 각 줄이 개별 프롬프트로 생성
   - 예제 문단 제공 (맥도날드 창업자 레이 크록 강연)

2. ✅ **프롬프트 자동 생성**
   - 참고 이미지 스타일 분석 결과 반영
   - 일관된 스타일 가이드 적용
   - 한국어 텍스트 내용 통합
   - 16:9 비율 YouTube 최적화

3. ✅ **재생 시간 추정**
   - 문단 길이 기반 자동 계산
     - 50자 미만: 3초
     - 100자 미만: 5초
     - 200자 미만: 7초
     - 200자 이상: 10초
   - 총 재생 시간 자동 합산

4. ✅ **편의 기능**
   - 프롬프트 개별 복사 (클립보드)
   - JSON 파일 다운로드
   - 요약 정보 표시

## 📋 사용 방법

### 1단계: 문단 입력
웹 애플리케이션에 접속하여 문단을 입력합니다:
```
1974년, 미국 한 대학교의 강연장에 레이 A. 크록이 연설을 하고 있습니다.
맥도날드 창업자 레이 A. 크록은 학생들에게 성공의 비결에 대해 이야기합니다.
"성공의 비결은 끈기와 비전입니다. 포기하지 마세요."
학생들은 크록의 열정적인 강연에 경청하며 메모를 합니다.
```

### 2단계: 프롬프트 생성
"프롬프트 생성" 버튼을 클릭하면 각 문단에 대한 프롬프트가 자동 생성됩니다.

### 3단계: 이미지 생성
생성된 프롬프트를 GenSpark Image Designer에 붙여넣어 이미지를 생성합니다:
1. GenSpark 웹사이트 접속
2. Image Designer 에이전트 생성
3. 프롬프트 복사 버튼 클릭
4. Image Designer에 붙여넣기
5. Nano Banana Pro 모델 선택
6. 이미지 생성

## 🎨 프롬프트 스타일

모든 프롬프트에는 다음 스타일 가이드가 적용됩니다:

```
Style: Digital illustration with hand-drawn effect, 
warm earthy colors (browns, beiges, soft blues), 
simple cartoonish characters with expressive faces, 
brick wall background with windows, 
educational atmosphere, 
Korean text integrated naturally like chalk on blackboard or subtitles.

Reference Image: https://www.genspark.ai/api/files/s/57W955Hh
```

## 📂 프로젝트 구조
```
/home/user/webapp/
├── src/
│   ├── index.tsx          # 메인 애플리케이션 (Hono)
│   └── renderer.tsx       # HTML 렌더러
├── generate_images.py     # Python 스크립트 (선택사항)
├── paragraphs.txt         # 예제 문단 파일
├── ecosystem.config.cjs   # PM2 설정
├── package.json           # 의존성 및 스크립트
├── .dev.vars              # 환경 변수 (git 무시)
├── README.md              # 이 파일
└── .git/                  # Git 저장소
```

## 🐍 Python 스크립트 사용 (선택사항)

웹 애플리케이션 대신 Python 스크립트를 사용할 수도 있습니다:

```bash
# 텍스트 파일에서 프롬프트 생성
python generate_images.py paragraphs.txt

# JSON 파일 생성
# 출력: paragraphs_generation_list.json
```

## 💡 생성된 프롬프트 예시

**입력 문단:**
```
1974년, 미국 한 대학교의 강연장에 레이 A. 크록이 연설을 하고 있습니다.
```

**생성된 프롬프트:**
```
Style: Digital illustration with hand-drawn effect, warm earthy colors...

Reference Image: https://www.genspark.ai/api/files/s/57W955Hh
(Please analyze and replicate the visual style from this reference image)

Korean Content: 1974년, 미국 한 대학교의 강연장에 레이 A. 크록이 연설을 하고 있습니다.

Create an educational illustration that visually represents this Korean text content. 
The image should be engaging, clear, and suitable as a YouTube video background for approximately 5 seconds of narration.
Maintain consistent visual language with warm, inviting colors and clear composition.
Aspect ratio: 16:9 for YouTube compatibility.
Use Nano Banana Pro model for best quality.
```

## 🚀 배포 상태
- **플랫폼**: Cloudflare Pages (준비 완료)
- **현재 상태**: ✅ 샌드박스 환경에서 실행 중
- **기술 스택**: Hono + TypeScript + TailwindCSS
- **마지막 업데이트**: 2026-01-02

## 🔧 개발 명령어

```bash
# 개발 서버 시작 (샌드박스)
npm run dev:sandbox

# 빌드
npm run build

# PM2로 시작
pm2 start ecosystem.config.cjs

# PM2 재시작
pm2 restart webapp

# 포트 정리
npm run clean-port

# 프로덕션 배포
npm run deploy:prod
```

## 📦 주요 의존성
- **hono**: ^4.11.3 - 웹 프레임워크
- **vite**: ^6.3.5 - 빌드 도구
- **wrangler**: ^4.4.0 - Cloudflare CLI
- **@hono/vite-dev-server**: ^0.18.2 - 개발 서버

## 🎨 UI 라이브러리
- **TailwindCSS**: CDN을 통한 스타일링
- **Font Awesome**: 아이콘 라이브러리

## ⚡ 빠른 시작

1. **웹 애플리케이션 접속**
   ```
   https://3000-i56x5nh4xinmzp74cqlq8-5185f4aa.sandbox.novita.ai
   ```

2. **문단 입력 및 프롬프트 생성**
   - 문단을 한 줄에 하나씩 입력
   - "프롬프트 생성" 버튼 클릭

3. **이미지 생성**
   - GenSpark Image Designer 열기
   - 프롬프트 복사하여 붙여넣기
   - Nano Banana Pro 모델 선택
   - 이미지 생성

## 💾 데이터 저장

생성된 프롬프트는 JSON 형식으로 다운로드할 수 있습니다:

```json
[
  {
    "index": 1,
    "paragraph": "1974년, 미국 한 대학교의...",
    "estimatedDuration": 5,
    "prompt": "Style: Digital illustration...",
    "outputFilename": "youtube_bg_01.png"
  }
]
```

## 🎯 다음 단계

이 도구는 **프롬프트 생성**에 특화되어 있습니다. 실제 이미지 생성을 위해서는:

1. **GenSpark Image Designer 사용** (추천)
   - 웹 인터페이스에서 간편하게 사용
   - Nano Banana Pro 모델 지원
   - 고품질 이미지 생성

2. **자동화 구현** (선택사항)
   - GenSpark API 연동
   - 배치 이미지 생성 스크립트 작성
   - 워크플로우 자동화

## 📝 주의사항

- 프롬프트는 **Nano Banana Pro** 모델에 최적화되어 있습니다
- 참고 이미지 스타일을 기반으로 생성됩니다
- 16:9 비율로 YouTube에 최적화되어 있습니다
- 한국어 텍스트 내용이 자동으로 포함됩니다
