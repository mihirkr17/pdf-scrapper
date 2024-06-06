const { constant } = require("../config");
const { postTemplateSg, postTemplateMs } = require("../resource/postTemplate");
const {
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

async function init(infos, mediaNoteUrls) {
   try {
      const resources = infos?.nick === "sg" ? postTemplateSg : postTemplateMs;

      if (!resources || !Array.isArray(resources)) {
         throw new Error(`Resource not found.`);
      }

      consoleLogger("Resource found.");

      consoleLogger(`Script started for ${infos?.domain}.`);

      // Basic wordpress authentication
      const token = infos?.authToken;

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

            consoleLogger(`Total ${contents.length} posts will create.`);

            consoleLogger(`Pdf downloaded and extracted contents successfully.`);

            for (const content of contents.slice(0, 1)) {
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
               const yearMatch = eventDate?.match(/\d{4}/);
               const eventYear = yearMatch ? yearMatch[0] : new Date().getFullYear();
               const plainEventName = eventName?.replace(/\d/g, '')?.trim();

               if (!playerOne || !playerTwo || !eventName) {
                  consoleLogger(`Some fields are missing.`);
                  continue;
               }

               try {
                  let playerOneMedia = {}, playerTwoMedia = {};

                  playerOneMedia = await getMediaIdOfWP(constant.mediaUri(infos?.domain, player1slug), token);
                  playerTwoMedia = await getMediaIdOfWP(constant.mediaUri(infos?.domain, player2slug), token);

                  if (!playerOneMedia?.mediaId) {
                     playerOneMedia = await getMediaIdOfWP(constant.mediaUri(infos?.domain, `generic${Math.floor(Math.random() * 10) + 1}`), token);
                  }

                  if (!playerTwoMedia?.mediaId) {
                     playerTwoMedia = await getMediaIdOfWP(constant.mediaUri(infos?.domain, `generic${Math.floor(Math.random() * 10) + 1}`), token);
                  }


                  const imageWrapperHtml = imgWrapper([playerOneMedia, playerTwoMedia], playerOneSurname, playerTwoSurname, infos?.nick);


                  await Promise.all(resources.map(async (resource) => {
                     try {
                        if (!resource?.categoryId || !resource?.category || !resource?.language || !resource?.eventTag) {
                           throw new Error("Something went wrong.");
                        }

                        const categoryId = resource?.categoryId;
                        const playerOneTag = resource?.playerTag?.replace("#playerName", infos?.nick === "sg" ? playerOne : playerOneSurname);
                        const playerTwoTag = resource?.playerTag?.replace("#playerName", infos?.nick === "sg" ? playerTwo : playerTwoSurname);
                        const eventTag = resource?.eventTag?.replace("#eventName", infos?.nick === "sg" ? eventName : plainEventName);

                        const [eventHeadingTwoTranslate, eventAddressTranslate, eventDayTranslate, eventDateTranslate] = await Promise.all([
                           translate(eventHeadingTwo, { from: 'en', to: resource?.languageCode }),
                           translate(eventAddress, { from: 'en', to: resource?.languageCode }),
                           translate(eventDay, { from: 'en', to: resource?.languageCode }),
                           translate(eventDate, { from: 'en', to: resource?.languageCode }),
                        ]);

                        let newTitle = "";

                        if (infos?.nick === "sg") {
                           newTitle = resource?.title?.replace("#eventName", eventName)
                              ?.replace("#playerOne", playerOne)
                              ?.replace("#playerTwo", playerTwo)
                              ?.replace("#eventDate", eventDateTranslate);
                        }

                        if (infos?.nick === "ms") {
                           newTitle = resource?.title?.replace("#eventName", plainEventName)
                              ?.replace("#playerOneSurname", playerOneSurname)
                              ?.replace("#playerTwoSurname", playerTwoSurname)
                              ?.replace("#eventYear", eventYear);
                        }

                        const title = capitalizeFirstLetterOfEachWord(newTitle);
                        consoleLogger(`S-${postCounter}. Post Title: ${title}.`);
                        const slug = slugMaker(title);
                        consoleLogger(`S-${postCounter}. Post Slug: ${slug}.`);

                        const isUniquePost = await checkExistingPostOfWP(constant?.postExistUri(infos?.domain, slug), token);

                        if (isUniquePost) {
                           consoleLogger(`S-${postCounter}. Post already exists.`);
                           return;
                        }

                        consoleLogger(`S-${postCounter}. Post language: ${resource?.language}.`);
                        consoleLogger(`S-${postCounter}. Event Day: ${eventDay}.`);
                        consoleLogger(`S-${postCounter}. Tags generating for ${playerOneTag}, ${playerTwoTag}, ${eventTag}`);

                        const tagIds = await getPostTagIdsOfWP(constant?.tagUri(infos?.domain), [playerOneTag, playerTwoTag, eventTag], token);

                        if (!Array.isArray(tagIds) || tagIds.length !== 3) {
                           throw new Error(`S-${postCounter}. Tag generation failed. Terminate the request.`);
                        }

                        consoleLogger(`S-${postCounter}. Tags generated. Tag Id's: ${tagIds}`);

                        consoleLogger(`S-${postCounter}. Paraphrase starting...`);
                        const chatgptCommand = infos?.chatgptCommand?.replace("#language", resource?.language)?.replace("#texts", text);
                        const paraphrasedBlog = await paraphraseContents(chatgptCommand);
                        consoleLogger(`S-${postCounter}. Paraphrased done.`);

                        const htmlContent = resource?.contents(
                           eventName,
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
                           imageWrapperHtml,
                           playerOneSurname,
                           playerTwoSurname,
                           eventYear, plainEventName);

                        consoleLogger(`S-${postCounter}. Post creating...`);
                        await createPostOfWP(constant?.postUri(infos?.domain), token, {
                           title,
                           slug,
                           content: htmlContent,
                           status: constant?.postStatus,
                           author: parseInt(infos?.authorId),
                           tags: tagIds,
                           featured_media: playerOneMedia?.mediaId || playerTwoMedia?.mediaId,
                           categories: [categoryId]
                        });
                        consoleLogger(`S-${postCounter}. Post created successfully.`);

                        postCounter += 1;
                     } catch (error) {
                        consoleLogger(`S-${postCounter}. Error In Resource Model: ${error?.message}.`);
                        await delay(1000);
                     }
                  }));
               } catch (error) {
                  consoleLogger(`Error In Contents Model: ${error?.message}.`);
                  await delay(1000);
               }
            }
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