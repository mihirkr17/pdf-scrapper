const express = require("express");
const cookieParser = require("cookie-parser");
const schedule = require("node-schedule");
require("dotenv").config();
const { constant } = require("./config");
const configuration = require("./configuration.json");
const fetch = (...args) =>
   import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { delay,
   consoleLogger,
   extractMatchInfo,
   imgWrapper,
   readFileAsynchronously
} = require("./utils");

const {
   getPdfLinks,
   createPostOfWP,
   getPostTagIdsOfWP,
   getMediaIdOfWP,
   checkExistingPostOfWP,
   downloadPDF,
   paraphraseContents,
   createCategoryOfWP
} = require("./services");

const path = require("path");


const app = express();
const PORT = process.env.PORT || 9000;

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.set({
   origin: "*",
   methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
   allowedHeaders: ["Content-Type", "Authorization", "role"],
   credentials: true,
});
// Serve static files from the "models" directory
app.use(express.static(path.join(__dirname, 'models')));
app.use(require("./routes/baseRoute"));

async function mainExc() {
   try {
      consoleLogger(`Script started for ${constant?.clientDomainName}.`);

      const currentYear = new Date().getFullYear();

      // Getting pdf first link
      const mediaNoteUrls = await getPdfLinks(constant?.atpNoteUri(currentYear));

      if (mediaNoteUrls.length <= 0) {
         return { message: `Sorry no media note urls available right now!` };
      }

      consoleLogger(`Got new media note urls.`);

      // Basic wordpress authentication
      const token = constant?.restAuthToken;

      if (!token) {
         throw new Error(`Sorry! Token not found.`);
      }

      consoleLogger(`Got auth token.`);

      // Creating category by wordpress rest api 
      const category = await createCategoryOfWP(constant?.categoryUri, token, { name: constant?.categoryName });

      let categoryId = null;

      const parseCategory = category ? JSON.parse(category) : {};

      if (parseCategory?.code === "term_exists") {
         categoryId = parseCategory?.data?.term_id;
      } else {
         categoryId = parseCategory?.id;
         consoleLogger(`New category added.`);
      }

      if (!categoryId || typeof categoryId !== "number") throw new Error("Sorry! category not found.");
      let indexOfPdf = 1;

      for (const mediaNoteUrl of mediaNoteUrls) {

         // Download pdf by link and extracted contents by Pdf parser.
         const pdfNoteUrl = constant.pdfUri(mediaNoteUrl);

         consoleLogger(`Serial-${indexOfPdf}. Running ${pdfNoteUrl}...`);

         const pdfTextContents = await downloadPDF(pdfNoteUrl);

         if (pdfTextContents) {
            consoleLogger(`Successfully got PDF contents.`);

            // Extracting match details from pdf contents | basically it returns [Array];
            const contents = extractMatchInfo(pdfTextContents);

            consoleLogger(`Pdf downloaded and extracted contents successfully.`);

            if (Array.isArray(contents) && contents.length >= 1) {

               for (const content of contents) {
                  try {
                     const playerOne = content?.player1;
                     const playerTwo = content?.player2;
                     const player1slug = content?.player1slug;
                     const player2slug = content?.player2slug;
                     const text = content?.content;
                     const nameOfEvent = content?.eventName;
                     const shortDateOfEvent = content?.eventShortDate;
                     const dayOfEvent = content?.eventDay;
                     const addressOfEvent = content?.eventAddress;
                     const roundOfEvent = content?.round || null;
                     const title = `${nameOfEvent} Predictions: ${playerOne} vs ${playerTwo} - ${shortDateOfEvent}`;

                     // Checking post availability in the wordpress post by rest api;
                     const isUniquePost = await checkExistingPostOfWP(constant?.postExistUri(title), token);

                     if (!isUniquePost && playerOne && playerTwo && nameOfEvent) {

                        consoleLogger(`Starting ${title} - ${dayOfEvent}.`);

                        let playerOneMedia = {}, playerTwoMedia = {};
                        playerOneMedia = await getMediaIdOfWP(constant.mediaUri(player1slug), token);
                        playerTwoMedia = await getMediaIdOfWP(constant.mediaUri(player2slug), token);


                        if (!playerOneMedia?.mediaId) {
                           playerOneMedia = await getMediaIdOfWP(constant.mediaUri(`generic${Math.floor(Math.random() * 3) + 1}`), token);
                        }

                        if (!playerTwoMedia?.mediaId) {
                           playerTwoMedia = await getMediaIdOfWP(constant.mediaUri(`generic${Math.floor(Math.random() * 3) + 1}`), token);
                        }


                        // It returns tags ids like [1, 2, 3];
                        const tagIds = await getPostTagIdsOfWP(constant?.tagUri, [playerOne, playerTwo, nameOfEvent], token);

                        const paraphrasedBlog = text;// await paraphraseContents(constant?.paraphrasedCommand(text));

                        consoleLogger("Paraphrased done.")
                        // Making html contents
                        const htmlContent = `
                        <div style="padding: 15px 0; margin-top: 10px">
                           <h2>${nameOfEvent}</h2>
                           <span>${content?.eventFullDate}</span>
                           <br/>
                           <p>${addressOfEvent}.</p>
                        </div>

                        <div style="display: flex; flex-direction: row;">${imgWrapper([playerOneMedia, playerTwoMedia])}</div>
   
                        <div style="margin: 15px 0">
                           <ul>
                              <li>The match up: ${playerOne} vs ${playerTwo}</li>
                              <li>Event Name: ${nameOfEvent}</li>
                              <li>Match Date: ${shortDateOfEvent}</li>
                              ${roundOfEvent ? `<li>Match Round: ${roundOfEvent}</li>` : ""}
                              <li>Day Of Event: ${dayOfEvent}</li>
                              <li>Event Address: ${addressOfEvent}</li>
                           </ul>
                        </div>
   
                        <p>
                           The 2024 ${nameOfEvent} continues with plenty of interesting matches on the ${dayOfEvent} schedule. 
                           Let's have a look at all the career, 
                           performance and head-to-head stats for the match and find out if ${playerOne} or ${playerTwo} is expected to win.
                        </p>
   
                        <br/> <br/>
   
                        <h3 class="wp-headings">Match Details:</h3>
                        <p>${playerOne} vs ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
                        
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


                        // finally making a post request by wordpress rest api 
                        await createPostOfWP(constant?.postUri, token, {
                           title,
                           content: htmlContent,
                           status: constant?.postStatus,
                           author: constant?.authorId,
                           tags: tagIds,
                           // featured_media: mediaId,
                           categories: [categoryId]
                        });

                        consoleLogger(`Post successfully created with title ${title}.`);

                        await delay();
                     } else {
                        consoleLogger(`Already exist ${title} - ${dayOfEvent}.`);
                     }

                  } catch (error) {
                     throw error;
                  }
               }
               await delay(1000);
            }
            indexOfPdf++;
         }
      }

      return { message: "Operation completed." };

   } catch (error) {
      throw new Error(`Error In Main Execution: ${error?.message}`);
   }
};


// (async () => {

//    consoleLogger("Server restarted.");

//    const scheduleAction = configuration?.scheduleAction;

//    if (scheduleAction) {
//       schedule.scheduleJob(`* * * * *`, async function () {
//          try {
//             consoleLogger(`Function will run every ${constant?.scheduleTime} hours.`);
//             const result = await mainExc();
//             consoleLogger(`${result?.message}`);
//          } catch (error) {
//             consoleLogger(error?.message);
//          }
//       });
//    } else {
//       consoleLogger("Schedule off.");
//    }
// })();

app.listen(PORT, async () => {
   try {
      const url = `https://www.stevegtennis.com/h2h-predictions/wp-json/wp/v2/posts?search=${encodeURIComponent("wta-rome-2024-aryna-sabalenka-vs-elina-svitolina-match-analysis")}`
      
      const token = "SmFtZXMgTW9ycmlzOnNLZFIgZ0MxRSBCT3pMIDFZWjAgd2Q5WCBVTVlW";

      const isExists = await fetch(url, {
         method: "GET",
         headers: {
            Authorization: "Basic SmFtZXMgTW9ycmlzOnNLZFIgZ0MxRSBCT3pMIDFZWjAgd2Q5WCBVTVlW"
         }
      });

      const data = await isExists.text();


      console.log(data);

      // console.log(Buffer.from(`James Morris:sKdR gC1E BOzL 1YZ0 wd9X UMYV`).toString("base64"));


      consoleLogger(`PDF scrapper server running successfully on PORT: ${PORT}`);
   } catch (error) {
      consoleLogger(error?.message);
   }
});