# Node JS 크롤링

## 사람처럼 인식시키기 위한 TIP

1. page.type or page.click 을 사용하지 않고, 마우스를 수동으로 이동하고, 키보드를 수동으로 한글자씩 적어서 사람인척한다.
2. page.mouse.click, page.mouse.down. page.mouse.up, page.keyboard.press, page.keyboard.down, page.keyboard.up

```js
// 크롤링시 마우스 움직임을 눈으로 확인 할 수 있는 스크립트
// 원하는 곳에서 복사해서 사용!

const box = document.createElement('div');
box.classList.add('mouse-helper');
const styleElement = document.createElement('style');
styleElement.innerHTML = `
  .mouse-helper {
    pointer-events: none;
    position: absolute;
    z-index: 100000;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    background: rgba(0,0,0,.4);
    border: 1px solid white;
    border-radius: 10px;
    margin-left: -10px;
    margin-top: -10px;
    transition: background .2s, border-radius .2s, border-color .2s;
  }
  .mouse-helper.button-1 {
    transition: none;
    background: rgba(0,0,0,0.9);
  }
  .mouse-helper.button-2 {
    transition: none;
    border-color: rgba(0,0,255,0.9);
  }
  .mouse-helper.button-3 {
    transition: none;
    border-radius: 4px;
  }
  .mouse-helper.button-4 {
    transition: none;
    border-color: rgba(255,0,0,0.9);
  }
  .mouse-helper.button-5 {
    transition: none;
    border-color: rgba(0,255,0,0.9);
  }
  `;
document.head.appendChild(styleElement);
document.body.appendChild(box);
document.addEventListener('mousemove', event => {
  box.style.left = event.pageX + 'px';
  box.style.top = event.pageY + 'px';
  updateButtons(event.buttons);
}, true);
document.addEventListener('mousedown', event => {
  updateButtons(event.buttons);
  box.classList.add('button-' + event.which);
}, true);
document.addEventListener('mouseup', event => {
  updateButtons(event.buttons);
  box.classList.remove('button-' + event.which);
}, true);
function updateButtons(buttons) {
  for (let i = 0; i < 5; i++)
    box.classList.toggle('button-' + i, !!(buttons & (1 << i)));
}
```

```js
// alert 처리
page.on('dialog', async (dialog) => {
  console.log(dialog.type(), dialog.message());
  await dialog.accept(); // accept는 confirm의 확인, dismiss는 취소
});
```

3. await page.waitForNavigation(): 페이지전환을 기다린다.
4. userDataDir: 유저 데이터를 설정(로그인 유지 가능)

```js
puppeteer.launch({
  userDataDir: './myUserDataDir',
})
```

5. chromium version 변경

```js
    const browser_fetcher = puppeteer.createBrowserFetcher();
    const revision_info = await browser_fetcher.download(737173);

    let browser = await puppeteer.launch({
      headless: BROWSER_HEAD,
      executablePath: revision_info.executablePath,
      args: [`--window-size=${BROWSER_WIDTH},${BROWSER_HEIGHT}`, '--disable-notifications'],
    });
```

6. 버전확인은 history 사이트를 이용 or check_availability.js 를 이용하여 체크!
> 버전 history: https://vikyd.github.io/download-chromium-history-version/#/

7. 모든 스크립트가 완료되어야 크롤링이 가능할 경우 waitUntil 옵션을 사용 (단, youtube 와 같은 동영상로드가 지속적으로 이루어지는 사이트에서는 사용 X)
```js
  page.goto(url, waitUntil: 'networkidle0');
```
