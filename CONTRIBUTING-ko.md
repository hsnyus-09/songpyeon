# Contributing

## 개발

```bash
npm ci
npm run dev
```

## 제출 전 확인

```bash
npx playwright install chromium
npm run check
npm run test:e2e
npm run pack:smoke
```

## 변경 기준

- 같은 seed와 옵션이 같은 SVG를 만드는 동작을 유지합니다.
- 새 옵션을 추가하면 타입, 입력 검사, 테스트, README 옵션 표를 함께 갱신합니다.
- 사용자 텍스트는 기존 XML 검사와 이스케이프 처리를 거쳐야 합니다.
- 플레이그라운드의 키보드 조작과 모바일 화면을 확인합니다.

변경 범위와 실행한 테스트를 PR에 적어 주세요. 동작이 바뀌면 테스트와 문서도 함께 수정합니다.
