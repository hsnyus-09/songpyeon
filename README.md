# songpyeon

A TypeScript library for creating songpyeon SVG avatars from strings. Customize shapes and colors in the web playground, then save your avatar as SVG or PNG. The same seed and options always produce the same SVG, and the library has no runtime dependencies.

## Quick start

Use Node.js 22 LTS (22.12 or later).

```bash
npm ci
npm run dev
```

The default development server URL is `http://127.0.0.1:5173`.

## API

```ts
import { createSongpyeonAvatar, renderSongpyeonSvg } from "songpyeon";

const avatar = createSongpyeonAvatar("Full-moon songpyeon", {
  palette: "pistachio",
  shape: "half-moon",
  pattern: "pine-needle",
  filling: "sesame",
  size: 512
});

document.body.innerHTML = avatar.svg;

const svgOnly = renderSongpyeonSvg("Autumn greetings", { palette: "omija" });
```

`createSongpyeonAvatar()` returns the SVG string, normalized seed, hash, resolved options, and selected shape information. Use `renderSongpyeonSvg()` when you only need the SVG string.

| Option | Values |
| --- | --- |
| `size` | An integer from `64` to `2048`. The default is `512`. |
| `shape` | `auto`, `half-moon`, `round`, `leaf`, `crescent` |
| `pattern` | `auto`, `plain`, `sesame-dots`, `pine-needle`, `ceramic-lines` |
| `filling` | `auto`, `sesame`, `honey`, `chestnut`, `red-bean` |
| `palette` | `pistachio`, `cream`, `mugwort`, `omija` |
| `label` | A string used as the SVG accessibility title. Maximum 90 characters. |
| `background` | Whether to include a background. Defaults to `true`. |

Seeds are normalized with NFKC and may be up to 160 characters long. Seeds and labels accept only characters valid in XML, and text inserted into the SVG is XML-escaped.

## Build and distribution

```bash
npm run build
npm run preview
```

For static hosting, upload only the contents of `dist/demo/`. The library and type declarations are generated in `dist/library/` and `dist/types/`, respectively.

`npm pack` builds the library and creates a `.tgz` package.

```bash
npm pack
```

## Tests

Install Chromium before running browser tests for the first time.

```bash
npx playwright install chromium
npm run check
npm run test:e2e
npm run pack:smoke
```

`npm run pack:smoke` installs the generated package and verifies ESM and CommonJS usage as well as the type declarations.

## Documentation

[Contributing](CONTRIBUTING.md) · [Security policy](SECURITY.md) · [Changelog](CHANGELOG.md) · [License](LICENSE)
