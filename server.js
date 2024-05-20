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
const { constant } = require("./config");
const { checkExistingPostOfWP } = require("./services");


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

      const titleMatch = "Koepfer Vs Cosano Pick & Prediction With H2H Stats Analysis - Open Parc - Lyon ATP 20th May 2024 - Open Parc  Predictions Day 1";
      const isUniquePost = await checkExistingPostOfWP(constant?.postExistUri(titleMatch), "SmFtZXMgTW9ycmlzOnNLZFIgZ0MxRSBCT3pMIDFZWjAgd2Q5WCBVTVlW");


      consoleLogger(isUniquePost);
      return;
      if (!["ON", "OFF"].includes(constant?.scheduleAction)) {
         throw new Error(`ERROR: Schedule action must be set as "SCHEDULE_ACTION=ON or OFF" in .env`);
      }

      const isScheduleTimeValueDigit = (/[2-9]/g).test(constant?.scheduleTime);

      if (!isScheduleTimeValueDigit) {
         throw new Error(`ERROR: Schedule time must be set as "SCHEDULE_TIME=2 to 9" in .env.`);
      }
      const scheduleTime = parseInt(constant?.scheduleTime);

      const scheduleTimeLabel = constant?.scheduleTimeLabel;

      if (!["minutes", "hours"].includes(scheduleTimeLabel)) {
         throw new Error(`ERROR: Schedule format must be set as "SCHEDULE_TIME_LABEL=minutes or hours" in .env.`);
      }

      const scheduleJobTime = scheduleTimeLabel === "minutes" ? `*/${scheduleTime} * * * *` : `0 */${scheduleTime} * * *`;

      schedule.scheduleJob(scheduleJobTime, async function () {
         try {
            const isSchedule = constant?.scheduleAction === "ON" ? true : false;

            consoleLogger(`Function will run every ${scheduleTime} ${scheduleTimeLabel}.`);

            if (isSchedule) {
               const result = await mainExc();

               consoleLogger(`${result?.message}`);
            } else {
               consoleLogger("Schedule off.");
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