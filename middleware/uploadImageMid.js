const multer = require("multer");
require("dotenv").config();
const CloudmersiveVirusApiClient = require("cloudmersive-virus-api-client");

const defaultClient = CloudmersiveVirusApiClient.ApiClient.instance;
const Apikey = defaultClient.authentications["Apikey"];
Apikey.apiKey = process.env.API_KEY_ANTIVIRUS;

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size to 1MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/; // Allowed file types
    const extname = fileTypes.test(file.mimetype); // Check MIME type
    const mimetype = fileTypes.test(file.originalname.split(".").pop().toLowerCase()); // Check file extension

    if (extname && mimetype) {
      return cb(null, true); // Valid file
    } else {
      cb(new Error("File type not allowed. Only JPG and PNG are accepted."), false); // Invalid file
    }
  },
});

// Middleware to upload and scan the image
const uploadImageMiddleware = (req, res, next) => {
  upload.single("image")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large. Maximum allowed size is 1MB." });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message }); // Return invalid file error
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Proceed to scan the file using Cloudmersive Virus API
    const api = new CloudmersiveVirusApiClient.ScanApi();
    const fileBuffer = req.file.buffer; // File buffer from Multer

    api.scanFile(fileBuffer, (error, data, response) => {
      if (error) {
        console.error("Virus scan failed:", error);
        return res.status(500).json({ message: "Virus scan failed." });
      } else {
        console.log("Scan result:", data);
        if (data.CleanResult) {
          // If the file is clean, proceed to the next middleware
          next();
        } else {
          return res.status(400).json({ message: "File is infected with malware." });
        }
      }
    });
  });
};

module.exports = uploadImageMiddleware;
