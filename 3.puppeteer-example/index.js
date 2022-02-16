const puppeteer = require('puppeteer');

const BROWSER_HEAD = process.env.NODE_ENV === 'production';

const crawler = async () => {
  const browser = await puppeteer.launch({ headless: BROWSER_HEAD });
  
  const [page, page1, page2] = await Promise.all([
    browser.newPage(),
    browser.newPage(),
    browser.newPage(),
  ]);

  await Promise.all([
    page.goto('https://naver.com'),
    page1.goto('https://naver.com'),
    page2.goto('https://naver.com'),
  ])
  
  await Promise.all([
    page.waitForTimeout(3000),
    page1.waitForTimeout(3000),
    page2.waitForTimeout(3000),
  ])

  await Promise.all([
    page.close(),
    page1.close(),
    page2.close(),
  ])

  await browser.close();
}

crawler();