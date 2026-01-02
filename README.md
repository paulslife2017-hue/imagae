# YouTube 배경화면 이미지 생성기

## 프로젝트 개요
- **이름**: YouTube 배경화면 이미지 생성기
- **목적**: 문단별로 일관된 스타일의 배경 이미지를 일괄 생성하여 YouTube 영상 제작을 간편하게
- **주요 기능**: 
  - 문단 텍스트 입력 (여러 줄 지원)
  - 참고 이미지 기반 스타일 매칭
  - Nano Banana Pro를 활용한 고품질 이미지 생성
  - 실시간 진행 상황 추적
  - 생성된 이미지 일괄 다운로드

## 🌐 URLs
- **프로덕션 (샌드박스)**: https://3000-i56x5nh4xinmzp74cqlq8-5185f4aa.sandbox.novita.ai
- **API 엔드포인트**: `/api/generate`

## 📊 완료된 기능
1. ✅ **문단 입력 시스템**
   - 여러 줄 텍스트 입력 지원
   - 각 줄이 개별 이미지로 생성
   - 예제 문단 제공

2. ✅ **참고 이미지 기능**
   - URL 기반 참고 이미지 입력
   - 실시간 이미지 미리보기
   - 스타일 일관성 유지

3. ✅ **진행 상황 추적**
   - 실시간 진행률 표시
   - 각 문단별 생성 상태 표시
   - 성공/실패 아이콘 표시

4. ✅ **이미지 생성 및 다운로드**
   - 문단 길이 기반 재생 시간 자동 추정 (3-10초)
   - 개별 이미지 다운로드
   - 전체 이미지 일괄 다운로드
   - 총 재생 시간 계산

## 📋 주요 기능 URI

### 메인 페이지
- **경로**: `/`
- **설명**: 메인 이미지 생성 인터페이스

### 이미지 생성 API
- **경로**: `/api/generate`
- **메소드**: POST
- **파라미터**:
  ```json
  {
    "paragraph": "생성할 이미지의 문단 텍스트",
    "index": 0,
    "referenceImage": "https://example.com/reference.jpg"
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "imageUrl": "생성된 이미지 URL",
    "prompt": "사용된 프롬프트",
    "estimatedDuration": 5,
    "note": "데모 모드 메시지"
  }
  ```

## 🎨 데이터 구조

### 이미지 스타일
- **스타일 기준**: 업로드된 참고 이미지 분석 결과
  - 디지털 일러스트레이션 (손그림 효과)
  - 따뜻한 색상 팔레트 (갈색, 베이지, 부드러운 블루)
  - 단순한 만화 스타일 캐릭터
  - 벽돌 배경 및 창문
  - 교육적이고 동기부여적인 분위기
  - 한국어 텍스트 자연스러운 통합

### 재생 시간 추정 로직
```javascript
if (textLength < 50) estimatedDuration = 3초
else if (textLength < 100) estimatedDuration = 5초
else if (textLength < 200) estimatedDuration = 7초
else estimatedDuration = 10초
```

## 🎯 미완성 기능

### 실제 이미지 생성 API 연동
현재는 **데모 모드**로 플레이스홀더 이미지를 반환합니다. 실제 기능 구현을 위해서는:

1. **GenSpark API 연동 필요**
   - `image_generation` 도구를 활용한 실제 이미지 생성
   - API 키 설정 필요
   - 외부 이미지 생성 서비스 API 호출

2. **구현 방법 (2가지 옵션)**:

   **옵션 A: 클라이언트 사이드 구현**
   ```javascript
   // 프론트엔드에서 직접 GenSpark API 호출
   const response = await fetch('GENSPARK_API_ENDPOINT', {
     method: 'POST',
     headers: { 
       'Authorization': 'Bearer YOUR_API_KEY',
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       model: 'nano-banana-pro',
       query: fullPrompt,
       image_urls: [referenceImage],
       aspect_ratio: '16:9'
     })
   })
   ```

   **옵션 B: 백엔드 프록시 구현**
   ```typescript
   // src/index.tsx의 /api/generate 엔드포인트에서
   app.post('/api/generate', async (c) => {
     // 외부 이미지 생성 API 호출
     const imageResponse = await fetch('IMAGE_GEN_API', {
       method: 'POST',
       body: JSON.stringify({ prompt: fullPrompt })
     })
     const { imageUrl } = await imageResponse.json()
     return c.json({ success: true, imageUrl })
   })
   ```

## 📝 사용 가이드

1. **참고 이미지 설정** (선택사항)
   - 원하는 스타일의 이미지 URL 입력
   - 기본값으로 예제 이미지가 설정되어 있음

2. **문단 입력**
   - 텍스트 영역에 문단을 한 줄에 하나씩 입력
   - 각 줄이 하나의 이미지로 생성됨
   - 예제 텍스트가 기본으로 제공됨

3. **일괄 생성 시작**
   - "일괄 생성 시작" 버튼 클릭
   - 진행 상황을 실시간으로 확인
   - 각 이미지 생성 완료 시 체크 표시

4. **이미지 다운로드**
   - 개별 다운로드: 각 이미지 카드의 "다운로드" 버튼
   - 전체 다운로드: "전체 다운로드" 버튼으로 모든 이미지 저장

## 🚀 배포 상태
- **플랫폼**: Cloudflare Pages (준비 완료)
- **현재 상태**: ✅ 샌드박스 환경에서 실행 중 (데모 모드)
- **기술 스택**: Hono + TypeScript + TailwindCSS + Nano Banana Pro (예정)
- **마지막 업데이트**: 2026-01-02

## 💡 추천 다음 단계

1. **GenSpark API 키 설정**
   - GenSpark API 키 발급
   - 환경 변수로 설정 (.dev.vars 또는 Cloudflare Secrets)

2. **실제 이미지 생성 API 연동**
   - `/api/generate` 엔드포인트에 실제 API 호출 로직 추가
   - Nano Banana Pro 모델 사용
   - 참고 이미지 스타일 매칭 구현

3. **성능 최적화**
   - 병렬 이미지 생성 (동시에 여러 이미지 생성)
   - 캐싱 전략 구현
   - 이미지 압축 최적화

4. **추가 기능 개발**
   - 이미지 편집 기능 (텍스트 추가, 필터 적용)
   - 프로젝트 저장/불러오기
   - 템플릿 라이브러리
   - 비디오로 자동 변환

5. **프로덕션 배포**
   - Cloudflare Pages에 배포
   - 커스텀 도메인 설정
   - 사용자 인증 시스템 (필요시)

## 🔧 개발 명령어

```bash
# 개발 서버 시작
npm run dev:sandbox

# 빌드
npm run build

# 포트 정리
npm run clean-port

# 테스트
npm run test

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
- **Axios**: HTTP 클라이언트
