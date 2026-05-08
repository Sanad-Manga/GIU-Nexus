const cloudinary = require('../config/cloudinary');

const uploadProfilePicture = (fileBuffer, userId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `profile_pictures/users/${userId}`,
        public_id: 'profile-picture',
        overwrite: true,
        transformation: [{ width: 400, height: 400, crop: 'fill' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = { uploadProfilePicture };
