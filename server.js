const express = require("express");
const cookieParser = require("cookie-parser");
const schedule = require("node-schedule");
require("dotenv").config();
const path = require("path");

const { delay,
   timeLogger,
   makePostRequest,
   paraphrasePdf,
   generateJwtToken,
   downloadPDF,
   extractMatchInfo,
   getPostTagIds,
   getPdfLinks,
   getMediaId,
   slugMaker,
   checkPostExists
} = require("./utils/utils");

const app = express();
const PORT = process.env.PORT || 9000;

// Middlewares
app.use(cookieParser());


async function mainExc() {
   try {
      console.log(`${timeLogger()}: Script started.`);

      const currentYear = new Date().getFullYear();

      const mediaUrl = `https://www.atptour.com/en/media/daily-media-notes?year=${currentYear}`;

      // Getting pdf first link
      const newPDFLinks = await getPdfLinks(mediaUrl);
      console.log(`${timeLogger()}: Got new pdf links.`);

      if (newPDFLinks.length <= 0) {
         return { message: `Sorry no pdf found!` };
      }

      // Generating jwt token by username and password
      // const jwtData = await generateJwtToken();

      const token = "cm9vdDpAbWtyMTk5OHRlc3Qtd29yZHByZXNz";// jwtData?.token;

      if (!token) {
         throw new Error(`Sorry! Token not generated.`);
      }

      console.log(`${timeLogger()}: Token generated successfully.`);

      // create category
      const category = await makePostRequest(`/wp-json/wp/v2/categories`, { name: "ATP Tennis Predictions" }, token);

      let categoryId = null;
      const parseCategory = category ? JSON.parse(category) : {};

      if (parseCategory?.code === "term_exists") {
         categoryId = parseCategory?.data?.term_id;
      } else {
         categoryId = parseCategory?.id;
      }


      if (!categoryId || typeof categoryId !== "number") throw new Error("Sorry! category not found.");

      for (const mediaNote of newPDFLinks) {

         const pdfData = mediaNote.split("=split=");

         const pdfLink = pdfData[0] ? pdfData[0] : "";

         const pdfTextContents = await downloadPDF(`https://www.atptour.com${pdfLink}`);

         if (pdfTextContents) {

            // Extracting match details from pdf contents | returns []
            const contents = extractMatchInfo(pdfTextContents);

            console.log(`${timeLogger()}: Pdf downloaded and extracted contents successfully.`);

            if (Array.isArray(contents) && contents.length >= 1) {
               let contentIndex = 0;

               for (const content of contents) {
                  try {
                     const playerOne = content?.player1;
                     const playerTwo = content?.player2;
                     const player1slug = content?.player1slug;
                     const player2slug = content?.player2slug;
                     const text = content?.content;

                     const title = `${content?.eventName} Predictions:(${playerOne} vs ${playerTwo}) - ${content?.eventShortDate}`;

                     const isUniquePost = await checkPostExists(title, token);

                     if (!isUniquePost) {
                        console.log(`${timeLogger()}: Running event of ${playerOne} vs ${playerTwo} - ${content?.eventDay}.`);
                        contentIndex = contentIndex + 1;

                        let playerOneMedia, playerTwoMedia;
                        playerOneMedia = await getMediaId(`/wp-json/wp/v2/media?slug=${player1slug}_yes`);
                        playerTwoMedia = await getMediaId(`/wp-json/wp/v2/media?slug=${player2slug}_yes`);
                        const randomNumberBetween1To3 = Math.floor(Math.random() * 3) + 1;

                        if (!playerOneMedia?.mediaId) {
                           playerOneMedia = await getMediaId(`/wp-json/wp/v2/media?slug=generic${randomNumberBetween1To3}_yes`);
                        } else if (!playerTwoMedia?.mediaId) {
                           playerTwoMedia = await getMediaId(`/wp-json/wp/v2/media?slug=generic${randomNumberBetween1To3}_yes`);
                        }


                        // returns tags ids [1, 2, 3]
                        const tagIds = await getPostTagIds([playerOne, playerTwo, content?.eventName], token);

                        const paraphrasedBlog = text; // await paraphrasePdf(`Reword/Rephrase word by word using paragraphs "${text}"`);

                        const htmlContent = `
                        <div style="padding: 20px 0; margin-top: 50px">
                           <h2>${content?.eventName}</h2>
                           <span>${content?.eventFullDate}</span>
                           <br/>
                           <p>${content?.eventAddress}.</p>
                        </div>

                        <div style="display: flex; flex-direction: row;">
                           ${playerOneMedia?.sourceUrl && `<img src="${playerOneMedia?.sourceUrl}" alt="${playerOneMedia?.slug}" style="flex: 1; width: 50%;" />`}
                           ${playerTwoMedia?.sourceUrl && `<img src="${playerTwoMedia?.sourceUrl}" alt="${playerTwoMedia?.slug}" style="flex: 1; width: 50%;" />`} 
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

                        await makePostRequest("/wp-json/wp/v2/posts", {
                           title,
                           content: htmlContent,
                           status: "draft",
                           slug: slugMaker(title),
                           author: 1,
                           tags: tagIds,
                           // featured_media: mediaId,
                           categories: [categoryId]
                        }, token);

                        console.log(`${timeLogger()}: Post successfully created with title ${title}.`);

                        await delay();
                     } else {
                        console.log(`${timeLogger()}: ${title} already exists.`)
                     }
                     // }
                  } catch (error) {
                     throw new Error(error?.message);
                  }
               }

               await delay(1000);
            }
         }
      }

      return { message: "Operation completed." }

   } catch (error) {
      throw new Error(`Error In Main Execution: ${error?.message}`);
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
// schedule.scheduleJob('*/6 * * * *', async function () {
//    try {
//       console.log(`${timeLogger()}: Main execution running every 5 minutes.`);
//       const result = await mainExc();

//       console.log(`${timeLogger()}: ${result?.message}`);

//    } catch (error) {
//       console.log(error?.message);
//    }
// });

// app.get("/get-pdf", (req, res) => {
//    try {
//       console.log("server run");
//       return res.status(200).send({message: "data got"})
//    } catch (error) {

//    }
// });
app.listen(PORT, async () => {
   try {
      console.log(`Server running on PORT: ${PORT}`);
      const result = await mainExc();
      console.log(`${timeLogger()}: ${result?.message}`);
   } catch (error) {
      console.log(error?.message);
   }
})