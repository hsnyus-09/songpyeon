import {
  type SongpyeonFilling,
  type SongpyeonPalette,
  type SongpyeonPattern,
  type SongpyeonShape,
  SongpyeonValidationError,
  createSongpyeonAvatar,
  renderSongpyeonSvg
} from "../lib/index";
import "./styles.css";

interface DemoState {
  seed: string;
  shape: SongpyeonShape;
  pattern: SongpyeonPattern;
  filling: SongpyeonFilling;
  palette: SongpyeonPalette;
  size: number;
}

const defaultSeed = "보름달 송편";
const seeds = ["추석 아침", "할머니의 깨송편", "보름달 산책", "솔잎 접시", "가을 안부", "작은 차례상"] as const;
const state: DemoState = readStateFromUrl();

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("App root is missing.");
}

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#top" aria-label="songpyeon home">
      <span class="brand-mark" aria-hidden="true"></span>
      <span>songpyeon</span>
    </a>
    <nav aria-label="페이지 섹션">
      <a href="#gallery">씨앗 갤러리</a>
      <a href="#api">API</a>
      <a href="#notes">설계</a>
    </nav>
  </header>
  <main id="top">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow">결정론적 송편 SVG 아바타</p>
        <h1 id="hero-title"><span>이름 하나,</span><span>나만의 송편.</span></h1>
        <p class="intro">같은 seed는 언제나 같은 송편을 만듭니다. 색, 모양, 무늬, 속재료가 작은 의식처럼 고정되어 README, 프로필, 명절 카드에 바로 쓸 수 있습니다.</p>
      </div>
      <div class="preview-shell">
        <div class="plate-shadow" aria-hidden="true"></div>
        <div id="preview" class="preview" data-testid="preview" aria-live="polite"></div>
      </div>
    </section>

    <section class="workspace" aria-label="송편 생성기">
      <form class="controls" id="controls">
        <div class="field">
          <label for="seed">Seed</label>
          <div class="seed-row">
            <input id="seed" data-testid="seed-input" name="seed" autocomplete="off" maxlength="160" />
            <button class="icon-button" type="button" id="randomize" data-testid="randomize" aria-label="무작위 seed 고르기" title="무작위 seed 고르기">↻</button>
          </div>
        </div>
        <div class="control-grid">
          ${selectField("shape", "모양", [["auto", "자동"], ["half-moon", "반달"], ["round", "둥근"], ["leaf", "잎"], ["crescent", "초승"]])}
          ${selectField("palette", "색감", [["pistachio", "피스타치오"], ["cream", "크림"], ["mugwort", "쑥"], ["omija", "오미자"]])}
          ${selectField("pattern", "무늬", [["auto", "자동"], ["plain", "담백"], ["sesame-dots", "깨 점"], ["pine-needle", "솔잎"], ["ceramic-lines", "도자기 선"]])}
          ${selectField("filling", "속재료", [["auto", "자동"], ["sesame", "깨"], ["honey", "꿀"], ["chestnut", "밤"], ["red-bean", "팥"]])}
        </div>
        <div class="field">
          <label for="size">SVG 크기 <output id="size-value" for="size"></output></label>
          <input id="size" name="size" type="range" min="128" max="1024" step="64" />
        </div>
        <div class="actions">
          <button type="button" id="download-svg" data-testid="download-svg">SVG 내려받기</button>
          <button type="button" id="download-png" data-testid="download-png">PNG 내려받기</button>
          <button type="button" id="copy-link" data-testid="copy-link">링크 복사</button>
        </div>
        <p id="status" class="status" role="status" aria-live="polite"></p>
      </form>

      <aside class="recipe" aria-labelledby="recipe-title">
        <p class="eyebrow">Recipe card</p>
        <h2 id="recipe-title">현재 송편의 조합</h2>
        <dl id="traits"></dl>
        <pre id="snippet" tabindex="0"></pre>
      </aside>
    </section>

    <section id="gallery" class="gallery" aria-labelledby="gallery-title">
      <div>
        <p class="eyebrow">Seeded gallery</p>
        <h2 id="gallery-title">다른 seed도 같은 규칙으로 굽습니다.</h2>
      </div>
      <div class="gallery-grid" id="gallery-grid"></div>
    </section>

    <section id="api" class="docs-band" aria-labelledby="api-title">
      <div>
        <p class="eyebrow">Library API</p>
        <h2 id="api-title">zero runtime dependencies</h2>
      </div>
      <pre tabindex="0"><code>import { createSongpyeonAvatar } from "songpyeon";

