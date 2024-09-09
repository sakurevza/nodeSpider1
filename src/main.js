const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

var {timeout, removeDuplicatesByTitle} = require('../tools/tools.js');
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
        if (el.indexOf('resource/breakingnews')>-1) {
        return el
        }
    })?.[0]
    // console.log('breakingnewspage2',breakingnewspage);
    let detaliPage = [];

    try {
        //遍历最新分页
        let getDetaliPageFn = async (newPage = 'https://gostake.io/resource/breakingnews/467#refresh')=>{
            await page.goto(newPage);
            //设置尺寸
            await page.setViewport({width: 1080, height: 1024});
            await timeout(delay);
    
            //获取详细内容
            let Pages = await page.evaluate(() => {
                var list = [...document.querySelectorAll('.post-body h5')].map(el=>{
                    let href = el.querySelectorAll('a')?.[1].href;
                    let title = el.querySelectorAll('a')?.[1].innerText;
                    let time = el.querySelector('code')?.innerHTML;
                    return{
                        href,title,time
                    }
                })
                return list;
            });

            detaliPage = detaliPage.concat(Pages);
            let lastPageDataNum = Number(detaliPage[detaliPage.length-1]?.time.split(" ")[0].slice(-2)) -1;

            if (lastPageDataNum === new Date().getDate()) {
                let _newPageNumber = Number(newPage.split('#') [0].split('/')[5]);
                getDetaliPageFn(`https://gostake.io/resource/breakingnews/${_newPageNumber}#refresh`)
            }
        }

        await getDetaliPageFn(breakingnewspage);
        detaliPage = removeDuplicatesByTitle(detaliPage);

        const dataDir = path.join(__dirname, 'src', 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        // 指定文件路径
        const filePath = path.join(__dirname, 'data.json');
        // // 异步写入JSON数据到文件
        // fs.writeFile(filePath, JSON.stringify(detaliPage, null, 2), 'utf8', (err) => {
        // if (err) {
        //     console.error('Error writing JSON to file:', err);
        //     return;
        // }
        // console.log('JSON data has been saved to', filePath);
        // });


        // 检查文件是否存在，如果存在则删除
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting existing JSON file:', err);
                return;
            }
            // 文件已删除，现在可以写入新数据
            writeDataToFile();
            });
        } else {
            // 文件不存在，直接写入新数据
            writeDataToFile();
        }
        
        // 写入数据到文件的函数
        function writeDataToFile() {
            fs.writeFile(filePath, JSON.stringify(detaliPage, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing JSON to file:', err);
                return;
            }
            console.log('JSON data has been saved to', filePath,'数据条数',detaliPage.length);
            });
        }

    } catch (error) {
        console.log(error)
    }

    // browser.close();
})();


//文档地址 https://pptr.nodejs.cn/guides/getting-started
//爬取地址 https://gostake.io/