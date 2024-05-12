const cheerio = require('cheerio');
const { httpsGetRequest, retryOperation } = require('../utils');

async function runCheerio(url) {
   return retryOperation(async () => {
      const data = await httpsGetRequest(url);

      if (!data) {
         throw new Error("No response from atp media notes.");
      }

      const $ = cheerio.load(data);

      const ul = $('ul.daily-media-notes li');

      const links = [];

      if (ul) {
         ul.each((_, pdf) => {
            const aLink = $(pdf).find("a").attr("href");
            const title = $(pdf).find("span").text();

            if (title.match(/Media Notes/g)) {
               links.push(aLink)
            }
         });
         return links;
      }
   })();
}


module.exports = runCheerio