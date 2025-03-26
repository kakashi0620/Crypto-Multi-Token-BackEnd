const express = require("express");
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const controller = require("../controller/dbCtrl");

const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/backup", authMiddleware, isAdmin, controller.backup);
router.post("/status", controller.status)

// Set up file upload storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Destination folder for uploaded files
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // File name
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Ensure the "uploads" directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Endpoint for uploading files
router.post('/restore', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  controller.restore(req.file.filename);
  res.status(200).send({
    message: 'File uploaded successfully.',
    filename: req.file.filename,
    success : true
  });
});

// Endpoint for downloading files
router.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);
  console.log("filePath=", filePath);

  // Check if file exists
  if (fs.existsSync(filePath)) {
    // res.download(filePath, filename, (err) => {
    //    if (err) {
    //    res.status(500).send('Error downloading file.');
    //    }
    // });
    res.sendFile(filePath, { 
        headers: {
            'Content-Type': 'application/octet-stream', // Adjust MIME type based on the file
            'Content-Disposition': `attachment; filename="${filename}"`  // Suggested filename for download
        }
    });

  } else {
    res.status(404).send('File not found.');
  }
});

module.exports = router;
