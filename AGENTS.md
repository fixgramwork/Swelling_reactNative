# Agent.md

## 프로젝트 개요
- 목적: 실시간 맞춤법 교정 AI 모바일 앱
- 플랫폼: React Native + Expo (Android)
- 언어: TypeScript
- 패키지 매니저: npm 또는 pnpm

## 디렉토리 구조
src/
├── app/ 또는 screens/ # 화면 단위 컴포넌트
├── components/ # 재사용 UI 컴포넌트
├── hooks/ # 커스텀 훅
├── services/ # API 통신 로직
├── types/ # TypeScript 타입
├── utils/ # 순수 함수
└── constants/ # 상수

## 코드 규칙
- 컴포넌트명: PascalCase
- 함수명/변수명: camelCase
- 타입 정의 필수
- 비즈니스 로직은 화면 컴포넌트에 직접 작성하지 않는다
- API 호출은 services 디렉토리에서 관리한다
- 재사용 가능한 UI는 components로 분리한다

## 절대 금지
- any 타입 남용 금지
- 화면 컴포넌트에 API 로직 직접 작성 금지
- 하드코딩된 API URL 사용 금지
- console.log 남긴 채 PR 금지

## PR 규칙
- PR 하나에 하나의 변경만 포함
- 테스트 또는 동작 확인 내용 없이 PR 금지

## Commit Convention
- 커밋 메시지: conventional commit
- 사용 언어: 한국어
- 형식:
  <타입>[적용 범위]: <1줄 설명>

## Test
- 테스트 도구: Jest, React Native Testing Library
- 테스트 파일 위치: __tests__/ 또는 *.test.tsx
- 새 기능에는 테스트 또는 명확한 동작 검증 추가