const avatar = createSongpyeonAvatar("보름달", {
  palette: "pistachio",
  shape: "half-moon",
  pattern: "pine-needle",
  filling: "sesame"
});

document.body.innerHTML = avatar.svg;</code></pre>
    </section>

    <section id="notes" class="notes" aria-labelledby="notes-title">
      <h2 id="notes-title">설계 노트</h2>
      <p>입력 문자열은 NFKC 정규화와 공백 정리를 거친 뒤 FNV-1a 기반 해시와 seeded PRNG로 변환됩니다. SVG 텍스트는 escape 처리되고 옵션은 범위와 enum을 검증합니다.</p>
      <p>Demo는 외부 폰트, 이미지, 분석 스크립트를 요청하지 않습니다. 내보내기는 브라우저 안에서 Blob과 Canvas로 처리되며 실패하면 상태 메시지로 알려줍니다.</p>
    </section>
  </main>
  <footer>
    <span>MIT 2026 Chuseok project contributors</span>
    <a href="#api">API 예시</a>
  </footer>
`;

const elements = {
  seed: getInput("seed"),
  shape: getSelect("shape"),
  pattern: getSelect("pattern"),
  filling: getSelect("filling"),
  palette: getSelect("palette"),
  size: getInput("size"),
  sizeValue: getText("size-value"),
  preview: getText("preview"),
  status: getText("status"),
  traits: getText("traits"),
  snippet: getText("snippet"),
  gallery: getText("gallery-grid"),
  randomize: getButton("randomize"),
  downloadSvg: getButton("download-svg"),
  downloadPng: getButton("download-png"),
  copyLink: getButton("copy-link")
};

hydrateControls();
render();

document.querySelector("#controls")?.addEventListener("input", () => {
  state.seed = elements.seed.value;
  state.shape = elements.shape.value as SongpyeonShape;
  state.pattern = elements.pattern.value as SongpyeonPattern;
  state.filling = elements.filling.value as SongpyeonFilling;
  state.palette = elements.palette.value as SongpyeonPalette;
  state.size = Number.parseInt(elements.size.value, 10);
  setStatus("");
  render();
});

elements.randomize.addEventListener("click", () => {
  const suffix = new Date().toISOString().slice(11, 19);
  state.seed = `${seeds[Math.floor(Math.random() * seeds.length)] ?? seeds[0]} ${suffix}`;
  elements.seed.value = state.seed;
  render();
});

elements.downloadSvg.addEventListener("click", () => {
  try {
    const svg = renderSongpyeonSvg(state.seed, currentOptions());
    downloadBlob(svg, fileName("svg"), "image/svg+xml;charset=utf-8");
    setStatus("SVG 파일을 준비했습니다.");
  } catch (error) {
    reportError(error, "SVG를 만들 수 없습니다.");
  }
});

elements.downloadPng.addEventListener("click", () => {
  void downloadPng();
});

elements.copyLink.addEventListener("click", () => {
  void copyLink();
});

async function downloadPng(): Promise<void> {
  try {
    const svg = renderSongpyeonSvg(state.seed, currentOptions());
    const png = await svgToPng(svg, state.size);
    downloadBlob(png, fileName("png"), "image/png");
    setStatus("PNG 파일을 준비했습니다.");
  } catch (error) {
    reportError(error, "PNG 변환에 실패했습니다.");
  }
}

async function copyLink(): Promise<void> {
  try {
    const url = permalink();
    if ("clipboard" in navigator && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(url);
      setStatus("재현 가능한 링크를 복사했습니다.");
    } else {
      setStatus(url);
    }
  } catch {
    setStatus("클립보드를 사용할 수 없어 주소창의 링크를 확인해 주세요.", true);
  }
}

function render(): void {
  try {
    const avatar = createSongpyeonAvatar(state.seed, currentOptions());
    elements.preview.innerHTML = avatar.svg;
    elements.traits.innerHTML = `
      <div><dt>hash</dt><dd>${avatar.hash}</dd></div>
      <div><dt>shape</dt><dd>${avatar.traits.shape}</dd></div>
      <div><dt>palette</dt><dd>${avatar.traits.palette}</dd></div>
      <div><dt>pattern</dt><dd>${avatar.traits.pattern}</dd></div>
      <div><dt>filling</dt><dd>${avatar.traits.filling}</dd></div>
    `;
    elements.snippet.textContent = `createSongpyeonAvatar(${JSON.stringify(avatar.seed)}, ${JSON.stringify(currentOptions(), null, 2)});`;
    elements.sizeValue.textContent = `${state.size}px`;
    history.replaceState(null, "", permalink());
    renderGallery();
  } catch (error) {
    elements.preview.innerHTML = "";
    reportError(error, "옵션을 확인해 주세요.");
  }
}

function renderGallery(): void {
  elements.gallery.innerHTML = seeds
    .map((seed) => {
      const svg = renderSongpyeonSvg(seed, {
        palette: state.palette,
        background: true,
        size: 220
      });
      return `<button class="gallery-item" type="button" data-seed="${encodeURIComponent(seed)}">
        ${svg}
        <span>${seed}</span>
      </button>`;
    })
    .join("");
  elements.gallery.querySelectorAll<HTMLButtonElement>(".gallery-item").forEach((button) => {
    button.addEventListener("click", () => {
      state.seed = decodeURIComponent(button.dataset.seed ?? defaultSeed);
      elements.seed.value = state.seed;
      render();
    });
  });
}

function currentOptions() {
  return {
    shape: state.shape,
    pattern: state.pattern,
    filling: state.filling,
    palette: state.palette,
    size: state.size,
    label: "songpyeon"
  } as const;
}

function hydrateControls(): void {
  elements.seed.value = state.seed;
  elements.shape.value = state.shape;
  elements.pattern.value = state.pattern;
  elements.filling.value = state.filling;
  elements.palette.value = state.palette;
  elements.size.value = String(state.size);
}

function readStateFromUrl(): DemoState {
  const params = new URLSearchParams(window.location.search);
  return {
    seed: params.get("seed") ?? defaultSeed,
    shape: readParam(params, "shape", ["auto", "half-moon", "round", "leaf", "crescent"], "auto"),
    pattern: readParam(params, "pattern", ["auto", "plain", "sesame-dots", "pine-needle", "ceramic-lines"], "auto"),
    filling: readParam(params, "filling", ["auto", "sesame", "honey", "chestnut", "red-bean"], "auto"),
    palette: readParam(params, "palette", ["pistachio", "cream", "mugwort", "omija"], "pistachio"),
    size: Number.parseInt(params.get("size") ?? "512", 10)
  };
}

function readParam<const T extends readonly string[]>(
  params: URLSearchParams,
  key: string,
  allowed: T,
  fallback: T[number]
): T[number] {
  const value = params.get(key);
  return value && allowed.includes(value) ? value : fallback;
}

function permalink(): string {
  const params = new URLSearchParams({
    seed: state.seed,
    shape: state.shape,
    pattern: state.pattern,
    filling: state.filling,
    palette: state.palette,
    size: String(state.size)
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function selectField(id: keyof DemoState, label: string, options: readonly (readonly [string, string])[]): string {
  return `<div class="field">
    <label for="${id}">${label}</label>
    <select id="${id}" name="${id}">
      ${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}
    </select>
  </div>`;
}

function getInput(id: string): HTMLInputElement {
  const element = document.querySelector<HTMLInputElement>(`#${id}`);
  if (!element) throw new Error(`${id} input missing`);
  return element;
}

