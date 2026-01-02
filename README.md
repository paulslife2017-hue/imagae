# AI 스토리 영상 생성기

## 🎯 프로젝트 개요
- **이름**: AI 스토리 영상 생성기
- **목표**: 스토리를 분석하고 자동으로 씬을 나누고 이미지를 생성하여 YouTube 영상 제작을 돕는 도구
- **상태**: ✅ 활성화

## ✨ 주요 기능

### ✅ 완료된 기능
1. **4단계 워크플로우**
   - 1단계: 스토리 입력 (글자 수 카운터 포함)
   - 2단계: AI 씬 분석 (진행 상황 실시간 표시)
   - 3단계: 이미지 생성 (전체 진행률 및 개별 씬 진행 상황)
   - 4단계: 완료 및 편집

2. **씬 분석**
   - Gemini AI를 사용한 자동 씬 분할
   - 각 씬은 4~10초 길이로 자연스럽게 분할
   - 시청자가 지루하지 않도록 최적화된 길이
   - 시각적 요소 자동 추출

3. **이미지 생성 및 편집**
   - 각 씬별 이미지 자동 생성
   - 실시간 생성 진행 상황 표시
   - 생성된 이미지 미리보기
   - 개별 이미지 편집 모달
   - 씬 설명, 시각 요소, 지속 시간 수정
   - 이미지 재생성 기능

4. **다운로드 및 내보내기**
   - 개별 이미지 다운로드
   - 전체 이미지 ZIP 다운로드
   - JSON 프로젝트 파일 내보내기

5. **사용자 경험**
   - 진행 단계 시각화
   - 애니메이션 프로그레스 바
   - 호버 효과 및 전환 애니메이션
   - 반응형 디자인 (모바일/태블릿/데스크톱)

## 🌐 URL
**퍼블릭 URL**: https://3000-i56x5nh4xinmzp74cqlq8-5185f4aa.sandbox.novita.ai

## 📊 API 엔드포인트

### POST /api/analyze-scenes
스토리를 분석하여 씬 정보를 반환합니다.

**요청**:
```json
{
  "story": "스토리 텍스트"
}
```

**응답**:
```json
{
  "success": true,
  "scenes": [
    {
      "index": 1,
      "description": "씬 설명",
      "visualElements": "시각적 요소",
      "duration": 6,
      "startTime": 0,
      "endTime": 6
    }
  ],
  "totalDuration": 6
}
```

### POST /api/generate-image
씬 정보를 기반으로 이미지를 생성합니다.

**요청**:
```json
{
  "scene": {
    "description": "씬 설명",
    "visualElements": "시각적 요소",
    "duration": 6
  },
  "fullStory": "전체 스토리",
  "sceneIndex": 0,
  "totalScenes": 5
}
```

**응답**:
```json
{
  "success": true,
  "imageUrl": "data:image/svg+xml;base64,..."
}
```

## 📋 사용 방법

### 간단 4단계
1. **스토리 입력**: 텍스트 영역에 YouTube 영상의 전체 스토리 입력 (최소 50자)
2. **AI 분석**: "AI 씬 분석 시작" 버튼 클릭하여 자동 씬 분할
3. **이미지 생성**: "이미지 생성 시작" 버튼 클릭하여 모든 씬의 이미지 생성
4. **편집 및 다운로드**: 각 이미지를 클릭하여 편집하거나 다운로드

### 이미지 편집
- 생성된 이미지에 마우스를 올리면 "편집" 버튼 표시
- 편집 버튼 클릭 시 모달에서:
  - 씬 설명 수정
  - 시각적 요소 수정
  - 지속 시간 조정 (4-10초)
  - 이미지 재생성 (약 2-3분 소요)

## 🛠️ 기술 스택
- **Backend**: Hono + TypeScript
- **Frontend**: Vanilla JavaScript + TailwindCSS + Axios
- **AI**: Google Gemini 2.0 Flash
- **배포**: Cloudflare Pages (wrangler)
- **개발 서버**: PM2

## 📦 데이터 구조

### Scene 객체
```typescript
{
  index: number,           // 씬 번호 (1부터 시작)
  description: string,     // 씬 설명
  visualElements: string,  // 시각적 요소
  duration: number,        // 지속 시간 (초)
  startTime: number,       // 시작 시간 (초)
  endTime: number          // 종료 시간 (초)
}
```

### Generated Image 객체
```typescript
{
  index: number,       // 씬 인덱스 (0부터 시작)
  scene: Scene,        // 씬 정보
  imageUrl: string     // 이미지 URL (data URI or blob URL)
}
```

## 💻 로컬 개발

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.dev.vars 파일)
GOOGLE_AI_API_KEY=your_api_key_here

# 빌드
npm run build

# 포트 정리
npm run clean-port

# PM2로 서버 시작
pm2 start ecosystem.config.cjs

# 서버 확인
npm run test
```

## 🔧 개발 명령어

```bash
# 서버 상태 확인
pm2 list

# 로그 확인 (논블로킹)
pm2 logs webapp --nostream

# 서버 재시작
fuser -k 3000/tcp 2>/dev/null || true
pm2 restart webapp

# 빌드 및 재시작
npm run build && pm2 restart webapp
```

## 🚧 다음 단계

### 🔄 진행 중
- [ ] 실제 AI 이미지 생성 모델 통합 (Gemini Imagen, DALL-E 등)
- [ ] 생성된 이미지를 서버에 저장 (Cloudflare R2)

### 📅 예정
- [ ] 썸네일 생성 및 추천
- [ ] YouTube 제목 자동 생성 및 추천
- [ ] 프로젝트 저장 및 불러오기
- [ ] 이미지 일괄 편집 기능
- [ ] 영상 편집 도구 연동 (타임라인 생성)
- [ ] 음성 내레이션 추가
- [ ] 배경 음악 추천

## 🎨 디자인 특징

### 색상 팔레트
- Primary: Blue (#4F46E5) → Purple (#7C3AED)
- Success: Green (#059669)
- Warning: Yellow (#F59E0B)
- Error: Red (#DC2626)
- Background: Gradient (Slate → Blue → Purple)

### 애니메이션
- 프로그레스 바: 그라디언트 애니메이션
- 카드 호버: 약간의 상승 효과
- 이미지 호버: 확대 효과 + 편집 오버레이
- 펄스 도트: 2초 주기로 반짝임

## 🔑 환경 변수

### .dev.vars (로컬 개발)
```bash
GOOGLE_AI_API_KEY=your_api_key_here
```

### Cloudflare Pages (프로덕션)
```bash
wrangler pages secret put GOOGLE_AI_API_KEY --project-name webapp
```

## 📝 최근 변경사항
- **2026-01-02**: 완전한 리뉴얼
  - 4단계 워크플로우 구현
  - 실시간 진행 상황 표시
  - 이미지 편집 모달 추가
  - 개별 이미지 재생성 기능
  - 씬 길이 4-10초로 조정
  - 반응형 디자인 개선
  - 애니메이션 효과 추가

## 🐛 알려진 이슈
- 현재 placeholder SVG 이미지를 사용 중 (실제 AI 이미지 생성 모델 통합 필요)
- 이미지 재생성 시 실제로는 같은 placeholder가 반환됨
