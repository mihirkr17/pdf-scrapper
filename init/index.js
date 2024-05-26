const { constant } = require("../config");
const postTemplate = require("../resource/postTemplate");
const { getPdfLinks,
   createPostOfWP,
   getPostTagIdsOfWP,
   getMediaIdOfWP,
   checkExistingPostOfWP,
   downloadPDF,
   paraphraseContents
} = require("../services");

const { consoleLogger, extractMatchInfo,
   imgWrapper,
   delay,
   slugMaker,
   capitalizeFirstLetterOfEachWord,
   getSurnameOfPlayer
} = require("../utils");



async function init() {
   try {
      const resources = postTemplate;

      if (!resources || !Array.isArray(resources)) {
         throw new Error(`Resource not found.`);
      }

      consoleLogger("Resource found.");

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
               const leads = content?.leads;
               const eventFullDate = content?.eventFullDate;
               const playerOneSurname = getSurnameOfPlayer(playerOne);
               const playerTwoSurname = getSurnameOfPlayer(playerTwo);


               if (!playerOne || !playerTwo || !nameOfEvent) {
                  consoleLogger(`Some fields are missing.`);
                  continue;
               }

               try {
                  let playerOneMedia = {}, playerTwoMedia = {};

                  playerOneMedia = await getMediaIdOfWP(constant.mediaUri(player1slug), token);
                  playerTwoMedia = await getMediaIdOfWP(constant.mediaUri(player2slug), token);

                  if (!playerOneMedia?.mediaId) {
                     playerOneMedia = await getMediaIdOfWP(constant.mediaUri(`generic${Math.floor(Math.random() * 10) + 1}`), token);
                  }

                  if (!playerTwoMedia?.mediaId) {
                     playerTwoMedia = await getMediaIdOfWP(constant.mediaUri(`generic${Math.floor(Math.random() * 10) + 1}`), token);
                  }

                  const imageWrapperHtml = imgWrapper([playerOneMedia, playerTwoMedia], playerOneSurname, playerTwoSurname);

                  for (const resource of resources) {
                     if (!resource?.categoryId || !resource?.category || !resource?.language) {
                        continue;
                     }

                     const categoryId = resource?.categoryId;
                     const playerOneTag = resource?.tags?.replace("name", playerOne);
                     const playerTwoTag = resource?.tags?.replace("name", playerTwo);
                     const eventTag = nameOfEvent + " " + resource?.category;

                     const newTitle = resource?.title?.replace("nameOfEvent", nameOfEvent)
                        ?.replace("playerOne", playerOne)
                        ?.replace("playerTwo", playerTwo)
                        ?.replace("shortDateOfEvent", shortDateOfEvent);

                     // Capitalize first letter of each words
                     const title = capitalizeFirstLetterOfEachWord(newTitle);

                     // Making slug from title
                     const slug = slugMaker(title);

                     try {
                        const isUniquePost = await checkExistingPostOfWP(constant?.postExistUri(slug), token);

                        if (isUniquePost) {
                           consoleLogger(`Post already exist for ${slug}.`);
                           continue;
                        }

                        consoleLogger(`Starting post for ${resource?.language}. Slug: ${slug}.`);
                        const tagIds = await getPostTagIdsOfWP(constant?.tagUri, [playerOneTag, playerTwoTag, eventTag], token);

                        await delay();

                        consoleLogger("Paraphrase starting...");
                        const paraphrasedBlog = await paraphraseContents(constant?.paraphrasedCommand(resource?.language, text));
                        consoleLogger("Paraphrased done.");

                        const htmlContent = resource?.contents(nameOfEvent,
                           leads,
                           addressOfEvent,
                           playerOne,
                           playerTwo,
                           shortDateOfEvent,
                           eventFullDate,
                           roundOfEvent,
                           dayOfEvent,
                           paraphrasedBlog,
                           player1slug,
                           player2slug,
                           imageWrapperHtml);

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
                        consoleLogger(`Post created.`);

                        postCounter += 1;
                        await delay(3000);
                     } catch (error) {
                        consoleLogger(error?.message);
                        await delay();
                        continue;
                     }
                  }

               } catch (error) {
                  consoleLogger(`Error Inside Loop: ${error?.message} Skipping this post.`);
                  await delay(3000);
                  continue;
               }
            }

            await delay();
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