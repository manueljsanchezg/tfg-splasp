import { test, expect } from "@playwright/test";

test("Create session and assert it appears", async ({ page }) => {
	await page.goto("http://localhost:5173/login");
	await page.getByRole("textbox", { name: "Your username" }).fill("user1");
	await page.getByRole("textbox", { name: "Your password" }).fill("1234");
	await page.getByRole("button", { name: "Sign In" }).click();

	await page.getByRole("link", { name: "Sessions" }).click();
	await page.getByRole("button", { name: "Create Session" }).click();

	await page
		.getByRole("textbox", { name: "e.g., Advanced Programming" })
		.fill("New session test");
	await page.locator('input[name="startDate"]').fill("2026-02-02T10:00");
	await page.locator('input[name="endDate"]').fill("2027-02-02T10:00");

	await page
		.getByRole("dialog")
		.getByRole("button", { name: "Create Session" })
		.click();

	await expect(
		page.getByRole("cell", { name: "New session test" }).first(),
	).toBeVisible();
});
