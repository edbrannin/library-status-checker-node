const util = require('util')

const puppeteer = require('puppeteer');

const loadConfig = async () => {

}

const IGNORE_AJAX = [
  "branch/branchLimits?",
  ".png",
  "tationLocation/thisBranch",
  "ssl.google-analytics.com",
  "ocationConfiguration/getIfChanged",
  "/tmpl/",
]

const getAccountInfo = async (number, lastName) => {
  try {
    console.log("Getting browser.");
    const browser = await puppeteer.launch({
      //args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    console.log("Going to page");
    await page.goto('https://catalogplus.libraryweb.org/?section=myAccount');

    page.waitForSelector('.innerLoginForm #barcode', { visible: true });
    await page.focus('.innerLoginForm #barcode');
    await page.type(number);
    await page.focus('.innerLoginForm #lastName');
    await page.type(lastName);
    await page.screenshot({path: `login-${number}.png`});

    page.on('response', async response => {
      const url = response.request().url;
      for (var i = 0; i < IGNORE_AJAX.length; i += 1) {
        // Supposedly faster than forEach
        if (url.includes(IGNORE_AJAX[i])) {
          return;
        }
      }
      if (response.headers['content-type'].startsWith('image/')) {
        return;
      }
      console.log();
      console.log("==========");
      console.log(`Got response from ${url}`);
      console.log("Headers:", response.headers);
      try {
        if (false) {
          console.log("Text");
          console.log(await response.text());
        }
        console.log("JSON");
        console.log(util.inspect(await response.json(), {depth: null }));
      } catch (e) {
        console.error(`Error trying to log JSON from ${url}`, e);
      }
    });

    await page.waitForNavigation({ waitUntil: 'networkidle' });

    await page.waitForSelector('#submitLoginFormButton', { visible: true });
    await page.click('#submitLoginFormButton');
    await page.screenshot({path: `logged-in-${number}.png`});

    try{
      await page.waitForSelector('#accountActivity_tab', { visible: true });
      await page.waitFor(1000);
      await page.click('#accountActivity_tab');
    } catch (e) {
      console.error("Error waiting for account activity", e);
      await page.screenshot({path: `login-error-${number}.png`});
    }


    // console.log(await page.content());
    await page.screenshot({path: 'screenshot.png'});


    console.log("Waiting 10 seconds to wrap up....");
    await page.waitFor(10000);

    console.log("Cleaning up.");
    await page.close();
    await browser.close();
  } catch (e) {
    console.error("Error getting loans", e);
    console.error("Stack:", e.stack);
  }
}


const main = async () => {
  try {
    getAccountInfo('TODO', 'TODO');
  } catch (e) {
    console.error("Error getting account info", e);
  }
}

main();
