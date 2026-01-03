# AI 스토리 영상 생성기 (나노바나나프로)

## 프로젝트 개요
- **이름**: AI 스토리 영상 생성기
- **목표**: 스토리를 입력하면 AI가 씬을 분석하고 나노바나나프로로 일러스트 생성
- **플랫폼**: Vercel (Node.js 환경)
- **이미지 생성**: 나노바나나프로 (Gemini 3 Pro Image)

## 주요 기능
- ✅ Gemini 2.0으로 스토리 씬 분석
- ✅ **나노바나나프로 (Gemini 3 Pro Image)로 한국어 일러스트 생성**
- ✅ Google AI API 키만으로 작동 (GenSpark API 불필요)
- ✅ 16:9 YouTube 영상용 이미지
- ✅ 중지 기능 (생성 중 중단 가능)
- ✅ 이미지 편집 및 재생성
- ✅ 일괄 다운로드 및 JSON 내보내기

## 기술 스택
- **Backend**: Hono (Node.js) on Vercel
- **Frontend**: Vanilla JS + TailwindCSS
- **AI**: 
  - Gemini 2.0 Flash (씬 분석)
  - **Gemini 3 Pro Image = 나노바나나프로** (이미지 생성)
- **Deployment**: Vercel

## 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:
- `GOOGLE_AI_API_KEY`: Google AI API 키 (씬 분석 + 나노바나나프로 이미지 생성)

**중요**: GenSpark API 키는 필요 없습니다! Google AI API 키만으로 나노바나나프로를 사용할 수 있습니다.

## 로컬 개발
```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
cp .env.example .env
# .env 파일에 GOOGLE_AI_API_KEY 입력

# 로컬 개발 서버 (Vercel Dev)
npm run dev
```

## Vercel 배포
```bash
# Vercel에 배포
npm run deploy

# 또는 Vercel CLI로 직접
npx vercel --prod
```

## 나노바나나프로 (Nano Banana Pro)
- **모델명**: `gemini-3-pro-image-preview`
- **제공**: Google AI / Gemini API
- **특징**: 
  - 한국어 텍스트 렌더링 우수
  - 이미지 생성 및 편집 가능
  - 16:9 비율 지원
  - Google AI API 키로 접근

## API 엔드포인트
- `POST /api/analyze-scenes` - 스토리 씬 분석 (Gemini 2.0 Flash)
- `POST /api/generate-image` - 나노바나나프로 이미지 생성 (Gemini 3 Pro Image)
- `GET /` - 메인 페이지

## 스타일 가이드
- 따뜻한 손그림 일러스트 스타일
- 색상: 갈색(#8B7355), 베이지(#D4A574), 블루(#6B9AC4)
- 배경: 붉은 벽돌 벽과 창문 (교실 분위기)
- 한글 텍스트 필수 포함 (상황 설명)

## 배포 상태
- **Platform**: Vercel
- **Status**: ✅ 준비 완료
- **Last Updated**: 2026-01-03

## 참고 자료
- [Gemini API - Image Generation](https://ai.google.dev/gemini-api/docs/image-generation)
- [Nano Banana Pro Documentation](https://ai.google.dev/gemini-api/docs/nanobanana)

## 라이선스
MIT
