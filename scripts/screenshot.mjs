import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const SCREENSHOTS_DIR = "C:/Users/tuğba/.gemini/antigravity-ide/brain/da54f66f-53da-40a4-9122-6e2370336b4d/screenshots";
const BASE_URL = "http://localhost:3000";

const PAGES = [
  { path: "/tr", name: "homepage" },
  { path: "/tr/calismalar", name: "works" },
  { path: "/tr/calismalar/gelinlik-abiye", name: "sector_detail" },
  { path: "/tr/hizmetler", name: "services" },
  { path: "/tr/hakkimizda", name: "about" },
  { path: "/tr/iletisim", name: "contact" },
  { path: "/admin", name: "admin_login" }
];

const VIEWPORTS = [
  { width: 1920, height: 1080, name: "desktop" },
  { width: 375, height: 812, name: "mobile", isMobile: true }
];

async function run() {
  // Ensure screenshots directories exist
  for (const vp of VIEWPORTS) {
    const dir = path.join(SCREENSHOTS_DIR, vp.name);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();

    for (const pageInfo of PAGES) {
      console.log(`Processing page: ${pageInfo.path}`);
      for (const vp of VIEWPORTS) {
        console.log(`- Setting viewport: ${vp.name} (${vp.width}x${vp.height})`);
        
        await page.setViewport({
          width: vp.width,
          height: vp.height,
          isMobile: vp.isMobile || false,
          hasTouch: vp.isMobile || false
        });

        const targetUrl = `${BASE_URL}${pageInfo.path}`;
        console.log(`- Navigating to ${targetUrl}`);
        
        try {
          await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 120000 });
          // Give dynamic components or animations a bit of time to render
          await new Promise((r) => setTimeout(r, 2000));
          
          const screenshotPath = path.join(SCREENSHOTS_DIR, vp.name, `${pageInfo.name}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`- Captured screenshot: ${screenshotPath}`);
        } catch (navigateErr) {
          console.error(`- Failed to navigate/capture ${pageInfo.path} in ${vp.name} view:`, navigateErr.message);
        }
      }
    }
  } finally {
    console.log("Closing browser...");
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Fatal error running screenshot script:", err);
  process.exit(1);
});
