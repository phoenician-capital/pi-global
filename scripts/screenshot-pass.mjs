import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "/tmp/pi-global-shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
});

async function shot(name) {
  const path = join(OUT, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  console.log("wrote", path);
}

await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await shot("01-map-onboarding");

// Dismiss guide if present
const dismiss = page.getByRole("button", { name: "Dismiss" });
if (await dismiss.count()) {
  await dismiss.click();
  await page.waitForTimeout(300);
}
await shot("02-map-clean");

// Default map should already show AI vendors (DeepSeek/Claude)
await shot("03-map-ai-vendors-default");

// Show market vendors too
const vendors = page.getByRole("button", { name: /Show market vendors|Hide market vendors/ });
if (await vendors.count()) {
  const label = await vendors.first().innerText();
  if (label.includes("Show")) {
    await vendors.first().click();
    await page.waitForTimeout(400);
  }
}
await shot("03b-map-all-vendors");

// Select Portfolio API node by clicking map text
await page.getByText("Portfolio API", { exact: true }).first().click({ timeout: 5000 }).catch(async () => {
  // fallback: open palette and pick
  await page.keyboard.press("Meta+k");
  await page.waitForTimeout(200);
  await page.keyboard.type("Portfolio API");
  await page.waitForTimeout(300);
  await page.keyboard.press("Enter");
});
await page.waitForTimeout(500);
await shot("04-selected-portfolio-api");

// Inside each product
await page.getByRole("button", { name: "Inside each product", exact: true }).click();
await page.waitForTimeout(700);
await shot("05-inside-products");

// Journeys
await page.getByRole("button", { name: "Journeys", exact: true }).click();
await page.waitForTimeout(700);
await shot("06-journeys");

// Blast radius view (nav)
await page.getByTitle("What breaks if this piece fails").click();
await page.waitForTimeout(500);
const tryBtn = page.getByRole("button", { name: /Try / });
if (await tryBtn.count()) {
  await tryBtn.first().click();
  await page.waitForTimeout(1200);
}
await shot("07-blast-radius");

// By business
await page.getByRole("button", { name: "By business", exact: true }).click();
await page.waitForTimeout(700);
await shot("08-by-business");

// Data flow + Dependencies
await page.getByRole("button", { name: "Data flow", exact: true }).click();
await page.waitForTimeout(600);
await shot("09-dataflow");

await page.getByRole("button", { name: "Dependencies", exact: true }).click();
await page.waitForTimeout(600);
await shot("10-dependencies");

// Detail panel with DeepSeek edge visible from Portfolio API
await page.getByRole("button", { name: "Map", exact: true }).click();
await page.waitForTimeout(400);
const dismiss2 = page.getByRole("button", { name: "Dismiss" });
if (await dismiss2.count()) await dismiss2.click();
await page.keyboard.press("Meta+k");
await page.waitForTimeout(250);
await page.keyboard.type("Portfolio API");
await page.waitForTimeout(350);
await page.keyboard.press("Enter");
await page.waitForTimeout(600);
await shot("11-portfolio-detail");

// Mobile
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Map", exact: true }).click();
await page.waitForTimeout(600);
await shot("12-mobile-map");

await browser.close();
console.log("done");
