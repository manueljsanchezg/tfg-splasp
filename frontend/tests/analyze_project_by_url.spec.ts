import { test } from "@playwright/test";

test("test", async ({ page }) => {
	await page.goto("http://localhost:5173/");
	await page.getByRole("link", { name: "Analyze" }).click();
	await page.getByRole("textbox").click();
	await page
		.getByRole("textbox")
		.fill(
			"https://snap.berkeley.edu/project?username=javclamar&projectname=Maze%20with%20features%20%28to%20fork%29%20Javclamar",
		);
	await page.getByRole("button", { name: "Analyze" }).click();
	await page.getByRole("button", { name: "View analysis metrics" }).click();
});
