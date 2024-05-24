const { constant } = require("../config");
const { getPdfLinks,
   createPostOfWP,
   getPostTagIdsOfWP,
   getMediaIdOfWP,
   checkExistingPostOfWP,
   downloadPDF,
   paraphraseContents,
   createCategoryOfWP } = require("../services");

const { consoleLogger, extractMatchInfo,
   imgWrapper,
   delay,
   slugMaker,
   capitalizeFirstLetterOfEachWord,
   getSurnameOfPlayer } = require("../utils");



async function init(categoryList) {
   try {

      consoleLogger(`Script started for ${constant?.clientDomainName}.`);

      const currentYear = new Date().getFullYear();

      // Getting pdf first link
      const mediaNoteUrls = await getPdfLinks(constant?.atpNoteUri(currentYear));

      if (mediaNoteUrls.length <= 0) {
         return { message: `Sorry no media note urls available right now!` };
      }

      consoleLogger(`Found ${mediaNoteUrls.length} media note urls.`);

      // Basic wordpress authentication
      const token = constant?.restAuthToken;

      if (!token) {
         throw new Error(`Sorry! Auth token not found.`);
      }

      consoleLogger(`Found auth token successfully.`);

      // Creating category by wordpress rest api 
      const category = await createCategoryOfWP(constant?.categoryUri, token, { name: constant?.categoryName });

      let categoryId = null;

      const parseCategory = category ? JSON.parse(category) : {};

      if (parseCategory?.code === "term_exists") {
         categoryId = parseCategory?.data?.term_id;
         consoleLogger(`Category already exists with name ${constant?.categoryName}.`);
      } else {
         categoryId = parseCategory?.id;
         consoleLogger(`New category added.`);
      }

      consoleLogger("Category Id Is: " + categoryId);

      if (!categoryId || typeof categoryId !== "number") throw new Error("Sorry! Category not found.");

      let indexOfPdf = 1;
      let postCounter = 0;

      for (const mediaNoteUrl of mediaNoteUrls) {

         try {

            // Download pdf by link and extracted contents by Pdf parser.
            const pdfNoteUrl = constant.pdfUri(mediaNoteUrl);

            consoleLogger(`Link-${indexOfPdf}. ${pdfNoteUrl}.`);

            const pdfTextContents = await downloadPDF(pdfNoteUrl);

            if (!pdfTextContents) {
               continue;
            }

            consoleLogger(`Successfully got PDF texts.`);

            // Extracting match details from pdf contents | basically it returns [Array];
            const contents = extractMatchInfo(pdfTextContents);

            if (!Array.isArray(contents) || contents.length === 0) {
               continue;
            }

            consoleLogger(`Pdf downloaded and extracted contents successfully.`);

            for (const content of contents) {
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

               if (!playerOne || !playerTwo || !nameOfEvent) {
                  consoleLogger(`Some fields are missing.`);
                  continue;
               }

               const title = capitalizeFirstLetterOfEachWord(`${nameOfEvent} Predictions: ${playerOne} vs ${playerTwo} - ${shortDateOfEvent}`);

               const slug = slugMaker(title);
               try {
                  // Checking post availability in the wordpress post by rest api;
                  const isUniquePost = await checkExistingPostOfWP(constant?.postExistUri(slug), token);

                  if (isUniquePost) {
                     consoleLogger(`Post already exist for ${slug}.`);
                     continue;
                  }

                  consoleLogger(`Starting ${slug}.`);

                  let playerOneMedia = {}, playerTwoMedia = {};

                  playerOneMedia = await getMediaIdOfWP(constant.mediaUri(player1slug), token);
                  playerTwoMedia = await getMediaIdOfWP(constant.mediaUri(player2slug), token);

                  if (!playerOneMedia?.mediaId) {
                     playerOneMedia = await getMediaIdOfWP(constant.mediaUri(`generic${Math.floor(Math.random() * 10) + 1}`), token);
                  }

                  if (!playerTwoMedia?.mediaId) {
                     playerTwoMedia = await getMediaIdOfWP(constant.mediaUri(`generic${Math.floor(Math.random() * 10) + 1}`), token);
                  }

                  // It returns tags ids like [1, 2, 3];
                  const tagIds = await getPostTagIdsOfWP(constant?.tagUri, [playerOne, playerTwo, `ATP ${nameOfEvent}`], token);

                  consoleLogger("Paraphrase starting...");
                  const paraphrasedBlog = await paraphraseContents(constant?.paraphrasedCommand(text));
                  consoleLogger("Paraphrased done.");

                  const p1 = `<p>
                                       The 2024 ${nameOfEvent} continues with plenty of interesting matches on the ${dayOfEvent} schedule. 
                                       Let's have a look at all the career, performance and head-to-head stats for the match and find out if ${playerOne} or ${playerTwo} is expected to win.
                                    </p>`;

                  // Making html contents
                  const htmlContent = `
                              <div style="padding-bottom: 5px;">
                                 <h2 style="margin-top: unset;">ATP ${nameOfEvent}</h2>
                                 <p>${content?.eventFullDate}, ${addressOfEvent}.</p>
                              </div>

                              <div style="display: flex; flex-direction: row;">${imgWrapper([playerOneMedia, playerTwoMedia], getSurnameOfPlayer(playerOne), getSurnameOfPlayer(playerTwo))}</div>
         
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

                              ${p1.replace(/\n/g, " ")}
         
                              <br/> <br/>
         
                              <h3>Match Details:</h3>
                              <p>${playerOne} vs ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
                              
                              <br/> <br/>
         
                              <h3>${playerOne} vs ${playerTwo} Head-to-Head, Preview, Stats & Pick:</h3>
                              <article>
                                 <h5>Head To Head ${content?.leads}.</h5>
                                 <br/>
                                 <p>${paraphrasedBlog && paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
                              </article>
            
                              <br/> <br/>
            
                              <h3>${playerOne} vs ${playerTwo} Prediction:</h3>
         
                              <p>
                                 I believe ${playerOne} will win in straight sets. 
                                 The Stevegtennis.com prediction algorithm has a much better success rate in picking 
                                 match winners than me!\n
                                 So check out who it picks for this match here: <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank">
                                    Stevegtennis.com ${playerOne} vs ${playerTwo} prediction.
                                 </a>      
                              </p>
                              `;


                  // finally making a post request by wordpress rest api 
                  consoleLogger(`Post creating...`);
                  await createPostOfWP(constant?.postUri, token, {
                     title,
                     slug,
                     content: htmlContent,
                     status: constant?.postStatus,
                     author: constant?.authorId,
                     tags: tagIds,
                     featured_media: playerOneMedia?.mediaId || playerTwoMedia?.mediaId,
                     categories: [categoryId]
                  });
                  consoleLogger(`Post created for ${slug}.`);

                  postCounter += 1;

                  await delay(3000);

               } catch (error) {
                  consoleLogger(`Error Inside Loop: ${error?.message} Skipping this post.`);
                  await delay(4000);
                  continue;
               }
            }

            await delay(1000);
            indexOfPdf++;
         } catch (error) {
            consoleLogger(`Error processing mediaNoteUrl: ${error.message}`);
            await delay(4000);
            continue;
         }
      }

      return { message: `${postCounter >= 1 ? `Total ${postCounter} posts created.` : "No posts have been created."} Operation done.` };
   } catch (error) {
      throw new Error(`Error In Init: ${error?.message}`);
   }
};

module.exports = init;