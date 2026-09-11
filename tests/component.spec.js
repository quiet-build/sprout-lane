import { test, expect } from "@playwright/test";

const tag = "pma-sprout-lane";

test("embedded mount leaves the main landmark to the host, standalone retains one", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => window.ready.length)).toBe(1);
  await expect(page.locator(tag).locator("main, [role=main]")).toHaveCount(0);
  await page.goto("http://127.0.0.1:5311/");
  await expect(page.locator("main")).toHaveCount(1);
});

test("pause, plant, restart, and remount keep one live session", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => window.ready.length)).toBe(1);
  const game = page.locator(tag);
  await expect(game.locator("#sunText")).toHaveText("200");
  await game.getByRole("button", { name: /Podling/ }).click();
  await game.locator("canvas").click({ position: { x: 120, y: 120 } });
  await expect(game.locator("#sunText")).toHaveText("100");
  await page.evaluate(name => document.querySelector(name).pause(), tag);
  await expect(game.locator(".app")).toHaveAttribute("data-paused", "1");
  await game.getByRole("button", { name: "Restart" }).click();
  await expect(game.locator("#sunText")).toHaveText("200");
  await page.evaluate(name => {
    document.querySelector(name).remove();
    document.querySelector("#player").append(document.createElement(name));
  }, tag);
  await expect.poll(() => page.evaluate(() => window.ready.length)).toBe(2);
  await expect(page.locator(`${tag} canvas`)).toHaveCount(1);
  expect(errors).toEqual([]);
});
