# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repository is pre-implementation. It currently contains only:
- `PRD.md` — the full product spec (source of truth for scope, routes, data model, and permission rules)
- `index.html` — an empty HTML shell
- no `package.json`, no build tooling, no source tree yet

There are no build/lint/test commands to run yet because no framework has been scaffolded. When the project is scaffolded (React + Vite is implied by the `.jsx` paths and shadcn usage in `PRD.md`), add the actual commands here.

**Always read `PRD.md` before implementing anything** — it is the canonical spec, and the architecture notes below are just a summary of it.

## Product architecture (from PRD.md)

소금빵 카페 베통 "오늘의 주문" — a same-day order/pickup app for a bakery cafe. No payment, no menu-management UI, no password reset/social login — these are explicitly out of scope; don't add them.

**Stack implied by the spec:** React (route-based pages under `src/pages/*.jsx`), shadcn (`Tabs` for auth), Supabase (Auth + Postgres + RLS).

**Routes / pages:**
- `/` (`src/pages/OrderPage.jsx`) — public menu list + order form (cart, pickup time). Anyone can view; ordering requires login.
- `/auth` (`src/pages/AuthPage.jsx`) — login/signup via shadcn Tabs, email+password only.
- `/my` (`src/pages/MyOrdersPage.jsx`) — logged-in customer's own orders only.
- `/admin` (`src/pages/AdminPage.jsx`) — owner-only: full order table, mark complete, delete. Non-owner visitors get an "권한이 없습니다" message and redirect — this is a UX nicety only, **not** the security boundary (see below).

**Menu data is not in the database.** It lives in `src/data/menu.js` (array of id/name/price/description) and is hand-edited by the owner. There is intentionally no menu CRUD UI — don't build one.

**Order data (`orders` table):** user_id, pickup time, order text (denormalized, e.g. `"크루아상 x2, 쑥라떼 x1"`), total amount, status (default `"접수"`, transitions to `"완료"`), created_at.

## Permission model — the part that matters most

Two roles beyond anonymous visitors: **손님 (customer)** and **사장 (owner)**. Both sign up through the same flow; there is no "sign up as owner" button — an owner is designated out-of-band in Supabase after the fact.

Role is stored in a `profiles` table (`user_id`, `role`, default `"customer"`); the owner's row is flipped to `role = "owner"` manually via Supabase, not through any app screen.

**The enforcement boundary is RLS, never application code.** This is called out explicitly in the PRD because it's the easiest thing to get wrong:
- RLS policies must check `profiles.role`, never a hardcoded email or a frontend `if` check in `AdminPage.jsx`. A frontend-only gate is UX, not security — anyone can hit the Supabase API directly and bypass it.
- `orders` SELECT: customers see only rows where `user_id = auth.uid()`; owner sees all.
- `orders` INSERT: must have `WITH CHECK (user_id = auth.uid())` — a customer must not be able to create an order under someone else's `user_id`.
- `orders` UPDATE (status) / DELETE: owner only. Customers cannot edit or cancel their own orders (cancellation is a request to the owner, not a feature).

When touching auth, the `orders` table, or `AdminPage.jsx`, verify the actual RLS policies enforce the above — don't rely on the screen-level checks alone.

---

# CLAUDE.md (한국어)

이 파일은 이 저장소의 코드를 다룰 때 Claude Code(claude.ai/code)에게 제공하는 안내입니다.

## 프로젝트 현황

이 저장소는 아직 구현 이전 단계입니다. 현재 존재하는 것은:
- `PRD.md` — 전체 제품 스펙 (범위, 라우트, 데이터 모델, 권한 규칙의 기준 문서)
- `index.html` — 빈 HTML 셸
- `package.json`, 빌드 도구, 소스 트리는 아직 없음

아직 프레임워크가 세팅되지 않아 실행할 빌드/린트/테스트 명령이 없습니다. 프로젝트가 세팅되면(`PRD.md`의 `.jsx` 경로와 shadcn 사용으로 보아 React + Vite로 추정) 실제 명령어를 여기에 추가하세요.

