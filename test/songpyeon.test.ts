import { describe, expect, it } from "vitest";
import {
  SongpyeonValidationError,
  createSeededRandom,
  createSongpyeonAvatar,
  hashSeed,
  normalizeSeed,
  renderSongpyeonSvg
} from "../src/lib/index";

describe("songpyeon avatar library", () => {
  it("normalizes seeds deterministically", () => {
    expect(normalizeSeed("  보름   달  ")).toBe("보름 달");
    expect(hashSeed("  보름   달  ")).toBe(hashSeed("보름 달"));
  });

  it("produces stable SVG for the same seed and options", () => {
    const first = renderSongpyeonSvg("토끼와 솔잎", {
      shape: "half-moon",
      pattern: "pine-needle",
      filling: "honey",
      palette: "mugwort"
    });
    const second = renderSongpyeonSvg("토끼와 솔잎", {
      shape: "half-moon",
      pattern: "pine-needle",
      filling: "honey",
      palette: "mugwort"
    });

    expect(first).toBe(second);
    expect(first).toContain("<svg");
    expect(first).toContain("pine-needle");
  });

  it("varies automatic traits from the seeded PRNG", () => {
    const a = createSongpyeonAvatar("강강술래");
    const b = createSongpyeonAvatar("햇밤");

    expect(a.hash).not.toBe(b.hash);
    expect([a.traits.shape, a.traits.pattern, a.traits.filling].join("/")).not.toBe(
      [b.traits.shape, b.traits.pattern, b.traits.filling].join("/")
    );
  });

  it("escapes seed and label text before placing them in SVG", () => {
    const avatar = createSongpyeonAvatar("<script>alert(1)</script>", {
      label: "\"bad\" & label"
    });

    expect(avatar.svg).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(avatar.svg).toContain("&quot;bad&quot; &amp; label");
    expect(avatar.svg).not.toContain("<script>");
  });

  it("rejects unsafe or unsupported options", () => {
    expect(() => renderSongpyeonSvg("")).toThrow(SongpyeonValidationError);
    expect(() => renderSongpyeonSvg("x", null as never)).toThrow(/Options/);
    expect(() => renderSongpyeonSvg("x", { size: 33 })).toThrow(/Size/);
    expect(() => renderSongpyeonSvg("x", { shape: "triangle" as never })).toThrow(/shape/);
    expect(() => renderSongpyeonSvg("x", { background: "yes" as never })).toThrow(/Background/);
    expect(() => renderSongpyeonSvg("x", { label: "x".repeat(91) })).toThrow(/Label/);
  });

  it("rejects XML-invalid controls and lone surrogates", () => {
    expect(() => renderSongpyeonSvg("bad\u0001seed")).toThrow(/XML/);
    expect(() => renderSongpyeonSvg("bad\ud800seed")).toThrow(/surrogate/);
    expect(() => renderSongpyeonSvg("seed", { label: "bad\udc00label" })).toThrow(/surrogate/);
  });

  it("uses option-specific IDs for same seed renders in one document", () => {
    const pistachio = renderSongpyeonSvg("동일 seed", { palette: "pistachio" });
    const omija = renderSongpyeonSvg("동일 seed", { palette: "omija" });
    const idPattern = /id="(sp-[a-f0-9]{8})-dough"/;
    const firstId = idPattern.exec(pistachio)?.[1];
    const secondId = idPattern.exec(omija)?.[1];

    expect(firstId).toBeDefined();
    expect(secondId).toBeDefined();
    expect(firstId).not.toBe(secondId);
    expect(pistachio).toContain(`fill="url(#${firstId}-dough)"`);
    expect(omija).toContain(`fill="url(#${secondId}-dough)"`);
  });

  it("clips long visible captions but keeps full seed in title", () => {
    const longSeed = "가".repeat(160);
    const svg = renderSongpyeonSvg(longSeed);

    expect(svg).toContain(`<title`);
    expect(svg).toContain(longSeed);
    expect(svg).toContain("…");
    const caption = /<text[^>]*>(.*?)<\/text>/u.exec(svg)?.[1];
    expect(Array.from(caption ?? '').length).toBeLessThanOrEqual(14);
    expect(svg).not.toContain('lengthAdjust="spacingAndGlyphs"');
  });

  it("exposes a deterministic random generator", () => {
    const one = createSeededRandom("seed");
    const two = createSeededRandom("seed");

    expect([one(), one(), one()]).toEqual([two(), two(), two()]);
  });
});
