const { uploadImage } = require("../../service/uploadImage/uploadImage");


const uploadImageController = async (req, res) => {
  try {
    const result = await uploadImage(req); // Pass the entire req object
    res.status(200).json({
      message: "Image uploaded successfully",
      url: result.secure_url, // URL of the uploaded image
    });
  } catch (error) {
    if (error.message === "No image uploaded.") {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = { uploadImageController };
