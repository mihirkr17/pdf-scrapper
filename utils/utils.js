const fs = require("fs");
const PDFParser = require('pdf-parse');
const OpenAI = require("openai");
const cheerio = require('cheerio');
const https = require("https");
let puppeteer = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
const { constant } = require("../config");

const fetch = (...args) =>
   import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Main Constants
const OPEN_AI_INSTANCE = new OpenAI({
   apiKey: constant?.openAiSecret
});


const delay = (ms = 2000) => new Promise(resolve => setTimeout(resolve, ms));

const timeLogger = () => (new Date(Date.now()).toLocaleString());

function retryOperation(func, retries = 5) {
   return async function (...args) {
      while (retries > 0) {
         try {
            return await func(...args);
         } catch (error) {
            console.log(`${timeLogger()}, An unexpected error occurred: ${error?.message}. Retrying after 2s`);
            retries--;
            if (retries === 0) {
               throw new Error(`Retry limit reached, Last Error: ${error.message}`);
            }
            await delay();
         }
      }
   }
}

function fetchDataByHttps(url, type = "text") {
   return new Promise((resolve, reject) => {

      if (type !== "text" && type !== "buffer") {
         reject(new Error("Invalid response type. Use 'text' or 'buffer'."));
         return;
      }

      https.get(url, (response) => {
         const isBuffer = (type === "buffer") ? true : false;

         let data = isBuffer ? [] : "";

         response.on('data', (chunk) => {

            if (isBuffer) {
               data.push(chunk);
            } else {
               data += chunk;
            }
         });
         response.on('end', () => {
            resolve(isBuffer ? Buffer.concat(data) : data);
         });

      }).on('error', (error) => {
         reject(error);
      });
   });
}

