const constant = {
   openAiSecret: process.env.OPEN_AI_SECRETS,
   authTokenSg: process.env.AUTH_TOKEN_SG,
   authTokenMs: process.env.AUTH_TOKEN_MS,
   domainSg: process.env.CLIENT_DOMAIN_SG,
   domainMs: process.env.CLIENT_DOMAIN_MS,
   mediaUri: function (domain, slug) {
      return `${domain}/wp-json/wp/v2/media?slug=${slug}_yes`;
   },
   pdfUri: function (pdfLink) {
      return `https://www.atptour.com${pdfLink}`;
   },
   tagUri: function (domain) {
      return `${domain}/wp-json/wp/v2/tags`;
   },
   categoryUri: function (domain) {
      return `${domain}/wp-json/wp/v2/categories`;
   },
   atpNoteUri: function (year = 2024) {
      return `https://www.atptour.com/en/media/daily-media-notes?year=${year}`;
   },
   postExistUri: function (domain, slug = "") {
      return `${domain}/wp-json/wp/v2/posts?status=any&slug=${slug}`;
   },
   paraphrasedCommand: function (language, content) {
      return `Rewrite this in ${language}, not adding extra facts that are not in this text, reply in paragraph form, in an interesting tennis journalistic manner with a long as possible reply: ${content}`;
   },
   postStatusAll: ["publish", "future", "draft", "pending", "private"],
   postUri: function (domain) {
      return `${domain}/wp-json/wp/v2/posts`;
   },
   authorIdSg: process.env.AUTHOR_ID_SG,
   authorIdMs: process.env.AUTHOR_ID_MS,
   postStatus: process.env.POST_STATUS
};


module.exports = { constant };

// SmFtZXNNb3JyaXMzNjU6Y2dVSCBZc1ZnIHRKaDYgNWFydyA0djQzIEt3REU=