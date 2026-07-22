# 소금빵 카페 베통 — 오늘의 주문

당일 주문/픽업을 위한 베이커리 카페 웹앱. 결제, 비밀번호 찾기/소셜 로그인은 범위 밖.

## 기술 스택

- **React 19** + **React Router 7** (SPA, 클라이언트 사이드 라우팅)
- **Vite 8** — 개발 서버 / 빌드
- **Tailwind CSS 4** + **shadcn** 컴포넌트 (`src/components/ui/*`)
- **Supabase** — Auth(이메일/비밀번호) + Postgres + RLS
- 폰트: **Inter Variable**(영문) + **Pretendard Variable**(한글), `@fontsource-variable/inter` / `pretendard` 패키지로 로컬 번들링

## 실행 방법

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

`.env`에 Supabase 프로젝트 키가 필요합니다.

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## 라우트 구성 (`src/App.jsx`)

| 경로 | 파일 | 설명 |
|---|---|---|
| `/` | `src/pages/OrderPage.jsx` | 메뉴 목록 + 주문서(장바구니, 픽업 시간). 조회는 누구나, 주문은 로그인 필요 |
| `/auth` | `src/pages/AuthPage.jsx` | 로그인/회원가입 (shadcn `Tabs`) |
| `/my` | `src/pages/MyOrdersPage.jsx` | 로그인한 손님 본인 주문만 (접수/완료 탭) |
| `/admin` | `src/pages/AdminPage.jsx` | 사장 전용 — `[주문 관리]`(전체 주문 조회/완료 처리/삭제) / `[메뉴 관리]`(메뉴 등록·수정·삭제·품절 토글) 탭 |

## 인증 / 권한

- `src/context/AuthContext.jsx` — `supabase.auth.getSession()` + `onAuthStateChange`로 세션 상태를 전역 제공하는 `AuthProvider`, `useAuth()` 훅
- 역할(`profiles.role`, 기본값 `customer`)은 Supabase에서 수동으로 `owner`로 지정 — 앱에 "사장으로 가입" 기능 없음
- **권한 경계는 항상 Supabase RLS**이며, 화면 단의 role 체크(`AdminPage.jsx`의 "권한이 없습니다" 분기 등)는 UX 편의일 뿐 보안 장치가 아님
  - `orders` SELECT: 손님은 자신의 행만, 사장은 전체
  - `orders` INSERT: `WITH CHECK (user_id = auth.uid())`
  - `orders` UPDATE(상태 변경) / DELETE: 사장만 — 손님은 자신의 주문도 수정·취소 불가
  - `menu` SELECT: 공개(익명 포함 누구나) / INSERT·UPDATE·DELETE: 사장만

## 데이터 모델

- **메뉴 (`menu` 테이블, Supabase)**: `name`, `price`, `description`, `is_sold_out`(기본값 false), `created_at`. 조회는 누구나, 등록/수정/삭제는 `/admin`의 `[메뉴 관리]` 탭에서 사장만. 상품 이미지는 DB 컬럼이 아니라 `src/data/menuImages.js`에서 메뉴 이름으로 매핑(기존 13종만 해당, 신규 등록 메뉴는 이미지 없음)
- **주문 (`orders` 테이블, Supabase)**: `user_id`, `pickup_time`, `order_text`(비정규화 문자열, 예: `"크루아상 x2, 쑥라떼 x1"`), `total_amount`, `status`(`접수` → `완료`), `created_at`

## 주요 화면 동작

- **OrderPage** — 메뉴 카드에서 담기 → 로컬 `cart` 상태(모바일은 하단 시트, 데스크탑은 사이드 패널)로 관리, 주문 시 `order_text`를 조립해 `orders`에 INSERT. 비로그인 시 "로그인하고 주문하기" 버튼으로 `/auth` 유도
- **MyOrdersPage** — 본인 주문을 `접수`/`완료` 탭으로 분리 표시, `접수` 상태 주문에 한해 픽업 희망 시간 수정 가능(삭제/취소 기능 없음 — PRD 정책)
- **AdminPage** — role이 `owner`가 아니면 "권한이 없습니다" 표시 후 1.5초 뒤 `/`로 리다이렉트(UX일 뿐, 실제 차단은 RLS). `[주문 관리]` 탭에서 전체 주문 완료 처리·삭제, `[메뉴 관리]` 탭에서 메뉴 등록/인라인 수정/삭제/품절 토글 가능
- **Header** — 로그인 상태/역할에 따라 로그인 버튼 또는 (내 주문 / 회원 주문 관리 / 로그아웃) 버튼 노출

## UI 컴포넌트

`src/components/ui/*`는 shadcn 기반 프리미티브(`button`, `card`, `dialog`, `input`, `label`, `table`, `tabs`, `badge`). `src/lib/utils.js`의 `cn()`으로 클래스명 병합.
