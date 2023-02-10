// eslint-disable-next-line import/no-extraneous-dependencies
const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.uploads = async (file, folderName) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folderName,
    });
    return { url: result.url, id: result.public_id };
  } catch (err) {
    throw new Error("failed to upload in cloudinary");
  }
};
