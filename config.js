const constant = {
   scheduleTime: process.env.SCHEDULE_TIME,
   scheduleTimeLabel: process.env.SCHEDULE_TIME_LABEL,
   scheduleAction: process.env.SCHEDULE_ACTION,
   openAiSecret: process.env.OPEN_AI_SECRETS,
   restAuthToken: process.env.SG_AUTH_TOKEN,
   clientDomainName: process.env.CLIENT_DOMAIN,
   mediaUri: function (slug) {
      return `${constant.clientDomainName}/wp-json/wp/v2/media?slug=${slug}_yes`;
   },
   pdfUri: function (pdfLink) {
      return `https://www.atptour.com${pdfLink}`;
   },
   tagUri: "",
   categoryUri: "",
   categoryName: "ATP Tennis Predictions",
   atpNoteUri: function (year = 2024) {
      return `https://www.atptour.com/en/media/daily-media-notes?year=${year}`;
   },
   postExistUri: function (slug = "") {
      return `${constant.clientDomainName}/wp-json/wp/v2/posts?status=any&slug=${slug}`
   },
   paraphrasedCommand: function (content) {
      return `Reword/Rephrase word by word using paragraphs "${content}"`;
   },
   postStatusAll: ["publish", "future", "draft", "pending", "private"],
   postUri: "",
   authorId: process.env.AUTHOR_ID,
   postStatus: process.env.POST_STATUS,
   categoryItems: process.env.CATEGORY
};

// Set properties that depend on other properties
constant.tagUri = `${constant.clientDomainName}/wp-json/wp/v2/tags`;
constant.categoryUri = `${constant.clientDomainName}/wp-json/wp/v2/categories`;
constant.postUri = `${constant.clientDomainName}/wp-json/wp/v2/posts`;


module.exports = { constant };