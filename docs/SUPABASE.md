# Supabase 연결

프로젝트: bestmember-and-firstday (서울), ref: lwijnqsiimypemwzyyyw.

사이트별 테이블은 bestmember_records / bestfirstday_records입니다. object_key는 기존 자료의 식별 경로이고 data는 원본 JSON입니다. 기본 키로 중복을 방지합니다. RLS가 활성화돼 있고 anon/authenticated의 직접 조회와 쓰기는 허용하지 않습니다.

사이트 서버는 supabase-storage.js를 통해 인증된 Edge Function site-data에 접근합니다. Edge Function은 플랫폼 JWT 검증(verify_jwt=true)과 사이트별 256비트 임의 토큰의 SHA-256 검증을 모두 수행합니다. DB 접근 키는 Supabase 내장 환경변수에서만 읽습니다. 함수의 EXPECTED 값은 인증 토큰 자체가 아닌 해시입니다.

실제 토큰은 Sites 서버의 SUPABASE_SITE_TOKEN 비밀 환경변수에만 설정합니다. 원문 토큰은 프런트엔드나 GitHub에 넣지 마세요. 새 환경에서는 새 토큰을 만들고 함수의 해당 해시와 서버 비밀 환경변수를 함께 설정해야 합니다. 다른 사이트 토큰으로 다른 테이블을 읽을 수 없게 분리합니다.

SUPABASE_DATA_URL과 SUPABASE_ANON_JWT도 서버 환경에 설정해야 합니다. 현재 Edge Function은 플랫폼 JWT 검증을 유지하기 때문에 유효한 기존 anon JWT를 Authorization 헤더로 사용합니다. 사이트별 토큰이 추가로 필요하므로 공개 키만으로 자료에 접근할 수 없습니다.

기존 R2 BUCKET 바인딩은 보존합니다. 첫 관리자 목록 조회 시 원본 기록을 누락 없이 복사하고 migration/r2-v1 완료 표시를 저장합니다. 복사는 이미 존재하는 Supabase 레코드를 덮어쓰지 않고 R2를 삭제하지 않습니다. 전환 이후 새 기록은 Supabase에 저장됩니다. 이전 완료를 확인하기 전에는 기존 BUCKET을 제거하지 마세요.

기존 Sites 로그인과 사장님 전용 서버 권한 검사는 그대로 유지합니다. Supabase Auth로 로그인 체계를 바꾼 것은 아닙니다. 테이블 설정과 함수 소스 업로드만으로 GitHub 자동 배포가 설정되는 것도 아닙니다.

schema.sql은 처음 설치할 때의 스키마 기록입니다. 이미 운영 중인 프로젝트에 중복 실행하지 마세요. 변경 시에는 기존 자료를 보존하는 별도 migration을 작성하세요.
