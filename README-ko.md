# songpyeon

문자열로 송편 SVG 아바타를 만드는 TypeScript 라이브러리입니다. 웹 플레이그라운드에서 모양과 색을 바꾸고 SVG·PNG로 저장할 수 있습니다. 같은 seed와 옵션은 같은 SVG를 만들며, 라이브러리 런타임 의존성은 없습니다.

## 빠른 시작

Node.js 22 LTS(22.12 이상)를 사용합니다.

```bash
npm ci
npm run dev
```

개발 서버 기본 주소는 `http://127.0.0.1:5173`입니다.

## API

```ts
import { createSongpyeonAvatar, renderSongpyeonSvg } from "songpyeon";

const avatar = createSongpyeonAvatar("보름달 송편", {
  palette: "pistachio",
  shape: "half-moon",
  pattern: "pine-needle",
  filling: "sesame",
  size: 512
});

document.body.innerHTML = avatar.svg;

const svgOnly = renderSongpyeonSvg("가을 안부", { palette: "omija" });
```

`createSongpyeonAvatar()`는 SVG 문자열, 정규화된 seed, 해시, 확정된 옵션, 선택된 모양 정보를 함께 반환합니다. `renderSongpyeonSvg()`는 SVG 문자열만 필요할 때 사용합니다.

| 옵션 | 값 |
| --- | --- |
| `size` | `64`부터 `2048`까지의 정수. 기본값은 `512`입니다. |
| `shape` | `auto`, `half-moon`, `round`, `leaf`, `crescent` |
| `pattern` | `auto`, `plain`, `sesame-dots`, `pine-needle`, `ceramic-lines` |
| `filling` | `auto`, `sesame`, `honey`, `chestnut`, `red-bean` |
| `palette` | `pistachio`, `cream`, `mugwort`, `omija` |
| `label` | SVG의 접근성 제목에 쓰는 문자열. 최대 90자입니다. |
| `background` | 배경 포함 여부. 기본값은 `true`입니다. |

seed는 NFKC로 정규화하고 160자까지 허용합니다. seed와 label은 XML에서 허용하는 문자만 받으며, SVG에 들어가는 텍스트는 XML 이스케이프 처리합니다.

## 빌드와 배포

```bash
npm run build
npm run preview
```

정적 호스팅에는 `dist/demo/`의 내용만 올립니다. 라이브러리와 타입 선언은 각각 `dist/library/`, `dist/types/`에 생성됩니다.

`npm pack`은 라이브러리를 빌드하고 `.tgz` 패키지를 만듭니다.

```bash
npm pack
```

## 테스트

처음 브라우저 테스트를 실행하기 전에 Chromium을 설치합니다.

```bash
npx playwright install chromium
npm run check
npm run test:e2e
npm run pack:smoke
```

`npm run pack:smoke`는 생성한 패키지를 설치해 ESM·CommonJS 사용과 타입 선언을 확인합니다.

## 문서

[기여 안내](CONTRIBUTING.md) · [보안 정책](SECURITY.md) · [변경 기록](CHANGELOG.md) · [라이선스](LICENSE)
