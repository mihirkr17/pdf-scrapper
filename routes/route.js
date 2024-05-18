const express = require("express");
const { openConfiguration } = require("../controllers/controller");

const router = express.Router();

router.get("/", (req, res) => {
   return res.send("index.html");
});

// router.post("/restart-server", restartTask);

router.post("/conf-open", openConfiguration);

// router.put("/conf-edit", editConfiguration);

// router.post("/auth/login", loginControl);

// router.post("/auth/logout", logoutControl);

module.exports = router;