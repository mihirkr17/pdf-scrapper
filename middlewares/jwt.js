const jwt = require("jsonwebtoken");

async function verifyAuth(req, res, next) {
   try {
      const token = req.cookies.jwt;

      if (!token) return res.status(401).send({ message: "Unauthorized." });

      jwt.verify(token, process.env.SECRET, (err, decoded) => {
         if (err) return res.status(401).send({ message: "Unauthorized." });

         req.decoded = decoded;
         next();
      });

   } catch (error) {
      next(error);
   }
}

module.exports = { verifyAuth };