**무엇이든 구현하기 전에 반드시 `PRD.md`를 먼저 읽으세요** — 이 문서가 기준 스펙이고, 아래 아키텍처 정리는 그 요약일 뿐입니다.

## 제품 아키텍처 (PRD.md 기준)

소금빵 카페 베통 "오늘의 주문" — 베이커리 카페의 당일 주문·픽업 앱입니다. 결제, 메뉴 관리 화면, 비밀번호 찾기/소셜 로그인은 명시적으로 범위 제외이므로 추가하지 마세요.

**스펙에서 암시하는 스택:** React (`src/pages/*.jsx` 아래 라우트 기반 페이지), shadcn (`Tabs`로 인증 화면 구성), Supabase (Auth + Postgres + RLS).

**라우트 / 페이지:**
- `/` (`src/pages/OrderPage.jsx`) — 공개 메뉴 목록 + 주문서(장바구니, 픽업 시간). 누구나 볼 수 있고, 주문하려면 로그인이 필요합니다.
- `/auth` (`src/pages/AuthPage.jsx`) — shadcn Tabs로 로그인/회원가입, 이메일+비밀번호만.
- `/my` (`src/pages/MyOrdersPage.jsx`) — 로그인한 손님 본인의 주문만 표시.
- `/admin` (`src/pages/AdminPage.jsx`) — 사장 전용: 전체 주문 표, 완료 처리, 삭제. 사장이 아닌 사용자가 접근하면 "권한이 없습니다" 안내 후 리다이렉트되지만, 이건 UX일 뿐이고 **보안 경계는 아닙니다** (아래 참고).

**메뉴 데이터는 DB에 없습니다.** `src/data/menu.js`(id/이름/가격/설명 배열)에 있으며 사장이 직접 수정합니다. 메뉴 CRUD 화면은 의도적으로 없으니 만들지 마세요.

**주문 데이터 (`orders` 테이블):** user_id, 픽업 희망 시간, 주문 내역 텍스트(비정규화, 예: `"크루아상 x2, 쑥라떼 x1"`), 합계 금액, 상태(기본값 `"접수"`, `"완료"`로 전환), 생성 시각.

## 권한 모델 — 가장 중요한 부분

익명 방문자 외에 두 역할: **손님**과 **사장**. 둘 다 같은 가입 흐름을 사용하며, "사장으로 가입" 버튼은 없습니다 — 사장 지정은 나중에 Supabase에서 화면 밖에서 처리됩니다.

역할은 `profiles` 테이블(`user_id`, `role`, 기본값 `"customer"`)에 저장되며, 사장 계정의 행만 Supabase에서 수동으로 `role = "owner"`로 바꿉니다 — 앱 화면을 통해서가 아닙니다.

**강제 경계는 항상 RLS이고, 애플리케이션 코드가 아닙니다.** PRD에서 가장 자주 틀리기 쉬운 지점으로 명시적으로 짚은 부분입니다:
- RLS 정책은 반드시 `profiles.role`을 확인해야 하며, 하드코딩된 이메일이나 `AdminPage.jsx`의 프론트엔드 `if` 체크로 대체하면 안 됩니다. 프론트엔드만의 가드는 UX일 뿐 보안이 아니며, 누구나 Supabase API를 직접 호출해 우회할 수 있습니다.
- `orders` SELECT: 손님은 `user_id = auth.uid()`인 행만, 사장은 전체를 봅니다.
- `orders` INSERT: `WITH CHECK (user_id = auth.uid())`가 반드시 있어야 합니다 — 손님이 다른 사람의 `user_id`로 주문을 만들 수 없어야 합니다.
- `orders` UPDATE(상태 변경) / DELETE: 사장만 가능합니다. 손님은 자기 주문도 수정·취소할 수 없습니다 (취소는 기능이 아니라 사장에게 하는 요청입니다).

인증, `orders` 테이블, `AdminPage.jsx`를 다룰 때는 화면 단의 체크만 믿지 말고 실제 RLS 정책이 위 내용을 강제하는지 반드시 확인하세요.
