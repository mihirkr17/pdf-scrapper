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


const translate = (...args) =>
   import('translate').then(({ default: fetch }) => fetch(...args));

translate.engine = 'libre';
translate.key = process.env.LIBRE_TRANSLATE_KEY;


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

      for (const mediaNoteUrl of mediaNoteUrls.slice(-1)) {

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
               const eventName = content?.eventName;
               const eventDate = content?.eventDate;
               const eventDay = content?.eventDay;
               const eventAddress = content?.eventAddress;
               const eventRound = content?.round || null;
               const eventHeadingTwo = content?.eventHeadingTwo;
               const leads = content?.leads;
               const playerOneSurname = getSurnameOfPlayer(playerOne);
               const playerTwoSurname = getSurnameOfPlayer(playerTwo);

               if (!playerOne || !playerTwo || !eventName) {
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
                     const eventTag = eventName + " " + resource?.category;

                     try {

                        const [eventHeadingTwoTranslate, eventAddressTranslate, eventDayTranslate, eventDateTranslate] = await Promise.all([
                           translate(eventHeadingTwo, { from: 'en', to: languageCode }),
                           translate(eventAddress, { from: 'en', to: languageCode }),
                           translate(eventDay, { from: 'en', to: languageCode }),
                           translate(eventDate, { from: 'en', to: languageCode }),
                        ]);

                        const newTitle = resource?.title?.replace("eventName", eventName)
                           ?.replace("playerOne", playerOne)
                           ?.replace("playerTwo", playerTwo)
                           ?.replace("eventDate", eventDateTranslate);

                        // Capitalize first letter of each words
                        const title = capitalizeFirstLetterOfEachWord(newTitle);

                        // Making slug from title
                        const slug = slugMaker(title);

                        const isUniquePost = await checkExistingPostOfWP(constant?.postExistUri(slug), token);

                        if (isUniquePost) {
                           consoleLogger(`Post already exist for ${slug}.`);
                           continue;
                        }

                        consoleLogger(`Starting post for ${resource?.language}. Slug: ${slug}.`);

                        consoleLogger("Tags generating...");
                        const tagIds = await getPostTagIdsOfWP(constant?.tagUri, [playerOneTag, playerTwoTag, eventTag], token);
                        consoleLogger(`Tags generated. Ids: ${tagIds}`);

                        consoleLogger("Paraphrase starting...");
                        const paraphrasedBlog = await paraphraseContents(constant?.paraphrasedCommand(resource?.language, text));
                        consoleLogger("Paraphrased done.");

                        const htmlContent = resource?.contents(eventName,
                           leads,
                           eventAddressTranslate,
                           playerOne,
                           playerTwo,
                           eventDateTranslate,
                           eventHeadingTwoTranslate,
                           eventRound,
                           eventDayTranslate,
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
                           author: parseInt(constant?.authorId),
                           tags: tagIds,
                           featured_media: playerOneMedia?.mediaId || playerTwoMedia?.mediaId,
                           categories: [categoryId]
                        });
                        consoleLogger(`Post created successfully.`);

                        postCounter += 1;
                        await delay(1000);
                     } catch (error) {
                        consoleLogger(`Error In Language Model: ${error?.message}.`);
                        await delay(1000);
                        continue;
                     }
                  }
                  await delay(1000);
               } catch (error) {
                  consoleLogger(`Error In Contents Model: ${error?.message}.`);
                  await delay(1000);
                  continue;
               }
            }

            await delay();
            indexOfPdf++;
         } catch (error) {
            consoleLogger(`Error In mediaNoteUrl Model: ${error.message}.`);
            await delay(1000);
            continue;
         }
      }

      return { message: `${postCounter >= 1 ? `Total ${postCounter} posts created.` : "No posts have been created."} Operation done.` };
   } catch (error) {
      throw new Error(`Error In Init: ${error?.message}`);
   }
};

module.exports = init;