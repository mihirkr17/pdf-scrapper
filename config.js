const constant = {
   openAiSecret: process.env.OPEN_AI_SECRETS,
   restAuthToken: process.env.REST_TOKEN || process.env.REST_TOKEN_JAMES,
   clientDomainName: process.env.CLIENT_DOMAIN,
   clientUserName: process.env.CLIENT_USERNAME,
   clientUserPassword: process.env.CLIENT_PWD,
   jwtUri: "",
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
   postExistUri: function (title) {
      return `${constant.clientDomainName}/wp-json/wp/v2/posts?status=any&search=${encodeURIComponent(title)}`
   },
   paraphrasedCommand: function (content) {
      return `Reword/Rephrase word by word using paragraphs "${content}"`;
   },
   postUri: "",
   authorId: 1, //1844,
   postStatus: "draft"
};

// Set properties that depend on other properties
constant.jwtUri = `${constant.clientDomainName}/wp-json/jwt-auth/v1/token?username=${constant.clientUserName}&password=${constant.clientUserPassword}`;
constant.tagUri = `${constant.clientDomainName}/wp-json/wp/v2/tags`;
constant.categoryUri = `${constant.clientDomainName}/wp-json/wp/v2/categories`;
constant.postUri = `${constant.clientDomainName}/wp-json/wp/v2/posts`;


module.exports = { constant };