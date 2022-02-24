const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();

const BROWSER_HEAD = process.env.NODE_ENV === 'production';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (HTML, like Gecko) Chrome/97.0.4692.99 Mobile Safari/537.36';
const BROWSER_WIDTH = 1920;
const BROWSER_HEIGHT = 1080;
const URL = "https://youtube.com";

const crawler = async () => {
  try {
    const browser_fetcher = puppeteer.createBrowserFetcher();
    const revision_info = await browser_fetcher.download(737173);

    let browser = await puppeteer.launch({
      headless: BROWSER_HEAD,
      executablePath: revision_info.executablePath,
      args: [`--window-size=${BROWSER_WIDTH},${BROWSER_HEIGHT}`, '--disable-notifications'],
    });
    let page = await browser.newPage();
    await page.setViewport({width: BROWSER_WIDTH, height: BROWSER_HEIGHT});
    await page.goto(URL);
    await page.waitForResponse(res => res.status() === 200);
    await page.waitForTimeout(5000);
    // await page.close();
    // await browser.close();
  } catch (err) {
    console.error(err)
  }

}

crawler();