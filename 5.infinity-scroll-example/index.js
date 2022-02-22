const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');

const BROWSER_HEAD = process.env.NODE_ENV === 'production';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Mobile Safari/537.36';
const BREWSER_WIDTH = 1920;
const BREWSER_HEIGHT = 1080;
const URL = "https://unsplash.com";
const LIMIT = 10;

fs.readdir('images', (err) => {
  if(err) {
    console.error('images 폴더를 생성합니다.');
    fs.mkdir('images', err => {
      console.error('images 폴더를 생성실패');
    });
  }
});

const crawler = async () => {
  try {
    
    const browser = await puppeteer.launch({ 
      headless: BROWSER_HEAD,
      args: [`--window-size=${BREWSER_WIDTH},${BREWSER_HEIGHT}`],
    });

    const page = await browser.newPage();
    await page.setViewport({width: BREWSER_WIDTH, height: BREWSER_HEIGHT});
    await page.goto(URL);
    await page.waitForTimeout(1000);

    let result = [];

    while (result.length < LIMIT) {
  
      const img_arr = await page.evaluate(() => {
      
        const imgs = [];
      
        const img_containers = document.querySelectorAll('.MorZF');
        img_containers.forEach(img_container => {
          const img = img_container.querySelector('img');
          if (img.src) imgs.push(img.src);
          img_container.parentNode.removeChild(img_container);
        });

        window.scrollBy(0, 100);

        return imgs;
      });

      result = result.concat(img_arr);


      await page.waitForSelector('.MorZF');
      console.log('새이미지 로딩완료');
    }

    console.log(result);

    await page.close();
    await browser.close();

    result.forEach( async (img_src) => {
      const img_buffer = await axios.get(img_src, {
        responseType: 'arraybuffer'
      });
      const img_ext = img_buffer.headers['content-type'].match(/\/.*$/)[0].substring(1);
  
      fs.writeFileSync(`images/${new Date().valueOf()}.${img_ext}`, img_buffer.data);
    })

  } catch (error) {
    console.error(error);
  }


}

crawler();