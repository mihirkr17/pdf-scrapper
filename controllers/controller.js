const { readFileAsynchronously, createFileAsynchronously, consoleLogger } = require("../utils");
const configuration = require("../configuration.json");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mainExc = require("../init/init");

async function restartTask(req, res, next) {
   try {
      process.kill(process.pid, 'SIGUSR2');

      return res.send('Server restarting...');
   } catch (error) {
      next(error);
   }
}


async function openConfiguration(req, res, next) {
   try {
      return res.status(200).send({ message: "data got", data: configuration });
   } catch (error) {
      next(error);
   }
}


async function editConfiguration(req, res, next) {
   try {
      const body = req?.body;
      const scheduleTime = body?.scheduleTimeValue;
      const scheduleTimeLabel = body?.scheduleTimeLabel;
      const scheduleAction = body?.scheduleActionValue;

      if (!scheduleTime || typeof scheduleTime !== "number") {
         return res.status(400).json({
            message: "Schedule time should be number.",
            success: true
         });
      }

      if (!["hours", "minutes"].includes(scheduleTimeLabel)) {
         return res.status(400).json({
            success: true,
            message: "Schedule time label should hours or minutes."
         });
      }

      let dataResult = configuration;

      dataResult["scheduleTime"] = parseInt(scheduleTime);

      dataResult["scheduleAction"] = scheduleAction;

      await createFileAsynchronously("configuration.json", JSON.stringify(dataResult));

      if (scheduleAction) {
         const result = await mainExc();
         consoleLogger(`${result?.message}`);
      }

      return res.status(200).send({ message: "Setting updated." })
   } catch (error) {
      next(error);
   }
}


async function loginControl(req, res, next) {
   try {
      const email = req.body?.email;
      const password = req.body?.password;

      let dataSet = configuration;

      if (dataSet?.auth?.email) {

         if (dataSet?.auth?.email !== email) return res.status(400).json({ message: "Email not matched." });

         const isValidPwd = await bcrypt.compare(password, dataSet?.auth?.password);

         if (!isValidPwd) return res.status(400).json({ message: "Invalid password" });

      } else {
         const bPwd = await bcrypt.hash(password, 10);

         const auth = {
            email, password: bPwd
         }

         dataSet["auth"] = auth;

         await createFileAsynchronously("configuration.json", JSON.stringify(dataSet));
      }

      const token = jwt.sign({ email }, process.env.SECRET, {
         algorithm: "HS256",
         expiresIn: "1h",
      });

      res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });

      return res.status(200).json({ message: "Login success.", success: true });
   } catch (error) {
      next(error);
   }
}

async function logoutControl(req, res, next) {
   try {

      res.cookie('jwt', '', { expires: new Date(0), httpOnly: true });
      return res.send({ message: 'Logged out successfully', success: true });
   } catch (error) {
      next(error);
   }
}


module.exports = { restartTask, openConfiguration, editConfiguration, loginControl, logoutControl }