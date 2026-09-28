export type SongpyeonShape = "auto" | "half-moon" | "round" | "leaf" | "crescent";
export type SongpyeonPattern = "auto" | "plain" | "sesame-dots" | "pine-needle" | "ceramic-lines";
export type SongpyeonFilling = "auto" | "sesame" | "honey" | "chestnut" | "red-bean";
export type SongpyeonPalette = "pistachio" | "cream" | "mugwort" | "omija";

export interface SongpyeonOptions {
  readonly size?: number;
  readonly shape?: SongpyeonShape;
  readonly pattern?: SongpyeonPattern;
  readonly filling?: SongpyeonFilling;
  readonly palette?: SongpyeonPalette;
  readonly label?: string;
  readonly background?: boolean;
}

export interface SongpyeonAvatar {
  readonly svg: string;
  readonly seed: string;
  readonly hash: string;
  readonly options: Required<SongpyeonOptions>;
  readonly traits: {
    readonly shape: Exclude<SongpyeonShape, "auto">;
    readonly pattern: Exclude<SongpyeonPattern, "auto">;
    readonly filling: Exclude<SongpyeonFilling, "auto">;
    readonly palette: SongpyeonPalette;
  };
}

export class SongpyeonValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SongpyeonValidationError";
  }
}

const shapes = ["half-moon", "round", "leaf", "crescent"] as const;
const patterns = ["plain", "sesame-dots", "pine-needle", "ceramic-lines"] as const;
const fillings = ["sesame", "honey", "chestnut", "red-bean"] as const;
const palettes = ["pistachio", "cream", "mugwort", "omija"] as const;

const paletteColors: Record<SongpyeonPalette, {
  dough: string;
  doughDark: string;
  filling: string;
  accent: string;
  plate: string;
  ink: string;
}> = {
  pistachio: {
    dough: "#c9d9a9",
    doughDark: "#8ea56d",
    filling: "#766441",
    accent: "#315c52",
    plate: "#f8f1df",
    ink: "#172622"
  },
  cream: {
    dough: "#f4e7c7",
    doughDark: "#c8aa72",
    filling: "#8c5d36",
    accent: "#557268",
    plate: "#fff8ea",
    ink: "#211c15"
  },
  mugwort: {
    dough: "#9db883",
    doughDark: "#5f754c",
    filling: "#5d4930",
    accent: "#233f36",
    plate: "#f5edd8",
    ink: "#13211d"
  },
  omija: {
    dough: "#e9b4aa",
    doughDark: "#aa6b63",
    filling: "#783f40",
    accent: "#284b45",
    plate: "#fff2e0",
    ink: "#211719"
  }
};

export function normalizeSeed(seed: string): string {
  if (typeof seed !== "string") {
    throw new SongpyeonValidationError("Seed must be a string.");
  }

  const normalized = seed.normalize("NFKC").trim().replace(/\s+/g, " ");
  if (normalized.length === 0) {
    throw new SongpyeonValidationError("Seed cannot be empty.");
  }
  if (normalized.length > 160) {
    throw new SongpyeonValidationError("Seed must be 160 characters or fewer.");
  }
  assertXmlText(normalized, "Seed");
  return normalized;
}

export function hashSeed(seed: string): string {
  const normalized = normalizeSeed(seed);
  return fnv1aHex(normalized);
}

