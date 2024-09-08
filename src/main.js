const puppeteer = require('puppeteer');
var {timeout} = require('../tools/tools.js');
var delay = 1000;

(async() => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://gostake.io/');
    //设置尺寸
    await page.setViewport({width: 1080, height: 1024});
    await timeout(delay);

    var link = await page.$('.link-grid div>a');
    console.log('link',link)

    let pages = await page.evaluate(() => {
        var list = [...document.querySelectorAll('.link-grid div a')].map((el)=>{
            let href = el.href.trim();
            return href
        });
        return list;
    });

    let breakingnewspage = pages.filter(el=>{
        if (el.indexOf('resource/news')>-1) {
        return el
        }
    })?.[0]
    // console.log('breakingnewspage2',breakingnewspage);

    try {
        await page.goto(breakingnewspage);
        //设置尺寸
        await page.setViewport({width: 1080, height: 1024});
        await timeout(delay);

        //获取详细内容
        let detaliPage = await page.evaluate(() => {
            var list = [...document.querySelectorAll('.post-body h5')].map(el=>{
                let href = el.querySelectorAll('a')?.[1].href;
                let title = el.querySelectorAll('a')?.[1].innerText;
                let code = el.querySelector('code')?.innerHTML;
                return{
                    href,title,code
                }
            })
            return list;
        });

        console.log('detaliPage',detaliPage)

    } catch (error) {
        
    }

    // browser.close();
})();


