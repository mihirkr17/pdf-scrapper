const fs = require('fs');
const path = require('path');

// Directory containing the image files
const directory = 'atp';

fs.readdir(directory, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach(file => {
        // Extract player ID from the filename
        const playerId = path.parse(file).name;


        // Pad player ID with leading zeros to make it 6 digits long

  
        const paddedPlayerId = playerId.length === 6 ? playerId : playerId.padStart(6, '0');

        // New filename with padded player ID
        const newFilename = `${paddedPlayerId}.jpg`;

        // Rename the file
        fs.rename(path.join(directory, file), path.join(directory + "2", newFilename), err => {
            if (err) {
                console.error(`Error renaming file ${file}:`, err);
            } else {
                console.log(`File ${file} renamed to ${newFilename}`);
            }
        });
    });
});
