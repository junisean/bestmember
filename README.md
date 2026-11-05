# 외식업 채용 설문

운영 사이트: https://table-team-survey-1105.junisean.chatgpt.site/

단축 주소: https://is.gd/bestmember

## 기능

인재상 30개·주관식 900문항, 최대 3개 인재상 전체에서 기본 질문 10개 선택, 직접 질문 추가, 지원자 전용 링크, 이름·생년월일·전화번호와 답변 제출, 사장님 전용 목록과 미확인·확인 처리.

## 빌드

Node.js 22 이상에서 별도 패키지 설치 없이 실행합니다.

```sh
npm run check
npm run build
```

빌드 결과는 `dist/server/index.js`와 `dist/.openai/hosting.json`입니다. 서버 API를 사용하므로 GitHub Pages 같은 정적 호스팅만으로는 서버 저장·관리자 조회가 작동하지 않습니다.

## 구성

- `worker/index.js`: 요청 처리, 서버 입력 검증, 관리자 화면.
- `worker/content.js`: 전체 제작·직원/지원자 화면을 포함한 HTML과 900문항 데이터.
- `build.mjs`: 의존성 없는 빌드.
- `.openai/hosting.json`: 기존 Sites 프로젝트와 BUCKET 바인딩.
- `docs/`: 기능과 관련 자료.

## 실행 환경과 배포

기존 운영 환경은 ChatGPT Sites의 Cloudflare Worker와 R2 저장소입니다. `BUCKET` R2 바인딩을 연결해야 합니다. 배포는 Sites의 소스 동기화·빌드 아카이브·버전 게시 절차로 진행합니다. 이 GitHub 저장소 업로드 자체는 운영 사이트를 재배포하지 않습니다.

다른 프로젝트에 배포할 때 `.openai/hosting.json`의 프로젝트 ID를 새 프로젝트의 실제 ID로 바꾸고 저장소를 별도로 연결하세요. 기존 R2 기록은 이 저장소에 들어 있지 않습니다.

## 관리자 권한

관리 화면은 `/admin`입니다. 현재 관리자 이메일은 `junisean@naver.com`이며 서버의 관리자 검사 함수에서 확인합니다. Sites가 보증하는 `oai-authenticated-user-id`, `oai-authenticated-user-email` 헤더를 사용합니다.

일반 Worker로 옮길 경우 이 헤더를 클라이언트가 임의로 보낼 수 있는 상태로 신뢰하면 안 됩니다. 먼저 신뢰 가능한 인증 계층을 구현하고 관리자 검사와 로그인 경로를 연결해야 합니다. 프런트엔드에서 관리 버튼만 숨기는 방식으로 대체하지 마세요.

## API

```text
POST /api/submissions
GET /api/submissions
GET /api/submissions/summary
PATCH /api/submissions/{id}
GET /admin
```

제출·확인 쓰기는 동일 출처와 입력을 검증하며 조회·관리 작업은 서버에서 관리자 권한을 확인합니다. 실제 지원자와 직원의 기록, 비밀 키, 로컬 인증 정보는 포함하지 않았습니다.
