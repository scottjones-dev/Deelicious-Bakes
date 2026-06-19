import { expect, test } from "@playwright/test";

test.describe("public smoke flows", () => {
  test("loads sign in page", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByText("Deelicious Bakes").first()).toBeVisible();
  });

  test("loads terms page", async ({ page }) => {
    await page.goto("/terms");
    await expect(
      page.getByRole("heading", { name: "Terms of Service" }),
    ).toBeVisible();
  });

  test("loads cart page shell", async ({ page }) => {
    await page.goto("/cart");
    await expect(
      page.getByRole("heading", { name: "Your cart" }),
    ).toBeVisible();
  });

  test("redirects unauthenticated users away from admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin/);
  });
});
