import { test, expect } from "@playwright/test";

test("plants a podling, pauses, and restart restores sun", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sprout Lane" })).toBeVisible();
  await expect(page.locator("#game canvas")).toBeVisible();
  await expect(page.locator("#sunText")).toHaveText("200");
  await page.getByRole("button", { name: /Podling/ }).click();
  await expect(page.locator("#message")).toContainText("own row");
  await page.locator("#game canvas").click({ position: { x: 120, y: 120 } });
  await expect(page.locator("#sunText")).toHaveText("100");
  await expect(page.locator(".app")).toHaveAttribute("data-plants", "1");
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.locator(".app")).toHaveAttribute("data-paused", "1");
  await expect(page.getByRole("heading", { name: "Bugs are frozen." })).toBeVisible();
  await page.getByRole("button", { name: "Restart" }).click();
  await expect(page.locator("#sunText")).toHaveText("200");
  await expect(page.locator(".app")).toHaveAttribute("data-plants", "0");
  await expect(page.locator(".app")).toHaveAttribute("data-paused", "0");
});
