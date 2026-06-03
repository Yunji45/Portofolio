const { test, expect } = require("@playwright/test");
const { pathToFileURL } = require("url");
const path = require("path");

const root = path.resolve(__dirname, "..");

function pageUrl(fileName, hash = "") {
  return `${pathToFileURL(path.join(root, fileName)).href}${hash}`;
}

async function hasRenderedPixels(page, selector) {
  return page.$eval(selector, (canvas) => {
    if (canvas.width === 0 || canvas.height === 0) {
      return false;
    }

    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;

    return canvas.toDataURL("image/png") !== blank.toDataURL("image/png");
  });
}

test("hero and about Three.js canvases render", async ({ page }) => {
  await page.goto(pageUrl("index.html"));
  await expect(page.locator("#hero-three")).toBeVisible();
  await page.waitForTimeout(700);
  await expect(await hasRenderedPixels(page, "#hero-three")).toBe(true);

  await page.locator('a.nav-link[href="#about"]').click();
  await expect(page.locator("#about.section-show")).toBeVisible();
  await expect(page.locator("#about-three")).toBeVisible();
  await page.waitForTimeout(700);
  await expect(await hasRenderedPixels(page, "#about-three")).toBe(true);
});

test("portfolio tilt applies a 3D transform", async ({ page }) => {
  await page.goto(pageUrl("index.html", "#portfolio"));
  const firstCard = page.locator(".portfolio .portfolio-wrap").first();

  await expect(firstCard).toBeVisible();
  await firstCard.hover();
  await page.waitForTimeout(150);

  const transform = await firstCard.evaluate((card) => getComputedStyle(card).transform);
  expect(transform).not.toBe("none");
});

test("portfolio details Three.js canvas renders", async ({ page }) => {
  await page.goto(pageUrl("portfolio-details.html"));
  await expect(page.locator("#project-three")).toBeVisible();
  await page.waitForTimeout(700);
  await expect(await hasRenderedPixels(page, "#project-three")).toBe(true);
});
