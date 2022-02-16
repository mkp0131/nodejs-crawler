const puppeteer = require('puppeteer');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

const BROWSER_HEAD = process.env.NODE_ENV === 'production';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Mobile Safari/537.36';

const csv = fs.readFileSync('data/data.csv');
const records = parse(csv.toString('utf-8'));


const crawler = async () => {

  try {
    const result = [];

    const browser = await puppeteer.launch({ headless: BROWSER_HEAD });
  
    await Promise.all(records.map( async (r, i) => {
      try {
        const URL = r[1];
        const page = await browser.newPage();
        await page.setUserAgent(USER_AGENT);
        await page.goto(URL);
        await page.waitForTimeout(1000);
        const score_txt =  await page.evaluate(() => {
          const score = document.querySelector('.score_left .star_score');
          return score ? score.textContent.trim() : 0;
        });
        result[i] = [r[0], r[1], score_txt];
        await page.close();
      } catch (e) {
        console.error(e);
      }
    }));
  
    await browser.close();
    const str = stringify(result);
    fs.writeFileSync('data/result.csv', str);
  }
  catch(e) {
    console.error(e);
  }
  
  // const [page, page1, page2] = await Promise.all([
  //   browser.newPage(),
  //   browser.newPage(),
  //   browser.newPage(),
  // ]);

  // await Promise.all([
  //   await page.goto('https://naver.com'),
  //   await page1.goto('https://naver.com'),
  //   await page2.goto('https://naver.com'),
  // ])
  
  // await Promise.all([
  //   await page.waitForTimeout(3000),
  //   await page1.waitForTimeout(3000),
  //   await page2.waitForTimeout(3000),
  // ])

  // await Promise.all([
  //   await page.close(),
  //   await page1.close(),
  //   await page2.close(),
  // ])

  // await browser.close();

}

crawler();