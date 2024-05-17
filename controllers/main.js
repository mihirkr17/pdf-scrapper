const { readFileAsynchronously, createFileAsynchronously } = require("../utils");
const configuration = require("../configuration.json");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
      const scheduleAction = body?.scheduleActionValue;

      let dataResult = configuration;

      dataResult["scheduleTime"] = parseInt(scheduleTime);

      dataResult["scheduleAction"] = scheduleAction;

      await createFileAsynchronously("configuration.json", JSON.stringify(dataResult));

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
         expiresIn: "16h",
      });

      res.cookie('jwt', token, { httpOnly: true, maxAge: 900000 });

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