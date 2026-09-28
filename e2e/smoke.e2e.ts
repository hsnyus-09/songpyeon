import { expect, test } from "@playwright/test";

test("playground is responsive and updates a deterministic SVG", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("preview").locator("svg")).toBeVisible();
  await page.getByTestId("seed-input").fill("브라우저 테스트 송편");
  await expect(page.getByTestId("preview").locator("title")).toContainText("브라우저 테스트 송편");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});

test("exports SVG and PNG downloads from the live preview", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("seed-input").fill("다운로드 테스트");

  const svgDownload = page.waitForEvent("download");
  await page.getByTestId("download-svg").click();
  const svg = await svgDownload;
  expect(svg.suggestedFilename()).toMatch(/songpyeon-.+\.svg/u);

  const pngDownload = page.waitForEvent("download");
  await page.getByTestId("download-png").click();
  const png = await pngDownload;
  expect(png.suggestedFilename()).toMatch(/songpyeon-.+\.png/u);
});
