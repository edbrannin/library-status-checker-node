const puppeteer = require('puppeteer');

const loadConfig = async () => {

}

const IGNORE_AJAX = [
  "branch/branchLimits?",
  ".png",
]

const getAccountInfo = async (number, lastName) => {
  try {
  console.log("Getting browser.");
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});

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
    console.log();
    console.log("==========");
    console.log(`Got response from ${url}`);
    // console.log(await response.text());
    try {
      console.log(await response.json());
    } catch (e) {
      console.error(`Error trying to log JSON: ${e}`);
    }
  });

  page.waitForSelector('#submitLoginFormButton', { visible: true });
  await page.click('#submitLoginFormButton');
  await page.screenshot({path: `logged-in-${number}.png`});

  try{
    page.waitForSelector('#accountActivity_tab', { visible: true });
    await page.click('#accountActivity_tab');
  } catch (e) {
    console.error("Error waiting for account activity", e);
    await page.screenshot({path: `login-error-${number}.png`});
  }


  // console.log(await page.content());
  await page.screenshot({path: 'screenshot.png'});

  await page.close();
  await browser.close();
  } catch (e) {
    console.error("Error getting loans", e);
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
