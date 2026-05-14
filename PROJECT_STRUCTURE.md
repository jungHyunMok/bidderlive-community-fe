# BidderLive Community Frontend - 프로젝트 구조

## 개요

비더라이브 커뮤니티 프론트엔드 프로젝트로, **Vue 3 + Vite** 기반의 SPA 애플리케이션입니다.
일반 사용자(컬렉터/딜러)와 운영자(관리자/스태프)가 동일한 URL로 접속하며, 로그인 시 역할에 따라 다른 화면으로 라우팅됩니다.

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Vue | ^3.5.27 |
| 라우터 | Vue Router | ^4.6.4 |
| 빌드 도구 | Vite | ^7.3.1 |
| 개발 도구 | vite-plugin-vue-devtools | ^8.0.5 |
| Node.js | - | ^20.19.0 \|\| >=22.12.0 |

## 디렉토리 구조

```
bidderlive-community-fe/
├── index.html                  # Vite 진입점 HTML
├── package.json                # 프로젝트 메타 & 의존성
├── vite.config.js              # Vite 설정 (프록시, 플러그인)
├── jsconfig.json               # JS 경로 별칭 설정
│
├── public/                     # 정적 파일 (빌드 시 그대로 복사)
│   ├── favicon.ico             # 파비콘
│   ├── bidderlive-logo.png     # 비더라이브 로고
│   ├── user.html               # 일반 사용자 커뮤니티 (iframe용 SPA)
│   └── admin.html              # 운영자 콘솔 (iframe용 SPA)
│
├── src/                        # 소스 코드
│   ├── main.js                 # Vue 앱 진입점
│   ├── App.vue                 # 루트 컴포넌트 (<router-view />)
│   │
│   ├── assets/                 # 스타일
│   │   ├── main.css            # 메인 스타일시트
│   │   └── base.css            # 기본 스타일
│   │
│   ├── router/
│   │   └── index.js            # 라우터 설정 & 네비게이션 가드
│   │
│   ├── views/                  # 페이지 컴포넌트
│   │   ├── LoginView.vue       # 로그인/회원가입 페이지
│   │   ├── UserView.vue        # 일반 사용자 페이지 (iframe → user.html)
│   │   └── AdminView.vue       # 운영자 페이지 (iframe → admin.html)
│   │
│   └── components/             # 공통 컴포넌트 (Vue 초기 템플릿)
│       ├── HelloWorld.vue
│       ├── TheWelcome.vue
│       ├── WelcomeItem.vue
│       └── icons/              # 아이콘 컴포넌트
│           ├── IconCommunity.vue
│           ├── IconDocumentation.vue
│           ├── IconEcosystem.vue
│           ├── IconSupport.vue
│           └── IconTooling.vue
│
└── dist/                       # 빌드 산출물
```

## 라우팅 구조

| 경로 | 컴포넌트 | 설명 | 접근 조건 |
|------|----------|------|-----------|
| `/` | `LoginView.vue` | 로그인/회원가입 | 게스트만 |
| `/user` | `UserView.vue` | 일반 사용자 커뮤니티 | 인증 필요 (role: user) |
| `/admin` | `AdminView.vue` | 운영자 콘솔 | 인증 필요 (role: admin) |

### 네비게이션 가드

- **미인증 사용자** → `/` (로그인 페이지)로 리다이렉트
- **역할 불일치** → 사용자의 실제 역할에 맞는 페이지로 리다이렉트
- 인증 정보는 `sessionStorage`의 `bidderlive-auth` 키에 JSON으로 저장

## 인증 흐름

1. 사용자가 `/`에서 접속 유형(일반/운영자) 선택 후 이메일·비밀번호 입력
2. `POST /api/auth/login`으로 로그인 요청
3. 응답에서 `accessToken`, `refreshToken`, 사용자 정보를 `sessionStorage`에 저장
4. 역할에 따라 `/user` 또는 `/admin`으로 라우팅
5. 각 View는 **iframe**을 통해 `public/user.html` 또는 `public/admin.html`을 로드
6. `postMessage` API로 Vue 앱 → iframe 간 인증 정보 전달

### postMessage 프로토콜

| 메시지 타입 | 방향 | 설명 |
|------------|------|------|
| `REQUEST_USER_AUTH` | iframe → Vue | 사용자 인증 정보 요청 |
| `USER_AUTH` | Vue → iframe | 사용자 인증 정보 전달 |
| `USER_LOGOUT` | iframe → Vue | 사용자 로그아웃 |
| `REQUEST_ADMIN_AUTH` | iframe → Vue | 관리자 인증 정보 요청 |
| `ADMIN_AUTH` | Vue → iframe | 관리자 인증 정보 전달 |
| `ADMIN_LOGOUT` | iframe → Vue | 관리자 로그아웃 |

## 회원가입

- 가입 유형: **BUYER**(구매자/컬렉터), **SELLER**(판매자/딜러)
- SELLER 선택 시 업체명, 사업자번호 추가 입력
- `POST /api/auth/register`로 회원가입 요청

## 개발 서버 설정

```js
// vite.config.js
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8082',  // 백엔드 API 서버
      changeOrigin: true,
    },
  },
}
```

- 개발 서버: `http://localhost:5173`
- API 프록시: `/api/*` 요청은 `http://localhost:8082`로 프록시

## 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 아키텍처 특징

- **하이브리드 SPA 구조**: Vue Router로 라우팅하되, 실제 사용자/관리자 UI는 `public/` 내의 독립 HTML 파일을 iframe으로 로드
- **역할 기반 접근 제어**: 로그인 시 사용자 역할(ADMIN/STAFF → admin, BUYER/SELLER → user)에 따라 자동 라우팅
- **postMessage 기반 통신**: Vue 앱과 iframe 간 인증 정보를 `window.postMessage`로 교환
- **세션 스토리지 인증**: JWT 토큰 및 사용자 정보를 `sessionStorage`에 저장 (탭 단위 세션)
