const express = require("express");
const cookieParser = require("cookie-parser");
const schedule = require("node-schedule");
// const fetch = require("node-fetch");
let puppeteer = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const PDFParser = require('pdf-parse');
const OpenAI = require("openai");
const retry2 = require("async-retry");
const pdf2html = require('pdf2html');
const jsonData = require("./data");
// const pdfjs = require('pdfjs-dist');
// import pdfjs from "pdfjs-dist"

const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 9000;
// Middlewares
app.use(cookieParser());



// Main Constants

const OPEN_AI_INSTANCE = new OpenAI({
   apiKey: "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",
});

const delay = (ms = 2000) => new Promise(resolve => setTimeout(resolve, ms));


const timeLogger = () => (new Date(Date.now()).toLocaleString());

async function retry(fn, maxRetry = 10) {
   let retry = 1;

   while (retry <= maxRetry) {
      try {
         return await fn();
      } catch (error) {

         console.log(`${error?.message}. Retrying after 3s`);

         if (retry === maxRetry) {
            throw new Error(`Maximum retry exceed!`);
         }

         retry++;
         await delay(3000);
      }
   }
}

async function createFileAsynchronously(fileName, data) {
   try {
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
   } catch (error) {
      throw new Error(`Error In createFileAsynchronously: ${error?.message}`);
   }
}

async function readFileAsynchronously(fileName, type = "text") {
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
}

// api calling function
async function paraphrasePdf(prompt) {
   try {
      const result = await retry2(async () => {
         try {
            return await OPEN_AI_INSTANCE.chat.completions.create({
               model: "gpt-3.5-turbo-16k",
               messages: [{ role: "user", content: `${prompt}` }],
            });
         } catch (err) {
            console.log(`PARAPHRASED FAILED. ERROR: ${err?.message}.`);
            throw err;
         }
      }, {
         retries: 6,
         minTimeout: 1000,
      });
      console.log("Paraphrased done.");
      return result.choices[0].message.content;
   } catch (error) {
      throw new Error(error?.message);
   }
}



// Get pdf links
async function getPdfLinks(url) {
   let browser;

   try {
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
                  links.push(aLink + "=title=" + title)
               }
            })
         }

         return links;
      });


      await browser.close()

      return data;

   } catch (error) {
      if (browser) {
         await browser.close();
      }

      throw new Error(`Error In getPdfLinks: ${error?.message}`);
   }
}

// Download pdf file
async function downloadPDF(url, destination) {
   try {
      console.log(`${timeLogger()}: Got pdf link ${url}`);
      const response = await fetch(url);

      const result = await response.arrayBuffer();

      // Convert ArrayBuffer to Buffer
      const buffer = Buffer.from(result);

      console.log(`${timeLogger()}: Got buffer value`);

      const data = await PDFParser(buffer);

      return data.text;
   } catch (error) {
      throw new Error(`Error In downloadPDF: ${error?.message}`);
   }
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

function findPlayerNames(inputString) {
   const matchRound = inputString.match(/\[?\d+R\]?/g);

   let match = inputString.split(/\s+vs\s+/);

   // const removeAnyBraces = /(\[[^\]]*\]|\([^)]*\))\s*/g;
   const removeAnyBraces = /\[[^\]]*\]|\([^)]*\)/g

   const secondPart = match[1] ? match[1].replace(removeAnyBraces, "") : "";

   const player2Section = secondPart.split("  ").filter(e => e);

   return {
      player1: match[0] ? match[0].replace(removeAnyBraces, "")?.trim() : "",
      player2: player2Section ? player2Section[0]?.trim() : "",
      leads: player2Section ? player2Section[1]?.trim() : "",
      round: matchRound ? matchRound[0].replace(/\[|\]/g, "") + " Round" : null
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

      if (line.includes(" vs ")) {
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

      result.push({
         content: section.replace(regex, regexWith).trim(),
         player1: player?.player1,
         player2: player?.player2,
         leads: matchLeads,
         round: player?.round,
         ...eventHeader
      });
   }

   return result;
}


