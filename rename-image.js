const fs = require("fs");
const path = require("path");


const imageDirectory = "./players";
const newPlayers = "./newNames";
// function readFiles () {
//    return new Promise((resolve, reject) => {
//       const stream = fs.readdir(pathname)
//    });
// }

(async () => {
   fs.readdir(imageDirectory, (err, files) => {
      if (err) {
         console.error('Error reading directory:', err);
         return;
      }


      // const regex = /[-1|-2|-3|-4|-5|-6|-7|-8]/g;

      files.forEach((file, index) => {
         const oldFilePath = path.join(imageDirectory, file);
         const newFileName = file.replace(/-1|-2|-3|-4|-5|-6|-7|-8/g, "_yes")?.toLowerCase(); // `${newPrefix}${index + 1}${path.extname(file)}`;
         const newFilePath = path.join(newPlayers, newFileName);
      

         fs.rename(oldFilePath, newFilePath, (err) => {
            if (err) {
               console.error(`Error renaming ${file}:`, err);
            } else {
               console.log(`Renamed ${file} to ${newFileName}`);
            }
         });
      });
   })
})();