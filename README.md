# YouTube 배경화면 이미지 생성기

## 프로젝트 개요
- **이름**: YouTube 배경화면 이미지 생성기
- **목적**: 스토리를 AI가 자동으로 씬 분석하여 Nano Banana Pro API로 이미지를 직접 생성
- **주요 기능**: 
  - **영상 제목 입력** 및 썸네일 자동 생성
  - 스토리 텍스트 입력
  - **AI 자동 씬 분석** (17개 씬으로 자동 분할, 각 4-5초)
  - **Nano Banana Pro API 직접 호출** (Google Gemini 3 Pro Image)
  - 자동 이미지 생성 (약 40-50분 소요)
  - **이미지 재생성 기능** (이상한 이미지 교체)
  - **썸네일 생성** (영상 제목 기반)
  - 실시간 생성 진행 상황 표시
  - 생성된 이미지 미리보기 및 다운로드

## 🌐 URLs
- **프로덕션 (샌드박스)**: https://3000-i56x5nh4xinmzp74cqlq8-5185f4aa.sandbox.novita.ai
- **GitHub 저장소**: https://github.com/paulslife2017-hue/imagae

## 📊 완료된 기능
1. ✅ **영상 제목 & 썸네일**
   - 영상 제목 입력 필드
   - 제목 기반 썸네일 자동 생성
   - 클릭 유도형 디자인 (click-worthy)
   - 썸네일 미리보기 및 다운로드

2. ✅ **AI 자동 씬 분석**
   - 스토리 내용 기반 키워드 감지
   - 자동으로 17개 씬으로 분할 (각 4-5초)
   - 씬 타입 자동 분류 (문제 제기, 해결책, 위로 등)
   - 총 재생 시간 자동 계산

3. ✅ **Nano Banana Pro API 통합**
   - Google Gemini 3 Pro Image Preview API 직접 호출
   - `gemini-3-pro-image-preview` 모델 사용
   - 16:9 비율 YouTube 최적화
   - Base64 이미지 직접 반환

4. ✅ **자동 이미지 생성**
   - 17개 씬을 순차적으로 자동 생성
   - 실시간 진행 상황 표시
   - 각 이미지당 2-3분 소요
   - 생성 완료 후 즉시 미리보기

5. ✅ **이미지 재생성 기능**
   - 각 씬 이미지에 "재생성" 버튼 추가
   - 이상한 이미지를 쉽게 교체
   - 개별 이미지만 다시 생성
   - 전체를 다시 생성할 필요 없음

6. ✅ **사용자 인터페이스**
   - 영상 제목 입력
   - 스토리 입력 영역
   - 씬 분석 결과 표시
   - 이미지 생성 진행 상황 추적
   - 생성된 이미지 그리드 뷰
   - 개별 이미지 다운로드 & 재생성 기능
   - 썸네일 생성 섹션

## 📋 사용 방법

### 1단계: 영상 제목 입력
```
가난에서 벗어나는 사람들의 비밀
```

### 2단계: 스토리 입력
웹 애플리케이션에 접속하여 전체 스토리를 입력합니다:
```
열심히 살고 있는데 항상 돈이 없는 현실. 남들보다 덜 노력하는 것도 아닌데 왜 늘 제자리인가. 
어릴 때부터 들어온 말들. "성실하면 잘 된다", "열심히 하면 보상받는다". 
하지만 문제는 개인이 아니라 구조였다. 대부분의 사람은 시간을 써서 돈을 벌고, 
일한 만큼 받고, 쉬면 수입이 멈춘다...
```

### 3단계: AI 씬 분석
"AI 씬 분석 & 이미지 생성" 버튼을 클릭하면:
- AI가 스토리를 자동으로 분석
- 의미 있는 장면 전환 지점 감지
- 17개 씬으로 자동 분할 (각 4-5초)
- 각 씬의 설명과 시각적 요소 생성

### 4단계: 이미지 생성 확인 및 시작
- 분석된 씬 목록 확인
- "이미지 생성 시작" 버튼 클릭
- **⚠️ 주의**: 총 17개 이미지, 약 40-50분 소요

### 5단계: 생성 완료 및 다운로드
- 실시간으로 각 이미지 생성 상황 확인
- 생성 완료 후 자동으로 미리보기 표시
- 개별 이미지 다운로드 가능
- **새 기능**: 이상한 이미지는 "재생성" 버튼으로 교체

### 6단계: 썸네일 생성
- 모든 씬 이미지 생성 완료 후
- "썸네일 생성하기" 버튼 클릭
- 영상 제목을 기반으로 클릭 유도형 썸네일 생성
- 약 2-3분 소요
- 썸네일 다운로드

## 🎨 기술 스택

### Backend
- **Hono**: 경량 웹 프레임워크
- **Cloudflare Workers**: 서버리스 배포
- **Google Gemini API**: Nano Banana Pro (gemini-3-pro-image-preview)

### Frontend
- **TailwindCSS**: UI 스타일링
- **Font Awesome**: 아이콘
- **Vanilla JavaScript**: 동적 인터랙션

### 이미지 생성
- **모델**: Nano Banana Pro (Gemini 3 Pro Image Preview)
- **API**: Google Generative Language API
- **비율**: 16:9 (YouTube 최적화)
- **스타일**: 디지털 일러스트레이션, 손그림 효과, 따뜻한 색감

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

## 🔧 환경 변수 설정

`.dev.vars` 파일에 다음 환경 변수를 설정해야 합니다:

