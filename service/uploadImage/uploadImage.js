const cloudinary = require("../../cloudinary");
const streamifier = require("streamifier");


const uploadImage = async (req) => {
  if (!req.file) {
    throw new Error("No image uploaded.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream =  cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    const bufferStream = streamifier.createReadStream(req.file.buffer);
    bufferStream.pipe(uploadStream);
  });
};

module.exports = { uploadImage };