function getSelect(id: string): HTMLSelectElement {
  const element = document.querySelector<HTMLSelectElement>(`#${id}`);
  if (!element) throw new Error(`${id} select missing`);
  return element;
}

function getText(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`#${id}`);
  if (!element) throw new Error(`${id} element missing`);
  return element;
}

function getButton(id: string): HTMLButtonElement {
  const element = document.querySelector<HTMLButtonElement>(`#${id}`);
  if (!element) throw new Error(`${id} button missing`);
  return element;
}

function downloadBlob(content: BlobPart, name: string, type: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function svgToPng(svg: string, size: number): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = new Image();
    image.decoding = "async";
    const loaded = new Promise<void>((resolve, reject) => {
      image.addEventListener("load", () => {
        resolve();
      }, { once: true });
      image.addEventListener("error", () => {
        reject(new Error("SVG image load failed."));
      }, { once: true });
    });
    image.src = url;
    await loaded;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");
    context.drawImage(image, 0, 0, size, size);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });
    if (!blob) throw new Error("PNG export returned no data.");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function fileName(extension: "svg" | "png"): string {
  return `songpyeon-${state.seed.trim().replace(/\s+/g, "-").slice(0, 36) || "seed"}.${extension}`;
}

function setStatus(message: string, isError = false): void {
  elements.status.textContent = message;
  elements.status.dataset.kind = isError ? "error" : "ok";
}

function reportError(error: unknown, fallback: string): void {
  const message = error instanceof SongpyeonValidationError || error instanceof Error ? error.message : fallback;
  setStatus(`${fallback} ${message}`, true);
}