```bash
# Google AI API Key for Nano Banana Pro
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**API 키 발급 방법:**
1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. 발급받은 API 키를 `.dev.vars` 파일에 추가

**⚠️ 중요**: `.dev.vars` 파일은 git에 커밋하지 마세요!

## 💡 씬 분석 예시

**입력 스토리:**
```
열심히 살고 있는데 항상 돈이 없는 현실. 남들보다 덜 노력하는 것도 아닌데...
```

**AI 자동 분석 결과 (17개 씬):**
1. **씬 1** (4초) - 문제 제기: 열심히 살고 있는데 항상 돈이 없는 현실
2. **씬 2** (4초) - 문제 제기: 남들보다 덜 노력하는 것도 아닌데 왜 늘 제자리인가
3. **씬 3** (4초) - 배경/가치관: 어릴 때부터 들어온 말들
4. **씬 4** (4초) - 배경/가치관: 많은 사람들이 참고 버티는 모습
5. **씬 5** (4초) - 핵심 문제: 개인이 아닌 구조의 문제
... (총 17개 씬)

**각 씬마다 자동으로:**
- 씬 설명 (description)
- 시각적 요소 (visualElements)
- 재생 시간 (duration)
- 타임라인 (startTime, endTime)
- 씬 타입 (sceneType)

## 🚀 배포 상태
- **플랫폼**: Cloudflare Pages (준비 완료)
- **현재 상태**: ✅ 샌드박스 환경에서 실행 중
- **기술 스택**: Hono + TypeScript + TailwindCSS + Google Gemini API
- **API 통합**: Nano Banana Pro (gemini-3-pro-image-preview)
- **마지막 업데이트**: 2026-01-02

## ⚠️ 주의사항

### 이미지 생성 시간
- **각 이미지**: 약 2-3분 소요
- **17개 전체**: 약 40-50분 소요
- **순차 생성**: 한 번에 하나씩 생성됨

### API 사용량
- Google AI Studio는 무료 tier에서 **분당 요청 제한**이 있습니다
- 대량 생성 시 429 에러 (Too Many Requests) 발생 가능
- 필요시 유료 플랜으로 업그레이드 권장

### 브라우저 제한
- 이미지 생성 중 **브라우저 탭을 닫지 마세요**
- 새로고침하면 진행 상황이 초기화됩니다
- Base64 이미지 데이터는 메모리에 저장됩니다

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

## 🌐 API
- **Google Generative Language API**: Nano Banana Pro 이미지 생성
- **모델**: gemini-3-pro-image-preview
- **엔드포인트**: https://generativelanguage.googleapis.com/v1beta/models/

## ⚡ 빠른 시작

1. **웹 애플리케이션 접속**
   ```
   https://3000-i56x5nh4xinmzp74cqlq8-5185f4aa.sandbox.novita.ai
   ```

2. **스토리 입력**
   - 전체 스토리를 텍스트 영역에 입력

3. **AI 씬 분석**
   - "AI 씬 분석 & 이미지 생성" 버튼 클릭
   - 17개 씬 자동 분석 (약 1-2초)

4. **이미지 생성**
   - "이미지 생성 시작" 버튼 클릭
   - ⏱️ 약 40-50분 대기
   - 실시간 진행 상황 확인

5. **다운로드**
   - 생성 완료 후 개별 이미지 다운로드
   - 파일명: scene_01.png ~ scene_17.png

## 💾 데이터 저장

생성된 이미지는 Base64 형식으로 브라우저 메모리에 저장되며, 다운로드 시 PNG 파일로 저장됩니다:

- **형식**: PNG (image/png)
- **비율**: 16:9 (YouTube 최적화)
- **씬 이미지**: scene_01.png ~ scene_17.png (17개)
- **썸네일**: thumbnail.png (1개)
- **총 이미지**: 18개 (17 씬 + 1 썸네일)
- **품질**: Nano Banana Pro 고품질

## 🎯 다음 단계

### 현재 기능
- ✅ 영상 제목 입력
- ✅ AI 자동 씬 분석
- ✅ Nano Banana Pro API 직접 통합
- ✅ 실시간 이미지 생성 (17개 씬)
- ✅ **이미지 재생성 기능** (이상한 이미지 교체)
- ✅ **썸네일 자동 생성** (제목 기반)
- ✅ 진행 상황 추적
- ✅ 개별 다운로드

### 향후 개선 가능 사항
- [ ] 병렬 이미지 생성 (여러 개 동시 생성)
- [ ] 생성된 이미지 서버 저장 (R2/KV)
- [ ] 스타일 커스터마이징 옵션
- [ ] 씬 편집 기능 (순서 변경, 추가, 삭제)
- [ ] 영상 자동 편집 통합
- [ ] 다양한 종횡비 지원 (1:1, 9:16 등)
- [ ] 이미지 일괄 다운로드 (ZIP 파일)

## 📝 주의사항

- **API 키 필수**: Google AI Studio에서 API 키 발급 필요
- **생성 시간**: 17개 이미지 생성에 약 40-50분 소요
- **브라우저 유지**: 생성 중 탭을 닫지 마세요
- **무료 제한**: Google AI의 무료 tier는 분당 요청 제한이 있습니다
- **이미지 품질**: Nano Banana Pro는 최고 품질의 이미지를 생성합니다
- **16:9 비율**: YouTube Shorts가 아닌 일반 YouTube 영상에 최적화
- **한국어 지원**: 프롬프트에 한국어 설명이 포함되어 시각적으로 표현됩니다
