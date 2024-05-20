const { constant } = require("../config");


async function openConfiguration(req, res, next) {
   try {
      const scheduleTime = parseInt(constant?.scheduleTime);
      const scheduleTimeLabel = constant?.scheduleTimeLabel;
      const scheduleAction = constant?.scheduleAction;

      return res.status(200).send({ message: "data got", data: { scheduleTime, scheduleAction, scheduleTimeLabel } });
   } catch (error) {
      next(error);
   }
}

module.exports = { openConfiguration }