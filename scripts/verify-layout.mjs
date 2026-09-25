// Optional browser regression check; uses an existing Playwright installation.
// Start Vite, then: OOM_LAYOUT_URL=http://localhost:5173 node scripts/verify-layout.mjs
// PLAYWRIGHT_MODULE may point to a bundled Playwright package outside this repo.
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.OOM_LAYOUT_URL || "http://localhost:5173";
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
let checks = 0;
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("oom-training-selection-v1", JSON.stringify({
      courseId: "course-1", levelId: "advanced", selectedAt: new Date().toISOString(),
    }));
  });
  const visit = async (route) => {
    await page.goto(new URL(route, base).href);
    await page.locator("main").waitFor();
    await page.locator("main h1, main h2").first().waitFor();
  };
  for (const [width, height] of [[1440, 900], [1920, 1080], [390, 844]]) {
    await page.setViewportSize({ width, height });
    for (const route of ["/", "/contact/"]) {
      await visit(route);
      // Replace only page content, retaining the real shell, main and footer.
      // This deliberately short fixture never adds a public route.
      await page.evaluate(() => {
        document.querySelector("main").replaceChildren(Object.assign(document.createElement("p"), { textContent: "Short layout fixture" }));
        window.scrollTo(0, 0);
      });
      const short = await page.evaluate(() => {
        const main = document.querySelector("main");
        const footer = document.querySelector("footer");
        const shell = main.parentElement;
        return {
          bottom: footer.getBoundingClientRect().bottom,
          position: getComputedStyle(footer).position,
          grow: getComputedStyle(main).flexGrow,
          shellMin: parseFloat(getComputedStyle(shell).minHeight),
          shellDisplay: getComputedStyle(shell).display,
        };
      });
      assert.ok(Math.abs(short.bottom - height) <= 1, `${route} short footer reaches viewport bottom at ${width}`);
      assert.ok(!["fixed", "sticky"].includes(short.position));
      assert.equal(short.grow, "1");
      assert.equal(short.shellDisplay, "flex");
      assert.ok(short.shellMin >= height);
      checks++;
    }
    for (const route of ["/exam-guide/", "/pricing/", "/magazine/opic-survey-choice-guide/", "/mypage/", "/ai-settings/", "/training/setup/", "/training/scripts/", "/roleplay/", "/practice/", "/practice/quick/", "/practice/mock/"]) {
      await visit(route);
      const isPublic = /^\/(exam-guide|pricing|magazine)\//.test(route);
      assert.equal(await page.locator("footer").count(), isPublic ? 1 : 0, route);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} has no horizontal overflow`);
      if (isPublic) {
        const geometry = await page.evaluate(() => {
          const main = document.querySelector("main");
          const frame = main.querySelector("[data-page-width]");
          const footer = document.querySelector("footer");
          const footerFrame = footer.firstElementChild;
          const contentX = (el) => el.getBoundingClientRect().x + parseFloat(getComputedStyle(el).paddingLeft);
          return { mainBottom: main.getBoundingClientRect().bottom, footerTop: footer.getBoundingClientRect().top, bodyX: contentX(frame), footerX: contentX(footerFrame) };
        });
        assert.ok(geometry.footerTop >= geometry.mainBottom - 1, `${route} footer follows content`);
        assert.ok(Math.abs(geometry.bodyX - geometry.footerX) <= 1, `${route} footer aligns to body`);
      }
      checks++;
    }
    if (width >= 1024) {
      for (const route of ["/mypage/", "/training/scripts/", "/exam-guide/"]) {
        await visit(route);
        if (await page.getByRole("button", { name: "사이드바 접기", exact: true }).count()) {
          await page.getByRole("button", { name: "사이드바 접기", exact: true }).click();
        }
        const quote = page.getByRole("button", { name: /^오늘의 한 문장:/ });
        await quote.focus();
        await page.keyboard.press("Enter");
        assert.equal(await quote.getAttribute("aria-expanded"), "true");
        assert.ok(await page.locator("#sidebar-daily-sentence").isVisible());
        assert.ok(await page.locator("#sidebar-daily-sentence").evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
        }), "sentence disclosure paints above page content");
        await page.keyboard.press("Escape");
        assert.equal(await quote.getAttribute("aria-expanded"), "false");
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        const sidebar = await page.locator("aside[data-sidebar-collapsed]").boundingBox();
        assert.ok(Math.abs(sidebar.height - height) <= 1);
        const utilities = await page.locator("[data-sidebar-utilities]").boundingBox();
        assert.ok(utilities.y + utilities.height <= height);
        if (route.startsWith("/training/")) {
          const header = await page.locator("[data-main-column] > header").boundingBox();
          assert.ok(Math.abs(header.y) <= 1, "training header stays at the top on long content");
          assert.ok(header.x >= sidebar.x + sidebar.width - 1);
        }
        checks++;
      }
    } else {
      await visit("/training/setup/");
      await page.getByRole("button", { name: "메뉴 열기", exact: true }).click();
      const drawer = page.getByRole("dialog", { name: "모바일 메뉴" });
      assert.ok(await drawer.isVisible());
      assert.equal(await drawer.getByRole("button", { name: /사이드바 접기|사이드바 펼치기/ }).count(), 0);
      await page.keyboard.press("Escape");
      assert.equal(await drawer.count(), 0);
      assert.ok(await page.getByRole("button", { name: "메뉴 열기", exact: true }).evaluate((el) => el === document.activeElement));
      checks++;
    }
  }
  console.log(`Layout browser checks passed: ${checks} route/fixture/interaction cases.`);
} finally {
  await browser.close();
}
