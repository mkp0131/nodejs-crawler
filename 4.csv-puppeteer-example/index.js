const puppeteer = require('puppeteer');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');
const axios = require('axios');

const BROWSER_HEAD = process.env.NODE_ENV === 'production';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Mobile Safari/537.36';
const BREWSER_WIDTH = 1920;
const BREWSER_HEIGHT = 1080;

const csv = fs.readFileSync('data/data.csv');
const records = parse(csv.toString('utf-8'));

fs.readdir('screenshot', (err) => {
  if(err) {
    console.error('screenshot 폴더를 생성합니다.');
    fs.mkdir('screenshot');
  }
})

fs.readdir('poster', (err) => {
  if(err) {
    console.error('poster 폴더를 생성합니다.');
    fs.mkdir('poster');
  }
})

const crawler = async () => {

  try {
    const result = [];

    const browser = await puppeteer.launch({ 
      headless: BROWSER_HEAD,
      args: [`--window-size=${BREWSER_WIDTH},${BREWSER_HEIGHT}`],
    });
  
    await Promise.all(records.map( async (r, i) => {
      try {
        const URL = r[1];
        const page = await browser.newPage();
        // await page.setUserAgent(USER_AGENT);
        await page.setViewport({width: BREWSER_WIDTH, height: BREWSER_HEIGHT});
        await page.goto(URL);
        await page.waitForTimeout(1000);
        const els = await page.evaluate(() => {
          const score = document.querySelector('.score_left .star_score');
          const poster = document.querySelector('.poster img');
          return {
            score: score ? score.textContent.trim() : 0,
            poster: poster ? poster.src.replace(/\?.*$/, '') : '',
          };
        });
        result[i] = [r[0], r[1], els.score, els.poster];
        await page.screenshot({path: `screenshot/${r[0]}.png`, fullPage: true});
        await page.close();

        if(els.poster) {
          const poster = await axios.get(els.poster, {
            responseType: 'arraybuffer'
          });
          fs.writeFileSync(`poster/${r[0]}.jpg`, poster.data);
        }
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
  
}

crawler();