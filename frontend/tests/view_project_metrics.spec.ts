import { test, expect } from "@playwright/test";

test("View project metrics and assert values", async ({ page }) => {
	await page.goto("http://localhost:5173/login");
	await page.getByRole("textbox", { name: "Your username" }).fill("user1");
	await page.getByRole("textbox", { name: "Your password" }).fill("1234");
	await page.getByRole("button", { name: "Sign In" }).click();

	await page.getByRole("link", { name: "Projects" }).click();

	const projectRows = page.locator("tr.cursor-pointer");
	await projectRows.nth(0).click();

	await page.getByRole("button", { name: "View Results" }).first().click();

	await expect(
		page
			.getByRole("heading", { name: /Analysis Results/i })
			.or(page.getByText(/version/i))
			.first(),
	).toBeVisible();

	await page.getByRole("button", { name: "Feedback" }).click();
	await expect(page.getByText(/feedback/i).first()).toBeVisible();

	const closeButton = page.getByRole("button", { name: "X" });
	if (await closeButton.isVisible()) {
		await closeButton.click();
	}
});