function slugMaker(str) {
   return str.toLowerCase()
      .replace(/[^a-z0-9-_\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');
}


/**
 * [Write file asynchronously]
 */
async function createFileAsynchronously(fileName, data) {
   return retryOperation(async () => {
      return new Promise((resolve, reject) => {

         let writer = fs.createWriteStream(fileName);

         writer.on("error", (err) => {
            reject(err);
         });

         writer.on("finish", () => {
            resolve("File saved.");
         });

         writer.write(data);
         writer.end();
      });

   })();
}


/**
 * [Read file asynchronously]
 */
async function readFileAsynchronously(fileName, type = "text") {
   return retryOperation(async () => {
      return new Promise((resolve, reject) => {

         let stream = fs.createReadStream(fileName);

         let data = type === "buffer" ? [] : "";

         stream.on("error", (err) => {
            reject(err);
         });

         stream.on("data", (chunk) => {
            if (type === "buffer") {
               data.push(chunk);
            } else {
               data += chunk;
               resolve(chunk);
            }
         });
         stream.on("end", () => resolve(type === "buffer" ? Buffer.concat(data) : data));
      });
   })()
}

// api calling function
async function paraphrasePdf(prompt) {
   return retryOperation(async () => {
      const result = await OPEN_AI_INSTANCE.chat.completions.create({
         model: "gpt-3.5-turbo-16k",
         messages: [{ role: "user", content: `${prompt}` }],
      });

      console.log("Paraphrased done.");
      return result.choices[0].message.content;
   })();
}


// utils 
async function makePostRequest(uri, body = {}, token) {
   return retryOperation(async () => {
      const response = await fetch(uri, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${token}`
         },
         body: JSON.stringify(body)
      });
      const result = await response.text();
      return result;
   })();
}


// Generating jwt token
async function generateJwtToken(url) {
   return retryOperation(async () => {
      const response = await fetch(url, {
         method: "POST",
      });

      const data = await response.json();


      return data?.token;
   })();
}


// Download pdf file
async function downloadPDF(url) {
   return retryOperation(async () => {
      console.log(`${timeLogger()}: Got pdf link of media note - ${url}`);
      const buffers = await fetchDataByHttps(url, "buffer");
      const pdfContents = await PDFParser(buffers);
      return pdfContents.text;
   })();
}


function findPlayerNames(inputString) {
   const removeRegex = /\[?\d+R\]?/g;
   const matchRound = inputString.match(removeRegex);

   let match = inputString.split(/\s+vs\s+/);

   // const removeAnyBraces = /(\[[^\]]*\]|\([^)]*\))\s*/g;
   const removeAnyBraces = /\[[^\]]*\]|\([^)]*\)/g;
   const removeColons = /[^:]*:|\[.*?\]|:/g;

   const secondPart = match[1] ? match[1].replace(removeAnyBraces, "") : "";

   const player2Section = secondPart.split("  ").filter(e => e);

   return {
      player1: match[0] ? match[0].replace(removeAnyBraces, "").replace(removeColons, "")?.trim() : "",
      player2: player2Section ? player2Section[0]?.trim() : "",
      leads: player2Section ? player2Section[1]?.trim() : "",
      round: matchRound ? matchRound[0].replace(/\[|\]/g, "") : null
   }
}


function extractMatchInfo(text) {

   const splittedTexts = text.split("\n").filter(e => e?.trim()) //.split(/\s+vs\s+/);

   let eventHeader = {}, mainResult = "", startRecording = false, headRecord = false;

   const atpMediaNoteReplaceRegex = /[\s–|-] ATP MEDIA NOTES/;
   const dayRegex = /Day (\d+)/gi;
   const dateLineRegex = /\s–|-\s/g;

   for (let i = 0; i < splittedTexts.length; i++) {

      const line = splittedTexts[i].trim();

      if (line.includes(" vs ") && !line.includes("NOTE:")) {
         startRecording = true;
         headRecord = true;
      } else {
         headRecord = false;
      }

      if (startRecording) {

         if (headRecord) {
            mainResult += "breakHere";
         }
         mainResult += (line + "\n");
      }

      if (line.includes("ATP MEDIA NOTES")) {
         const dateLine = splittedTexts[i + 1];
         const evDate = dateLine && dateLine.trim().split(dateLineRegex);
         const addressLine = splittedTexts[i + 2];

         const dayMatch = evDate[0] && evDate[0].match(dayRegex);

         eventHeader.eventDay = dayMatch ? dayMatch?.toString() : "";
         eventHeader.eventNameFull = line ? line : "";
         eventHeader.eventShortDate = evDate[1] ? evDate[1].trim() : "";
         eventHeader.eventName = line ? line.replace(atpMediaNoteReplaceRegex, "")?.trim() : "";
         eventHeader.eventFullDate = dateLine ? dateLine.trim() : "";
         eventHeader.eventAddress = addressLine ? addressLine?.split(" | ").slice(0, -1).join(", ").trim() : "";
      }
   }

   let contentArray = mainResult.replace(/For the latest stats, facts and figures about the ATP Tour, follow @ATPMediaInfo on Twitter./g, "");
   contentArray = contentArray.split("breakHere").filter(e => e) || [];

   const result = [];

   for (const section of contentArray) {

      const player = findPlayerNames(section?.split("\n")[0] || "");

      const matchLeads = player?.leads ? player?.leads : "";

      const parts = matchLeads.split(/\s(?=\d)/);

      const leadKey = parts[0] ? parts[0] : "";
      const leadValue = parts[1] ? parts[1] : "";

      const regex = new RegExp(matchLeads, 'g');

      const regexWith = `${leadKey}${leadValue ? " head to head " + leadValue + "." : "."}`;
      const slugRegex = /[-\s]/g;
      const noteRegex = /NOTE/g;

      const content = section.replace(regex, regexWith).trim() || "";

      if (content && noteRegex.test(content)) {
         result.push({
            content: content,
            player1: player?.player1,
            player2: player?.player2,
            player1slug: player?.player1.toLowerCase().replace(slugRegex, "_"),
            player2slug: player?.player2.toLowerCase().replace(slugRegex, "_"),
            leads: matchLeads,
            round: player?.round,
            ...eventHeader
         });
      }
   }

   return result;
}

const checkPostExists = async (url, token) => {

   const response = await fetch(url, {
      method: "GET",
      headers: {
         Authorization: `Basic ${token}`
      }
   });
   const posts = await response.json();

   return posts.length >= 1; // If the length is greater than or equal to 1, then post exists and return true;
};


async function getPostTagIds(uri, tags, token) {
   return retryOperation(async () => {
      const tagIds = [];

      for (const tag of tags) {
         try {
            const response = await makePostRequest(uri, { name: tag + " Predictions" }, token);

            const result = response ? JSON.parse(response) : {};

            if (result?.code === "term_exists") {
               tagIds.push(result?.data?.term_id);
            } else {
               tagIds.push(result?.id);
            }

            await delay();
         } catch (error) {
            throw new Error(`Error In getPostTagIds: ${error?.message}`);
         }
      }
      return tagIds;
   })();
}

async function getMediaId(uri, token) {
   return retryOperation(async () => {
      const response = await fetch(uri, {
         headers: {
            Authorization: `Basic ${token}`
         }
      });
      const result = await response.json();

      if (result) {

         const media = result[0] ? result[0] : {};

         return { mediaId: media?.id, slug: media?.slug, sourceUrl: media?.source_url };
      }
   })();
}

function compareAndSeparatePdf(newMediaPdf, fixedMediaPdf) {
   const fixedSet = new Set(fixedMediaPdf.map(item => (item)));

   const newValues = [];
   for (const item of newMediaPdf) {
      if (!fixedSet.has(item)) {
         newValues.push(item);
      }
   }

   return newValues;
}


async function runPup(url) {
   let browser;

   if (!url) {
      throw new Error("Required atp media url!");
   }

   puppeteer = puppeteer.use(Stealth());

   browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

   let page = await browser.newPage();

   await page.goto(url, { timeout: 80000, waitUntil: "domcontentloaded" });

   console.log(`${timeLogger()}: Hitting ${url}`);

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

async function runCheerio(url) {
   const data = await fetchDataByHttps(url);

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
}

// Get pdf links
async function getPdfLinks(url) {
   return retryOperation(async () => {
      try {
         return await runCheerio(url);
      } catch (error) {
         console.log(`${timeLogger()}. Error: ${error?.message} || Running Puppeteer...`);
         return await runPup(url);
      }
   })();
}


module.exports = {
   delay,
   timeLogger,
   slugMaker,
   readFileAsynchronously,
   createFileAsynchronously,
   paraphrasePdf,
   makePostRequest,
   generateJwtToken,
   downloadPDF,
   extractMatchInfo,
   getPostTagIds,
   compareAndSeparatePdf,
   retryOperation,
   getPdfLinks,
   getMediaId,
   checkPostExists
}