const router = require("express").Router();
const uploadImageMiddleware = require("../middleware/uploadImageMid");
const {
  uploadImageController,
} = require("../controllers/uploadImage/uploadImage");
router.post("/uploadImage", uploadImageMiddleware, uploadImageController);

module.exports = router;
