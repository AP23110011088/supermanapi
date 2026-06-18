const cloudinary = require('cloudinary').v2;

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

function uploadToCloudinary(file) {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'herovault', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
}

async function resolveImageUrl(file) {
  if (!file) return null;

  const useCloudinary = [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET
  ].every(Boolean);

  if (useCloudinary && file.buffer) {
    return uploadToCloudinary(file);
  }

  if (file.filename) {
    return `/uploads/${file.filename}`;
  }

  return null;
}

module.exports = { resolveImageUrl };
