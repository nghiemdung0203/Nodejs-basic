const multer = require("multer");

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 },
});


const uploadImageMiddleware = (req, res, next) => {
    upload.single("image")(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File too large. Maximum allowed size is 1MB." });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(500).json({ message: "Unknown error occurred during file upload." });
      }
      next();
    });
  };
  
  module.exports = uploadImageMiddleware;