export function createSeededRandom(seed: string): () => number {
  let state = Number.parseInt(hashSeed(seed), 16) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function renderSongpyeonSvg(seed: string, options: SongpyeonOptions = {}): string {
  return createSongpyeonAvatar(seed, options).svg;
}

export function createSongpyeonAvatar(seed: string, options: SongpyeonOptions = {}): SongpyeonAvatar {
  const normalizedSeed = normalizeSeed(seed);
  const hash = hashSeed(normalizedSeed);
  const random = createSeededRandom(normalizedSeed);
  const resolved = validateOptions(options);
  const palette = resolved.palette;
  const traits = {
    shape: chooseTrait(resolved.shape, shapes, random),
    pattern: chooseTrait(resolved.pattern, patterns, random),
    filling: chooseTrait(resolved.filling, fillings, random),
    palette
  };
  const svg = drawSvg(normalizedSeed, hash, resolved, traits, random);

  return {
    svg,
    seed: normalizedSeed,
    hash,
    options: resolved,
    traits
  };
}

function validateOptions(options: unknown): Required<SongpyeonOptions> {
  if (typeof options !== "object" || options === null || Array.isArray(options)) {
    throw new SongpyeonValidationError("Options must be an object.");
  }

  const candidate = options as Partial<Record<keyof SongpyeonOptions, unknown>>;
  const size = candidate.size ?? 512;
  if (typeof size !== "number" || !Number.isInteger(size) || size < 64 || size > 2048) {
    throw new SongpyeonValidationError("Size must be an integer from 64 to 2048.");
  }

  const shape = validateUnion(candidate.shape ?? "auto", ["auto", ...shapes], "shape");
  const pattern = validateUnion(candidate.pattern ?? "auto", ["auto", ...patterns], "pattern");
  const filling = validateUnion(candidate.filling ?? "auto", ["auto", ...fillings], "filling");
  const palette = validateUnion(candidate.palette ?? "pistachio", palettes, "palette");
  const label = candidate.label ?? "Songpyeon avatar";
  if (typeof label !== "string" || label.length > 90) {
    throw new SongpyeonValidationError("Label must be a string of 90 characters or fewer.");
  }
  assertXmlText(label, "Label");

  const background = candidate.background ?? true;
  if (typeof background !== "boolean") {
    throw new SongpyeonValidationError("Background must be a boolean.");
  }

  return {
    size,
    shape,
    pattern,
    filling,
    palette,
    label,
    background
  };
}

function validateUnion<const T extends readonly string[]>(value: unknown, allowed: T, name: string): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new SongpyeonValidationError(`${name} must be one of: ${allowed.join(", ")}.`);
  }
  return value as T[number];
}

function chooseTrait<const T extends readonly string[]>(
  option: "auto" | T[number],
  choices: T,
  random: () => number
): T[number] {
  return option === "auto" ? choices[Math.floor(random() * choices.length)] as T[number] : option;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function drawSvg(
  seed: string,
  hash: string,
  options: Required<SongpyeonOptions>,
  traits: SongpyeonAvatar["traits"],
  random: () => number
): string {
  const id = `sp-${fnv1aHex(`${hash}|${options.size}|${traits.shape}|${traits.pattern}|${traits.filling}|${traits.palette}|${options.background}`)}`;
  const colors = paletteColors[traits.palette];
  const specks = Array.from({ length: 18 }, () => {
    const x = 126 + random() * 260;
    const y = 184 + random() * 126;
    const r = 1.4 + random() * 2.8;
    const opacity = 0.12 + random() * 0.24;
    return `<circle cx="${fixed(x)}" cy="${fixed(y)}" r="${fixed(r)}" fill="${colors.ink}" opacity="${fixed(opacity)}"/>`;
  }).join("");
  const garnish = Array.from({ length: 5 }, (_, index) => {
    const x = 122 + index * 68 + random() * 10;
    const y = 334 + random() * 14;
    return `<path d="M${fixed(x)} ${fixed(y)} C${fixed(x + 16)} ${fixed(y - 16)} ${fixed(x + 36)} ${fixed(y - 16)} ${fixed(x + 52)} ${fixed(y - 1)}" stroke="${colors.accent}" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.72"/>`;
  }).join("");

  const cake = shapePath(traits.shape, colors, `${id}-dough`);
  const pattern = patternMarkup(traits.pattern, colors);
  const filling = fillingMarkup(traits.filling, colors);
  const background = options.background
    ? `<rect width="512" height="512" rx="52" fill="${colors.plate}"/>
       <circle cx="256" cy="274" r="170" fill="#ffffff" opacity="0.58"/>
       <ellipse cx="256" cy="360" rx="180" ry="52" fill="${colors.ink}" opacity="0.08"/>`
    : "";
  const title = `${options.label}: ${seed}`;
  const caption = visibleCaption(seed);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${options.size}" height="${options.size}" viewBox="0 0 512 512" role="img" aria-labelledby="${id}-title ${id}-desc">
  <title id="${id}-title">${escapeXml(title)}</title>
  <desc id="${id}-desc">Deterministic Korean songpyeon rice-cake avatar with ${traits.palette} palette, ${traits.shape} shape, ${traits.pattern} pattern, and ${traits.filling} filling.</desc>
  <defs>
    <linearGradient id="${id}-dough" x1="92" y1="138" x2="410" y2="338" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fff7df" offset="0"/>
      <stop stop-color="${colors.dough}" offset="0.42"/>
      <stop stop-color="${colors.doughDark}" offset="1"/>
    </linearGradient>
    <filter id="${id}-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="${colors.ink}" flood-opacity="0.18"/>
    </filter>
  </defs>
  ${background}
  ${garnish}
  <g filter="url(#${id}-soft)">
    ${cake}
    ${pattern}
    ${filling}
    ${specks}
    <path d="M146 250 C198 288 308 300 374 242" stroke="#fff8e5" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.46"/>
    <path d="M134 300 C184 336 311 348 390 292" stroke="${colors.ink}" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.18"/>
  </g>
  <text x="256" y="438" text-anchor="middle" fill="${colors.ink}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600">${escapeXml(caption)}</text>
</svg>`;
}

function shapePath(
  shape: Exclude<SongpyeonShape, "auto">,
  colors: (typeof paletteColors)[SongpyeonPalette],
  gradientId: string
): string {
  if (shape === "round") {
    return `<ellipse cx="256" cy="258" rx="136" ry="96" fill="url(#${gradientId})" stroke="${colors.doughDark}" stroke-width="3"/>`;
  }
  const map = {
    "half-moon": "M114 280 C132 178 240 120 356 156 C412 174 424 246 374 292 C311 350 182 342 114 280 Z",
    leaf: "M112 274 C160 156 300 126 408 220 C366 338 228 372 112 274 Z",
    crescent: "M112 276 C150 164 310 114 406 218 C330 210 226 250 166 332 C140 320 122 302 112 276 Z",
    round: ""
  };
  return `<path d="${map[shape]}" fill="url(#${gradientId})" stroke="${colors.doughDark}" stroke-width="3" stroke-linejoin="round"/>`;
}

function patternMarkup(pattern: Exclude<SongpyeonPattern, "auto">, colors: (typeof paletteColors)[SongpyeonPalette]): string {
  if (pattern === "plain") {
    return `<path d="M164 224 C214 190 310 190 360 226" stroke="#fff9e7" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.55"/>`;
  }
  if (pattern === "sesame-dots") {
    return [168, 204, 242, 282, 320, 354]
      .map((x, index) => `<ellipse cx="${x}" cy="${238 + (index % 2) * 28}" rx="5" ry="8" fill="${colors.filling}" opacity="0.62" transform="rotate(${index % 2 === 0 ? -24 : 18} ${x} ${238 + (index % 2) * 28})"/>`)
      .join("");
  }
  if (pattern === "pine-needle") {
    return [158, 196, 236, 276, 318]
      .map((x) => `<path d="M${x} 318 C${x + 18} 270 ${x + 28} 226 ${x + 20} 184" stroke="${colors.accent}" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.62"/>`)
      .join("");
  }
  return `<path d="M148 264 C196 226 312 224 370 262" stroke="${colors.accent}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.62"/>
    <path d="M160 294 C215 326 300 326 356 292" stroke="${colors.accent}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.42"/>`;
}

