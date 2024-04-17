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
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 9000;
// Middlewares
app.use(cookieParser());



// Main Constants

const OPEN_AI_INSTANCE = new OpenAI({
   apiKey: "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" // process.env.OPEN_AI_SECRETS
});

const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN || "";
const CLIENT_USERNAME = process.env.CLIENT_USERNAME || "";
const CLIENT_PWD = process.env.CLIENT_PWD || "";

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

async function makePostRequest(uri, body = {}, jwtToken) {
   try {


      const response = await fetch(`${CLIENT_DOMAIN}${uri}`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`
         },
         body: JSON.stringify(body)
      });
      const result = await response.text();
      return result;

   } catch (error) {
      throw new Error(`Error In makePostRequest: ${error?.message}`);
   }
}

async function generateJwtToken() {
   try {
      const response = await fetch(`${CLIENT_DOMAIN}/wp-json/jwt-auth/v1/token?username=${CLIENT_USERNAME}&password=${CLIENT_PWD}`, {
         method: "POST",
      });

      const data = await response.json();

      return data;
   } catch (error) {
      throw new Error(`Error In generateJwtToken: ${error?.message}`);
   }
}



// Get pdf links
async function getPdfLinks(url) {
   // let browser;

   try {

      if (!url) {
         throw new Error("Required atp media url!");
      }

      // puppeteer = puppeteer.use(Stealth());

      // browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

      // let page = await browser.newPage();

      // await page.goto(url, { timeout: 80000, waitUntil: "domcontentloaded" });

      // console.log(`${timeLogger()}: Hitting ${url}`);

      // const data = await page.evaluate(() => {
      //    const mediaPdf = document.querySelectorAll("ul.daily-media-notes li");

      //    const links = [];

      //    if (mediaPdf) {
      //       mediaPdf.forEach(pdf => {
      //          const aLink = pdf.querySelector("a").getAttribute("href");
      //          const title = pdf.querySelector("span")?.textContent;

      //          if (title.match(/Media Notes/g)) {
      //             links.push(aLink + "=title=" + title)
      //          }
      //       })
      //    }

      //    return links;
      // });


      // await browser.close()

      // return data;

      const response = await fetch(url);

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
         });

         return links;
      }

   } catch (error) {
      // if (browser) {
      //    await browser.close();
      // }

      throw new Error(`Error In getPdfLinks: ${error?.message}`);
   }
}

// Download pdf file
async function downloadPDF(url) {
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
      const slugRegex = /\s/g;
      const noteRegex = /NOTE/g;

      const content = section.replace(regex, regexWith).trim() || "";

      if (content && noteRegex.test(content)) {
         result.push({
            content: content,
            player1: player?.player1,
            player2: player?.player2,
            player1slug: player?.player1.replace(slugRegex, "_").toLowerCase(),
            player2slug: player?.player2.replace(slugRegex, "_").toLowerCase(),
            leads: matchLeads,
            round: player?.round,
            ...eventHeader
         });
      }
   }

   return result;
}


function slugMaker(str) {
   return str.toLowerCase()
      .replace(/[^a-z0-9-_\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');
}


async function getPostTagIds(tags, token) {
   try {
      const tagIds = [];

      for (const tag of tags) {
         try {
            const response = await retry(async () => await makePostRequest("/wp-json/wp/v2/tags", { name: tag }, token));

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
   } catch (error) {
      throw new Error(error?.message);
   }
}




async function mainExc() {
   try {
      const currentYear = new Date().getFullYear();

      const mediaUrl = `https://www.atptour.com/en/media/daily-media-notes?year=${currentYear}`;

      // Getting pdf first link
      const newPDFLinks = await retry(async () => await getPdfLinks(mediaUrl));

      if (newPDFLinks.length <= 0) {
         return { message: `Sorry no pdf found!` };
      }

      // Getting pdf json for trace items
      const fixedPdfFile = await retry(async () => await readFileAsynchronously(path.resolve(__dirname, "pdf.json")));

      let pdfJson = JSON.parse(fixedPdfFile) || [];


      // let uniqueLinks = [];

      const newMediaNotesPdf = compareAndSeparatePdf(newPDFLinks, pdfJson);


      if (!newMediaNotesPdf || !Array.isArray(newMediaNotesPdf) || newMediaNotesPdf.length <= 0)
         return { message: "Currently there are no new atp media notes available !" };


      // Generating jwt token by username and password
      const jwtData = await retry(async () => await generateJwtToken());

      const token = jwtData?.token;

      if (!token) {
         throw new Error(`Sorry! Token not generated.`);
      }

      console.log(`${timeLogger()}: Token generated successfully.`);


      for (const mediaNote of newMediaNotesPdf) {

         const pdfData = mediaNote.split("=title=");

         const pdfLink = pdfData[0] ? pdfData[0] : "";

         const pdfTextContents = await retry(async () => await downloadPDF(`https://www.atptour.com${pdfLink}`));

         if (pdfTextContents) {

            // Extracting match details from pdf contents | returns []
            const contents = extractMatchInfo(pdfTextContents);

            console.log(`${timeLogger()}: Pdf downloaded and extracted contents successfully.`);

            if (Array.isArray(contents) && contents.length >= 1) {
               let contentIndex = 0;
               const contentCount = contents.length;
               const newPdfLinkList = [];

               for (const content of contents) {
                  try {
                     const playerOne = content?.player1;
                     const playerTwo = content?.player2;
                     const player1slug = content?.player1slug;
                     const player2slug = content?.player2slug;
                     const text = content?.content;
                     const newMediaNoteLink = mediaNote + "=done=" + player1slug + "+" + player2slug;

                     const isExist = pdfJson.includes(newMediaNoteLink);

                     if (!isExist) {
                        contentIndex = contentIndex + 1;


                        console.log(`${timeLogger()}: Running Event ${content?.eventName} - ${content?.eventDay}.`);
                        console.log(`${timeLogger()}: Remaining match ${contentIndex} Of ${contentCount}`);

                        const title = `${playerOne} vs ${playerTwo} H2H, Pick & Stats - ${content?.eventName} ${content?.eventShortDate}`;

                        const tagIds = await retry(async () => await getPostTagIds([playerOne, playerTwo, content?.eventName], token)); // returns tags ids [1, 2, 3]

                        const paraphrasedBlog = text; // await paraphrasePdf(`Reword/Rephrase word by word using paragraphs "${text}"`);

                        const htmlContent = `
                        <div style="padding: 20px 0; margin-top: 50px">
                           <h2>${content?.eventName}</h2>
                           <span>${content?.eventFullDate}</span>
                           <br/>
                           <p>${content?.eventAddress}.</p>
                        </div>
   
                        <div style="margin: 80px 0">
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
                        <article>
                           <h5>Head To Head ${content?.leads}.</h5>
                           <br/>
                           <p>${paraphrasedBlog && paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
                        </article>
      
                        <br/> <br/>
      
                        <h3 class="wp-headings">${playerOne} vs ${playerTwo} Prediction:</h3>
   
                        <p>
                           I believe ${playerOne} will win in straight sets. 
                           The Stevegtennis.com prediction algorithm has a much better success rate in picking 
                           match winners than me! 
                           So check out who it picks for this match here: Stevegtennis.com ${playerOne}  vs ${playerTwo} prediction.
                           <br/>
                           <br/>
                           <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank">
                              See Head 2 Head ${playerOne} vs ${playerTwo} in Stevegtennis
                           </a>
                        </p>
                        `;

                        await retry(async () => await makePostRequest("/wp-json/wp/v2/posts", {
                           title: title,
                           content: htmlContent,
                           status: "draft",
                           author: 1,
                           tags: tagIds
                        }, token));

                        console.log(`${timeLogger()}: Post ${contentIndex} successfully created.`);

                        newPdfLinkList.push(newMediaNoteLink);
                        await delay();
                     }
                  } catch (error) {
                     throw new Error(error?.message);
                  }
               }


               if ((newPdfLinkList.length === contentCount) || (newPdfLinkList.length === 0)) {
                  pdfJson.push(mediaNote, ...newPdfLinkList);
               }

               if (newPdfLinkList.length >= 1) {
                  pdfJson.push(...newPdfLinkList);
               }

               await delay(1000);
            }

         }
      }

      return { data: [...new Set(pdfJson)], message: "New pdf taken." }

   } catch (error) {
      throw new Error(`Main Execution Error: ${error?.message}`);
   }
};

(async () => {
   try {
      const result = await mainExc();

      const data = result?.data;

      if (data) {
         await createFileAsynchronously("pdf.json", JSON.stringify(data));
      }


      console.log(`${timeLogger()}: ${result?.message}`);


      // const textFile = fs.readFileSync("pdfNewText.txt");

      // let text = JSON.parse(textFile);

      // const matchInfo = extractMatchInfo(text);
      // // 
      // console.log(matchInfo);


      // await createFileAsynchronously("ttc.json", JSON.stringify(matchInfo));
   } catch (error) {
      console.log(error?.message);
   }
})();
// main operation
// schedule.scheduleJob('*/2 * * * *', async function () {
//    try {
//       console.log(new Date(), 'Every 5 minute.');
//       const result = await mainExc();
//       console.log(`${timeLogger()}: ${result?.message}`);

//    } catch (error) {
//       console.log(error?.message);
//    }
// });

app.listen(PORT, () => {
   console.log(`Server running on PORT: ${PORT}`);
})