const express = require("express");
const { restartTask, openConfiguration, editConfiguration, loginControl, logoutControl } = require("../controllers/main");
const { verifyAuth } = require("../middlewares/jwt");

const router = express.Router();

router.get("/", (req, res) => {
   return res.send("index.html");
});

router.post("/restart-server", restartTask);

router.post("/conf-open", verifyAuth, openConfiguration);

router.put("/conf-edit", editConfiguration);

router.post("/auth/login", loginControl);

router.post("/auth/logout", logoutControl);

module.exports = router;