function fillingMarkup(filling: Exclude<SongpyeonFilling, "auto">, colors: (typeof paletteColors)[SongpyeonPalette]): string {
  const fillColors = {
    sesame: "#4a3826",
    honey: "#c7892d",
    chestnut: "#8f5f37",
    "red-bean": "#7b303a"
  };
  return `<g transform="translate(0 0)">
    <path d="M222 302 C236 278 278 278 292 302 C282 330 232 330 222 302 Z" fill="${fillColors[filling]}" opacity="0.9"/>
    <circle cx="256" cy="307" r="8" fill="${colors.plate}" opacity="0.36"/>
  </g>`;
}

function fixed(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function fnv1aHex(value: string): string {
  let hash = 0x811c9dc5;
  for (const char of value) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function assertXmlText(value: string, name: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    const isHighSurrogate = code >= 0xd800 && code <= 0xdbff;
    const isLowSurrogate = code >= 0xdc00 && code <= 0xdfff;
    const next = value.charCodeAt(index + 1);
    if (isHighSurrogate) {
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new SongpyeonValidationError(`${name} contains an invalid Unicode surrogate.`);
      }
      index += 1;
      continue;
    }
    if (isLowSurrogate) {
      throw new SongpyeonValidationError(`${name} contains an invalid Unicode surrogate.`);
    }
    const isAllowedControl = code === 0x09 || code === 0x0a || code === 0x0d;
    if (code < 0x20 && !isAllowedControl) {
      throw new SongpyeonValidationError(`${name} contains a character that is invalid in XML.`);
    }
  }
}

function visibleCaption(value: string): string {
  const chars = Array.from(value);
  return chars.length > 14 ? `${chars.slice(0, 13).join("")}…` : value;
}
