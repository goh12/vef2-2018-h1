const cloudinary = require('cloudinary');
const fs = require('fs');
const utils = require('util');

const deleteFile = utils.promisify(fs.unlink);


cloudinary.config({
  cloud_name: 'frozenscloud',
  api_key: '178223612873426',
  api_secret: '3CI0fYa389lqibW7YlwINcdeCfY',
});

async function uploadImage(image) {
  const results = await cloudinary.uploader.upload(image, result => result);
  deleteFile(image);
  return results.url;
}

module.exports = {
  uploadImage,
};
