const express = require("express");
const { openConfiguration } = require("../controllers/controller");

const router = express.Router();

router.get("/", (req, res) => {
   return res.send("index.html");
});
router.post("/conf-open", openConfiguration);

module.exports = router;