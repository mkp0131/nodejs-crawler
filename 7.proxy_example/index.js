const puppeteer = require('puppeteer');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const BROWSER_HEAD = process.env.NODE_ENV === 'production';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Mobile Safari/537.36';
const BREWSER_WIDTH = 1920;
const BREWSER_HEIGHT = 1080;
const URL = "https://facebook.com";

const crawler = async () => {

  try {
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

    await Promise.all(proxy_list.map( async (v) => {
      console.log(v);
      return db.Proxy.create({
        ip: v.ip,
        type: v.type,
        latency: v.latency,
      })
    }));

  }
  catch(e) {
    console.error(e);
  }

}

crawler();