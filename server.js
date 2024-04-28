const express = require("express");
const cookieParser = require("cookie-parser");
const schedule = require("node-schedule");
require("dotenv").config();
const { constant } = require("./config");

const { delay,
   timeLogger,
   makePostRequest,
   paraphrasePdf,
   downloadPDF,
   extractMatchInfo,
   getPostTagIds,
   getPdfLinks,
   getMediaId,
   checkPostExists
} = require("./utils/utils");

const app = express();
const PORT = process.env.PORT || 9000;

// Middlewares
app.use(cookieParser());


function imgWrapper(arr) {
   return arr.map((item) => {
      return (`<img src="${item?.sourceUrl}" alt="${item?.slug}" style="flex: 1; width: 50%;" />`);
   });
}

async function mainExc() {
   try {
      console.log(`${timeLogger()}: Script started for ${constant?.clientDomainName}.`);

      const currentYear = new Date().getFullYear();

      // Getting pdf first link
      const newPDFLinks = await getPdfLinks(constant?.atpNoteUri(currentYear));

      console.log(`${timeLogger()}: Got new pdf links.`);

      if (newPDFLinks.length <= 0) {
         return { message: `Sorry no pdf found!` };
      }

      // Generating jwt token by username and password
      // const jwtData = await generateJwtToken();

      const token = constant?.restAuthToken; // jwtData?.token;

      if (!token) {
         throw new Error(`Sorry! Token not found.`);
      }

      console.log(`${timeLogger()}: Token generated successfully.`);

      // create category
      const category = await makePostRequest(constant?.categoryUri, { name: constant?.categoryName }, token);

      let categoryId = null;

      const parseCategory = category ? JSON.parse(category) : {};

      if (parseCategory?.code === "term_exists") {
         categoryId = parseCategory?.data?.term_id;
      } else {
         categoryId = parseCategory?.id;
         console.log(`${timeLogger()}: New category added.`);
      }


      if (!categoryId || typeof categoryId !== "number") throw new Error("Sorry! category not found.");

      for (const mediaNote of newPDFLinks) {

         const pdfData = mediaNote.split("=split=");

         const pdfLink = pdfData[0] ? pdfData[0] : "";

         const pdfTextContents = await downloadPDF(constant.pdfUri(pdfLink));

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
                     const nameOfEvent = content?.eventName;
                     const shortDateOfEvent = content?.eventShortDate;
                     const dayOfEvent = content?.eventDay;
                     const addressOfEvent = content?.eventAddress;
                     const roundOfEvent = content?.round || null;
                     const title = `${nameOfEvent} Predictions: ${playerOne} vs ${playerTwo} - ${shortDateOfEvent}`;

                     const isUniquePost = await checkPostExists(constant?.postExistUri(title), token);

                     if (!isUniquePost && playerOne && playerTwo && nameOfEvent) {
                        console.log(`${timeLogger()}: Running event of ${playerOne} vs ${playerTwo} - ${dayOfEvent}.`);
                        contentIndex = contentIndex + 1;

                        let playerOneMedia = {}, playerTwoMedia = {};
                        playerOneMedia = await getMediaId(constant.mediaUri(player1slug), token);
                        playerTwoMedia = await getMediaId(constant.mediaUri(player2slug), token);


                        if (!playerOneMedia?.mediaId) {
                           playerOneMedia = await getMediaId(constant.mediaUri(`generic${Math.floor(Math.random() * 3) + 1}`), token);
                        }

                        if (!playerTwoMedia?.mediaId) {
                           playerTwoMedia = await getMediaId(constant.mediaUri(`generic${Math.floor(Math.random() * 3) + 1}`), token);
                        }


                        // returns tags ids [1, 2, 3]
                        const tagIds = await getPostTagIds(constant?.tagUri, [playerOne, playerTwo, nameOfEvent], token);

                        const paraphrasedBlog = text;// await paraphrasePdf(constant?.paraphrasedCommand(text));

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

                        await makePostRequest(constant?.postUri, {
                           title,
                           content: htmlContent,
                           status: constant?.postStatus,
                           author: constant?.authorId,
                           tags: tagIds,
                           // featured_media: mediaId,
                           categories: [categoryId]
                        }, token);

                        console.log(`${timeLogger()}: Post successfully created with title ${title}.`);

                        await delay();
                     } else {
                        console.log(`${timeLogger()}: ${title} already exists.`)
                     }

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

app.get("/get-pdf", (req, res) => {
   try {
      console.log("server run");
      return res.status(200).send({ message: "data got" })
   } catch (error) {

   }
});



app.listen(PORT, async () => {
   try {
      console.log(`Server running on PORT: ${PORT}`);
      const result = await mainExc();
      console.log(`${timeLogger()}: ${result?.message}`);
   } catch (error) {
      console.log(error?.message);
   }
})