# Swelling Keyboard

React Native Expo 기반 맞춤법 교정 키보드 앱 초기 환경입니다.

현재 구현된 범위:

- Expo SDK 기반 TypeScript 앱
- 한국어 맞춤법 교정 플레이그라운드
- 교정 결과 미리보기, 제안 목록, 교정 적용 액션
- 키보드 교정 강도와 자동 교정 토글 UI
- 키보드 설정 페이지와 로그아웃 액션
- 추후 네이티브 키보드 확장과 공유할 수 있는 `src/lib/correctionEngine.ts`

## 실행

```bash
npm start
```

Expo Dev Tools 또는 터미널 QR 코드로 Expo Go에서 확인할 수 있습니다.

플랫폼별 실행:

```bash
npm run ios
npm run android
npm run web
```

타입 체크:

```bash
npm run typecheck
```

## 프로젝트 구조

```text
.
├── App.tsx
├── app.json
├── package.json
└── src
    └── lib
        └── correctionEngine.ts
```

## 네이티브 키보드 확장 메모

Expo Go만으로는 사용자의 휴대폰 전체에서 동작하는 시스템 키보드 확장을 바로 배포할 수 없습니다. 지금 만든 앱은 교정 UX와 로직을 먼저 검증하는 Expo 앱입니다.

실제 커스텀 키보드로 가려면 다음 단계가 필요합니다.

- iOS: Keyboard Extension 타깃을 추가하고 EAS Build/Prebuild 또는 config plugin으로 관리합니다.
- Android: `InputMethodService` 기반 네이티브 키보드 서비스를 추가합니다.
- 공통: 교정 로직은 JS/TS 모듈 또는 서버 API로 분리해서 앱 화면과 키보드 확장이 같은 결과를 쓰게 합니다.
- 배포: Expo Go 대신 development build와 EAS Build를 사용합니다.

참고:

- Expo iOS App Extensions: https://docs.expo.dev/build-reference/app-extensions/
- Expo custom native code: https://docs.expo.dev/workflow/customizing/
- Expo keyboard handling: https://docs.expo.dev/guides/keyboard-handling/
# Swelling_reactNative
