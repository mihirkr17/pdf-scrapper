const express = require("express");
const cookieParser = require("cookie-parser");
const schedule = require("node-schedule");
require("dotenv").config();
const configuration = require("./configuration.json");

// const fetch = (...args) =>
//    import('node-fetch').then(({ default: fetch }) => fetch(...args));

const {
   consoleLogger,
} = require("./utils");

const path = require("path");
const mainExc = require("./init/init");


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
app.use(require("./routes/route"));


(async () => {
   try {
      schedule.scheduleJob(`*/${configuration?.scheduleTime} * * * *`, async function () {
         try {
            consoleLogger(`Function will run every ${configuration?.scheduleTime} ${configuration?.scheduleTimeLabel}.`);

            if (configuration?.scheduleAction) {

               const result = await mainExc();

               consoleLogger(`${result?.message}`);
            } else {
               consoleLogger("Schedule is off.");
            }
         } catch (error) {
            throw error;
         }
      });

   } catch (error) {
      consoleLogger(error?.message);
   }
})();

app.listen(PORT, async () => {
   try {
      consoleLogger(`PDF scrapper server running successfully on PORT: ${PORT}`);
   } catch (error) {
      consoleLogger(error?.message);
   }
});