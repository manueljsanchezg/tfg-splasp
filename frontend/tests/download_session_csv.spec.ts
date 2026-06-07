import { test, expect } from "@playwright/test";

test("Download session CSV and assert filename", async ({ page }) => {
	await page.goto("http://localhost:5173/login");
	await page.getByRole("textbox", { name: "Your username" }).fill("user1");
	await page.getByRole("textbox", { name: "Your password" }).fill("1234");
	await page.getByRole("button", { name: "Sign In" }).click();

	await page.getByRole("link", { name: "Sessions" }).click();

	const rowSession1 = page.getByRole("row", { name: /Session 1/i }).first();
	await rowSession1.getByRole("button", { name: "View" }).click();

	await expect(
		page.getByRole("button", { name: "Download csv" }),
	).toBeVisible();

	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("button", { name: "Download csv" }).click();
	const download = await downloadPromise;

	expect(download.suggestedFilename()).toMatch(/^projects.*\.csv$/);
});
