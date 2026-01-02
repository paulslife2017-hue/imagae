# YouTube 배경화면 이미지 생성기

## 프로젝트 개요
- **이름**: YouTube 배경화면 이미지 생성기
- **목표**: YouTube 영상을 위한 배경 이미지를 AI로 자동 생성
- **주요 기능**: 
  - AI 기반 스토리 씬 자동 분석 및 분할
  - Google Gemini Nano Banana Pro를 사용한 고품질 이미지 생성
  - 개별 이미지 재생성 기능
  - 모든 이미지 일괄 다운로드 (ZIP)
  - AI 기반 YouTube 제목 추천
  - YouTube 썸네일 자동 생성

## 현재 완료된 기능

### ✅ 1. AI 씬 분석 및 분할
- 사용자가 입력한 스토리를 자동으로 분석
- 의미 있는 장면 전환 지점을 감지
- 각 씬의 지속 시간과 시각적 요소 자동 추출
- 씬 타입 분류 (문제 제기, 핵심 깨달음, 해결책 등)

### ✅ 2. 이미지 자동 생성
- Google Gemini 3 Pro Image API 사용
- 일관된 스타일의 고품질 이미지 생성
- 16:9 비율로 YouTube에 최적화
- 실시간 생성 진행 상황 표시

### ✅ 3. 개별 이미지 관리
- 각 이미지 개별 다운로드
- 마음에 들지 않는 이미지 재생성 기능
- 이미지 미리보기

### ✅ 4. 일괄 다운로드
- 모든 생성된 이미지를 ZIP 파일로 한 번에 다운로드
- 파일명 자동 정렬 (scene_01.png, scene_02.png, ...)
- JSZip 라이브러리 사용

### ✅ 5. AI 제목 추천
- 스토리 내용 기반으로 YouTube 제목 5개 추천
- 클릭을 유도하는 매력적인 제목 생성
- 한 번의 클릭으로 제목 적용

### ✅ 6. 썸네일 생성
- 영상 제목을 기반으로 눈에 띄는 썸네일 생성
- 전문적이고 매력적인 디자인
- 16:9 비율로 YouTube 표준 준수

## 기능별 URI 및 API 엔드포인트

### 프론트엔드
- **메인 페이지**: `GET /` - 전체 UI 인터페이스

### API 엔드포인트
1. **씬 분석**: `POST /api/analyze-scenes`
   - Request: `{ story: string }`
   - Response: `{ success: boolean, scenes: Scene[], totalDuration: number }`

2. **이미지 생성**: `POST /api/generate-scene-image`
   - Request: `{ scene: Scene, prompt: string, index: number }`
   - Response: `{ success: boolean, imageUrl: string, index: number }`

3. **제목 추천**: `POST /api/recommend-title`
   - Request: `{ story: string }`
   - Response: `{ success: boolean, titles: string[] }`

## 데이터 구조

### Scene 객체
```typescript
{
  index: number;          // 씬 번호
  description: string;    // 씬 설명
  visualElements: string; // 시각적 요소
  duration: number;       // 지속 시간 (초)
  startTime: number;      // 시작 시간 (초)
  endTime: number;        // 종료 시간 (초)
  sceneType: string;      // 씬 타입
}
```

### GeneratedImage 객체
```typescript
{
  index: number;    // 씬 번호
  scene: Scene;     // 씬 정보
  imageUrl: string; // 생성된 이미지 Data URL
}
```

## 사용 방법

### 1. 기본 워크플로우
1. **스토리 입력**: 텍스트 영역에 YouTube 영상의 전체 스토리를 입력
2. **씬 분석**: "AI 씬 분석 & 이미지 생성" 버튼 클릭
3. **결과 확인**: AI가 자동으로 씬을 분할하고 분석한 결과 확인
4. **이미지 생성**: "이미지 생성 시작" 버튼으로 모든 씬의 이미지 생성
5. **개별 조정**: 마음에 들지 않는 이미지는 "재생성" 버튼으로 다시 생성
6. **다운로드**: "전체 다운로드 (ZIP)" 버튼으로 모든 이미지 저장

### 2. 제목 추천 사용
1. 스토리 텍스트 입력
2. "제목 추천" 버튼 클릭
3. AI가 추천한 5개 제목 중 선택
4. 클릭하면 자동으로 제목 입력란에 적용

### 3. 썸네일 생성
1. 모든 씬 이미지 생성 완료 후
2. "썸네일 생성하기" 버튼 클릭
3. 영상 제목 기반의 매력적인 썸네일 생성
4. "썸네일 다운로드" 버튼으로 저장

## 환경 변수 설정

### .dev.vars 파일
```env
# Google AI API Key for Nano Banana Pro
GOOGLE_AI_API_KEY=your_api_key_here
```

### 로컬 개발
```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 개발 서버 시작
npm run start
```

## 배포 상태
- **플랫폼**: Node.js + Hono Framework
- **상태**: ✅ Active
- **기술 스택**: 
  - Backend: Hono + TypeScript
  - Frontend: Vanilla JavaScript + TailwindCSS
  - AI: Google Gemini 3 Pro Image API
- **퍼블릭 URL**: https://3000-i56x5nh4xinmzp74cqlq8-5185f4aa.sandbox.novita.ai
- **로컬 개발**: http://localhost:3000
- **마지막 업데이트**: 2026-01-02

## 아직 구현되지 않은 기능

### 향후 개선 사항
1. **이미지 편집 기능**
   - 생성된 이미지에 텍스트 오버레이 추가
   - 이미지 크롭 및 필터 적용

2. **프로젝트 저장/불러오기**
   - 진행 중인 프로젝트를 로컬 스토리지에 저장
   - 나중에 이어서 작업할 수 있는 기능

3. **다양한 스타일 템플릿**
   - 여러 시각적 스타일 중 선택 가능
   - 사용자 정의 스타일 가이드 업로드

4. **배치 처리 최적화**
   - 여러 이미지를 병렬로 생성하여 시간 단축
   - 생성 대기열 관리

5. **이미지 품질 설정**
   - 해상도 및 품질 옵션 선택
   - 파일 크기 최적화 옵션

## 권장되는 다음 개발 단계

1. **성능 최적화**
   - 이미지 생성 API 호출 캐싱
   - 병렬 처리로 생성 시간 단축

2. **사용자 경험 개선**
   - 진행 상황 퍼센티지 표시
   - 예상 완료 시간 계산 및 표시
   - 더 자세한 에러 메시지

3. **기능 확장**
   - 비디오 편집 소프트웨어용 메타데이터 내보내기
   - 타임라인 시각화 기능
   - 이미지 순서 드래그 앤 드롭

4. **클라우드 배포**
   - Cloudflare Pages로 프로덕션 배포
   - 환경 변수 보안 강화
   - CDN을 통한 글로벌 접근성 향상

## 기술적 특징

### 안전한 API 키 관리
- `.dev.vars` 파일로 로컬 환경 변수 관리
- `.gitignore`에 민감 정보 파일 추가
- 프로덕션에서는 환경 변수로 관리

### 응답성 있는 UI
- TailwindCSS로 모바일 친화적 디자인
- 실시간 진행 상황 업데이트
- 부드러운 애니메이션과 전환 효과

### 에러 핸들링
- API 실패 시 명확한 에러 메시지
- 재시도 기능으로 사용자 경험 개선
- 네트워크 오류에 대한 대응

## 라이선스
이 프로젝트는 개인 및 교육 목적으로 자유롭게 사용할 수 있습니다.
