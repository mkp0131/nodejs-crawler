const puppeteer = require('puppeteer');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const db = require('./models');

const BROWSER_HEAD = process.env.NODE_ENV === 'production';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (HTML, like Gecko) Chrome/97.0.4692.99 Mobile Safari/537.36';
const BROWSER_WIDTH = 1920;
const BROWSER_HEIGHT = 1080;
const URL = "https://facebook.com";

const crawler = async () => {
  await db.sequelize.sync();
  try {
    const result = [];

    let browser = await puppeteer.launch({ 
      headless: BROWSER_HEAD,
      args: [`--window-size=${BROWSER_WIDTH},${BROWSER_HEIGHT}`, '--disable-notifications'],
    });

    let page = await browser.newPage();
    await page.setViewport({width: BROWSER_WIDTH, height: BROWSER_HEIGHT});
    await page.goto(URL);

    await page.waitForResponse(res => res.status() === 200)

    // 계정 로그인
    await page.type("#email", process.env.FACEBOOK_ID);
    await page.type("#pass", process.env.FACEBOOK_PW);
    await page.click("button[name=login]");
    await page.waitForResponse(res => res.url().includes("www.facebook.com") && res.headers()['content-type'].includes("text/html") && res.status() === 200)
    await page.waitForTimeout(5000);

    // 피드 크롤링 (작성자, 피드내용, 이미지 src)


    // 계정 로그아웃
    await page.click("div[aria-label=계정]");
    await page.waitForSelector("div[data-nocookies=true]");
    await page.click("div[data-nocookies=true]");
    await page.waitForTimeout(5000);

    await page.close();
    await browser.close();
  }
  catch(e) {
    console.error(e);
  }

}

crawler();