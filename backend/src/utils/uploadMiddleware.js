const multer = require('multer');

// Set up storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'path/to/your/uploads'); // Specify the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original file name
    }
});

// Create the upload middleware
const upload = multer({ storage });

// Export the upload middleware
module.exports = upload; 