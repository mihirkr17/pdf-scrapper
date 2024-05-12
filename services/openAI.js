const OpenAI = require("openai");
const { constant } = require("../config");

const OPEN_AI_INSTANCE = new OpenAI({
   apiKey: constant?.openAiSecret
});

async function paraphraseBlogText(prompt) {
   try {
      const result = await OPEN_AI_INSTANCE.chat.completions.create({
         model: "gpt-3.5-turbo-16k",
         messages: [{ role: "user", content: `${prompt}` }],
      });
      return result.choices[0].message.content;
   } catch (error) {
      throw error;
   }
}

module.exports = { paraphraseBlogText }