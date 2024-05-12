let puppeteer = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
const { consoleLogger } = require("../utils");


async function runPuppeteer(url) {
   let browser;

   if (!url) {
      throw new Error("Required atp media url!");
   }

   puppeteer = puppeteer.use(Stealth());

   browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

   let page = await browser.newPage();

   await page.goto(url, { timeout: 80000, waitUntil: "domcontentloaded" });

   consoleLogger(`Hitting ${url}`);

   const data = await page.evaluate(() => {
      const mediaPdf = document.querySelectorAll("ul.daily-media-notes li");

      const links = [];

      if (mediaPdf) {
         mediaPdf.forEach(pdf => {
            const aLink = pdf.querySelector("a").getAttribute("href");
            const title = pdf.querySelector("span")?.textContent;

            if (title.match(/Media Notes/g)) {
               links.push(aLink)
            }
         })
      }

      return links;
   });


   await browser.close()

   return data;
}

module.exports = runPuppeteer;