async function mainExc() {
   try {
      const currentYear = new Date().getFullYear();

      const mediaUrl = `https://www.atptour.com/en/media/daily-media-notes?year=${currentYear}`;

      const response = await fetch(mediaUrl);

      const responseData = await response.text();

      const $ = cheerio.load(responseData);

      const ul = $('ul.daily-media-notes li');

      const links = [];

      if (ul) {
         ul.each((_, pdf) => {

            const aLink = $(pdf).find("a").attr("href");
            const title = $(pdf).find("span").text();

            if (title.match(/Media Notes/g)) {
               links.push(aLink + "=title=" + title)
            }
         })
      }


      // Getting pdf first link
      const newPDF = links; //await retry(async () => await getPdfLinks(mediaUrl));

      if (newPDF.length <= 0) {
         return { message: `Sorry no pdf found!` };
      }

      const fixedPdfFile = await retry(async () => await readFileAsynchronously(path.resolve(__dirname, "pdf.json")));

      const parsedFixedPdfFile = JSON.parse(fixedPdfFile) || [];

      const newMediaNotesPdf = compareAndSeparatePdf(newPDF, parsedFixedPdfFile);


      if (!newMediaNotesPdf || !Array.isArray(newMediaNotesPdf) || newMediaNotesPdf.length <= 0)
         return { message: "Currently there are no new atp media notes available !" };


      for (const mediaNote of newMediaNotesPdf.slice(0, 1)) {

         const pdfData = mediaNote.split("=title=");
         const pdfLink = pdfData[0] ? pdfData[0] : "";

         const textContent = await retry(async () => await downloadPDF(`https://www.atptour.com${pdfLink}`, "newPDFFile"));

         if (textContent) {
            const contents = extractMatchInfo(textContent);

            console.log(`${timeLogger()}: Pdf downloaded and extracted contents successfully.`);

            if (Array.isArray(contents) && contents.length >= 1) {

               for (const content of contents.slice(1, 2)) {
                  const playerOne = content?.player1;
                  const playerTwo = content?.player2;
                  const text = content?.content;
                  const playerOneUnderscore = playerOne.replaceAll(" ", "_");
                  const playerTwoUnderscore = playerTwo.replaceAll(" ", "_");

                  if (text) {
                     const paraphrasedBlog = await paraphrasePdf(`Reword/Rephrase word by word using paragraphs "${text}"`);
                     const html = `
                     <div style="padding: 20px 0; margin-bottom: 50px">
                        <h3>${content?.eventName}</h3>
                        <span>${content?.eventFullDate}</span>
                        <br/>
                        <p>${content?.eventAddress}</p>
                     </div>
                     <div>
                        <ul>
                           <li>Player1 Name: ${playerOne}</li>
                           <li>Player2 Name: ${playerTwo}</li>
                           <li>Event Name: ${content?.eventName}</li>
                           <li>Match Date: ${content?.eventShortDate}</li>
                           ${content?.round ? `<li>Match Round: ${content?.round}</li>` : ""}
                           <li>Day Of Event: ${content?.eventDay}</li>
                           <li>Event Address: ${content?.eventAddress}</li>
                        </ul>
                     </div>
                     <h1 class="wp-post-title">${playerOne} vs ${playerTwo} H2H, Pick & Stats - ${content?.eventName} ${content?.eventShortDate}</h1>
                     <br/>
                     <p>
                        The 2024 ${content?.eventName} continues with plenty of interesting matches on the ${content?.eventDay} schedule. 
                        Let's have a look at all the career, 
                        performance and head-to-head stats for the match and find out if ${playerOne} or ${playerTwo} is expected to win.
                     </p>

                     <br/> <br/>
                     <h3 class="wp-headings">Match Details:</h3>
                     <p>${playerOne} vs ${playerTwo}${content?.round ? " - " + content?.round + " - " : " - "}${content?.eventShortDate} - ${content?.eventName} - ${content?.eventAddress}</p>
                     
                     <br/> <br/>

                     <h3 class="wp-headings">${playerOne} vs ${playerTwo} Head-to-Head, Preview, Stats & Pick:</h3>
                     <p>
                        <h5>Head To Head ${content?.leads}.</h5>
                        <br/>
                        ${paraphrasedBlog && paraphrasedBlog?.replace(/^"|"$/g, '')}
                     </p>
   
                     <br/> <br/>
   
                     <h3 class="wp-headings">${playerOne} vs ${playerTwo} Prediction:</h3>
                     <p>
                        I believe ${playerOne} will win in straight sets. 
                        The Stevegtennis.com prediction algorithm has a much better success rate in picking 
                        match winners than me! 
                        So check out who it picks for this match here: Stevegtennis.com ${playerOne}  vs ${playerTwo} prediction.
                        <br/>
                        <a href="https://www.stevegtennis.com/head-to-head/men/${playerOneUnderscore}/${playerTwoUnderscore}/" target="_blank">
                           See Head 2 Head ${playerOne} vs ${playerTwo} in Stevegtennis
                        </a>
                     </p>
                     `;

                     parsedFixedPdfFile.push(mediaNote);
                     await createFileAsynchronously("ttv4.html", html);
                  }

                  await delay();
               }
            }
            await delay(1000);
         }
      }

      await createFileAsynchronously("pdf.json", JSON.stringify(parsedFixedPdfFile));

      return { message: "New pdf taken." }

   } catch (error) {
      throw new Error(`Main Execution Error: ${error?.message}`);
   }
};

// (async () => {
//    try {
//       const result = await mainExc();
//       console.log(`${timeLogger()}: ${result?.message}`);

//       // const textFile = fs.readFileSync("pdfNewText.txt");

//       // let text = JSON.parse(textFile);

//       // const matchInfo = extractMatchInfo(text);
//       // // 
//       // console.log(matchInfo);


//       // await createFileAsynchronously("ttc.json", JSON.stringify(matchInfo));
//    } catch (error) {
//       console.log(error?.message);
//    }
// })();
// main operation
schedule.scheduleJob('* 5 * * *', async function () {
   try {
      console.log(new Date(), 'Every 5 minute.');
      const result = await mainExc();
      console.log(`${timeLogger()}: ${result?.message}`);

   } catch (error) {
      console.log(error?.message);
   }
});

app.listen(PORT, () => {
   console.log(`Server running on PORT: ${PORT}`);
})