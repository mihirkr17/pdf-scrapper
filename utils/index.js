const fs = require("fs");
const https = require("https");
const fetch = (...args) =>
   import('node-fetch').then(({ default: fetch }) => fetch(...args));

const delay = (ms = 2000) => new Promise(resolve => setTimeout(resolve, ms));

const consoleLogger = (msg = "") => (console.log(`[${new Date(Date.now()).toLocaleTimeString('en-US', {timeZone: "UTC"})}] ${msg}`));

function getSurnameOfPlayer(fullName) {
   const nameParts = fullName.split(' ');
   return nameParts[nameParts.length - 1];
}

function imgWrapper(arr, playerOneSurname, playerTwoSurname) {
   return arr.map((item, index) => {
      return (`<img src="${item?.sourceUrl}" title="${index === 0 ? playerOneSurname + " vs " + playerTwoSurname : playerTwoSurname + " vs " + playerOneSurname}" alt="${item?.slug}" style="flex: 1; width: 50%;" />`);
   });
}

function retryOperation(func, retries = 5) {
   return async function (...args) {
      const isInfinite = typeof retries === "string" && retries === "infinity";
      let attemptsLeft = isInfinite ? Infinity : retries;

      while (attemptsLeft > 0) {
         try {
            return await func(...args);
         } catch (error) {
            consoleLogger(`An unexpected error occurred: ${error?.message}. Retrying after 2s`);

            if (!isInfinite) {
               attemptsLeft--;

               if (attemptsLeft === 0) {
                  throw new Error(`Retry limit reached, Last Error: ${error.message}`);
               }
            }

            await delay(4000);
         }
      }

      throw new Error('Retry attempts exhausted');
   }
}

function slugMaker(str) {
   // Convert the string to lowercase
   let slug = str.toLowerCase();

   // Replace spaces with hyphens
   slug = slug.replace(/\s+/g, '-');

   // Remove special characters but preserve specific scripts
   slug = slug.replace(/[^a-z0-9\-\u0900-\u097F\u0400-\u04FF\u0370-\u03FF\u0600-\u06FF\u3040-\u30FF\u4E00-\u9FFF\u3400-\u4DBF]+/g, '');

   // Trim any leading or trailing hyphens
   slug = slug.replace(/^-+|-+$/g, '');

   // Handle consecutive hyphens
   slug = slug.replace(/-{2,}/g, '-');

   return slug;
}

// Creating file asynchronously.
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

// Reading file asynchronously
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

// Post request wrapper
async function xhrPostRequest(url, token = "", body = {}, type = "text") {
   try {
      const response = await fetch(url, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${token}`
         },
         body: JSON.stringify(body)
      });
      return type === "json" ? await response.json() : await response.text();
   } catch (error) {
      throw error;
   }
}

// Get request wrapper
async function xhrGetRequest(url, token = "", type = "text") {
   try {
      const response = await fetch(url, {
         method: "GET",
         headers: {
            Authorization: `Basic ${token}`
         },
      });
      return type === "json" ? await response.json() : await response.text();
   } catch (error) {
      throw error;
   }
}

// Fetch data by build in https module
function httpsGetRequest(url, type = "text") {
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


function capitalizeFirstLetterOfEachWord(string) {
   if (!string) return string;
   return string.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
}

module.exports = {
   xhrGetRequest,
   xhrPostRequest,
   delay,
   consoleLogger,
   imgWrapper,
   slugMaker,
   readFileAsynchronously,
   createFileAsynchronously,
   extractMatchInfo,
   compareAndSeparatePdf,
   retryOperation,
   httpsGetRequest,
   capitalizeFirstLetterOfEachWord,
   getSurnameOfPlayer
}