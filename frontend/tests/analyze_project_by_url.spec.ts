import { test, expect } from "@playwright/test";

test("Analyze project by URL and assert completion", async ({ page }) => {
	await page.goto("http://localhost:5173/");
	await page.getByRole("link", { name: "Analyze" }).click();

	const snapUrl =
		"https://snap.berkeley.edu/project?username=javclamar&projectname=Maze%20with%20features%20%28to%20fork%29%20Javclamar";
	await page.getByRole("textbox").fill(snapUrl);

	await page.getByRole("button", { name: "Analyze" }).click();

	const viewMetricsBtn = page.getByRole("button", {
		name: "View analysis metrics",
	});
	await expect(viewMetricsBtn).toBeVisible({ timeout: 20000 });

	await viewMetricsBtn.click();

	await expect(
		page
			.getByRole("heading", { name: /Analysis Results/i })
			.or(page.getByText(/Metrics/i))
			.first(),
	).toBeVisible();
});
