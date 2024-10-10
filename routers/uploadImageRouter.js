const router = require("express").Router();
const multer = require("multer");
const { uploadImageController } = require("../controllers/uploadImage/uploadImage");
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage }); // Create upload middleware

router.post("/uploadImage", upload.single("image"), uploadImageController);

module.exports = router;
