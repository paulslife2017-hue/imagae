# YouTube 이미지 생성기 (단순 버전)

## 🎯 프로젝트 개요
- **이름**: YouTube 이미지 생성기
- **목표**: YouTube 영상을 위한 배경 이미지를 생성하기 위한 씬 분석
- **상태**: ✅ 기본 버전 작동 중

## ✨ 현재 기능

### ✅ 작동하는 기능
1. **스토리 입력**: 텍스트 입력란에 스토리 입력
2. **씬 분석**: 버튼 클릭으로 스토리 분석
3. **결과 표시**: 분석된 씬 정보 표시
4. **실시간 피드백**: 로딩 상태 표시

## 🌐 URL
**퍼블릭 URL**: https://3000-i56x5nh4xinmzp74cqlq8-5185f4aa.sandbox.novita.ai

## 📋 사용 방법

### 간단 3단계
1. **스토리 입력**: 텍스트 영역에 스토리 입력
2. **버튼 클릭**: "씬 분석 시작" 버튼 클릭
3. **결과 확인**: 분석 결과가 화면에 표시됨

## 🛠️ 기술 스택
- **Backend**: Hono + TypeScript
- **Frontend**: Vanilla JavaScript + TailwindCSS
- **배포**: Node.js + PM2

## 💻 로컬 개발

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# PM2로 서버 시작
pm2 start server.js --name webapp

# 서버 확인
curl http://localhost:3000
```

## 🔧 개발 명령어

```bash
# 서버 상태 확인
pm2 list

# 로그 확인
pm2 logs webapp --nostream

# 서버 재시작
pm2 restart webapp

# 빌드 및 재시작
npm run build && pm2 restart webapp
```

## 📊 API 엔드포인트

### POST /api/analyze
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
      "description": "스토리 텍스트",
      "visualElements": "시각적 요소 설명",
      "duration": 5,
      "startTime": 0,
      "endTime": 5
    }
  ],
  "totalDuration": 5
}
```

## 🐛 트러블슈팅

### 버튼이 안 눌러질 때
1. **강력 새로고침**: Ctrl+Shift+R (Windows) 또는 Cmd+Shift+R (Mac)
2. **캐시 삭제**: 브라우저 설정에서 캐시 삭제
3. **시크릿 모드**: 시크릿 모드로 열어보기
4. **콘솔 확인**: F12 → Console 탭에서 오류 확인

### 개발자 도구로 확인
F12를 누르고 Console 탭에서 다음 메시지를 확인하세요:
```
페이지 로드됨
버튼: <button...>
입력: <textarea...>
이벤트 리스너 등록 완료
```

버튼 클릭 시:
```
버튼 클릭됨!
스토리: [입력된 텍스트]
API 호출 시작...
응답 상태: 200
응답 데이터: {...}
```

## 🚀 다음 단계

이 단순 버전이 정상 작동하면 다음 기능을 추가할 예정:
- [ ] AI 기반 씬 분석
- [ ] 이미지 생성 기능
- [ ] 제목 추천
- [ ] 썸네일 생성
- [ ] 일괄 다운로드

## 📝 최근 변경사항
- **2026-01-02**: 전체 코드를 단순하게 재작성
  - 복잡한 기능 모두 제거
  - 기본 버튼 클릭 및 API 호출만 구현
  - addEventListener 방식으로 변경
  - 파일 크기: 74KB → 28KB
