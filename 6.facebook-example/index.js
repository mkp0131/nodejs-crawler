const puppeteer = require('puppeteer');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const db = require('./models');

const BROWSER_HEAD = process.env.NODE_ENV === 'production';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Mobile Safari/537.36';
const BREWSER_WIDTH = 1920;
const BREWSER_HEIGHT = 1080;
const URL = "https://facebook.com";

const crawler = async () => {
  await db.sequelize.sync();
  try {
    const result = [];

    let browser = await puppeteer.launch({ 
      headless: BROWSER_HEAD,
      args: [`--window-size=${BREWSER_WIDTH},${BREWSER_HEIGHT}`, '--disable-notifications'],
    });

    let page = await browser.newPage();
    await page.setViewport({width: BREWSER_WIDTH, height: BREWSER_HEIGHT});
    await page.goto("https://spys.one/free-proxy-list/KR/");
    await page.waitForTimeout(5000);
  
    let proxy_list = await page.evaluate(() => {
      const result = [];
      const txt_tr_list = document.querySelectorAll('table > tbody > tr > td > table > tbody > tr:nth-child(n+4)');
      txt_tr_list.forEach((txt_tr, i)=> {
        if(i > 29) return;
        const ip = txt_tr.querySelector('td:nth-child(1) > .spy14').textContent.replace(/document.write\(.*\)/, '');
        const type = txt_tr.querySelector('td:nth-child(2)').textContent;
        const latency = txt_tr.querySelector('td:nth-child(6)').textContent;

        result.push(
          {
            ip,
            type,
            latency,
          }
        );
      });
      return result;
    });


    await page.close();
    await browser.close();

    proxy_list = proxy_list.filter(proxy => proxy.type.includes("HTTP")).sort((a, b) => a.latency - b.latency);

    // await Promise.all(proxy_list.map( async (v) => {
    //   console.log(v);
    //   return db.Proxy.create({
    //     ip: v.ip,
    //     type: v.type,
    //     latency: v.latency,
    //   })
    // }))
    proxy_list.forEach(v => {
      db.Proxy.create({
        ip: v.ip,
        type: v.type,
        latency: v.latency,
      })
    })

    return;

    browser = await puppeteer.launch({ 
      headless: BROWSER_HEAD,
      args: [`--window-size=${BREWSER_WIDTH},${BREWSER_HEIGHT}`, '--disable-notifications'],
    });

    page = await browser.newPage();
    await page.setViewport({width: BREWSER_WIDTH, height: BREWSER_HEIGHT});
    await page.goto(URL);

    await page.waitForResponse(res => res.status() === 200)
    
    await page.type("#email", process.env.FACEBOOK_ID);
    await page.type("#pass", process.env.FACEBOOK_PW);
    await page.click("button[name=login]");

    await page.waitForResponse(res => res.url().includes("www.facebook.com") && res.headers()['content-type'].includes("text/html") && res.status() === 200)
    await page.waitForTimeout(5000);
    
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