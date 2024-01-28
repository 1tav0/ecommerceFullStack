const cloudinary = require('cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const cloudinaryUploadImg = async (fileToUpload) => {
  return new Promise((resolve) => { // Creates and returns a new Promise. The promise represents the asynchronous operation of uploading an image to Cloudinary.
    cloudinary.uploader.upload(fileToUpload, (result) => { // Utilizes the cloudinary.uploader.upload method to upload the specified file to Cloudinary with two parameters The path or URL of the file to be uploaded & A callback function that will be executed once the upload is complete. The result object contains information about the uploaded image.
      //console.log(result);
        resolve( //Calls the resolve function of the Promise to fulfill the Promise. It provides an object with two properties:
        {
          url: result.secure_url, // Extracts the secure URL of the uploaded image from the result object. The secure URL is the HTTPS URL of the uploaded resource.
        },
        {
          resource_type: "auto" // An additional object specifying the resource type as "auto." This is often used to let Cloudinary automatically determine the resource type based on the file's content.
        }
        )
    })
  })
}

// const cloudinaryUploadImg = async (fileToUpload) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(fileToUpload, (result) => {
//       if (result.secure_url) {
//         resolve({
//           url: result.secure_url,
//           resource_type: result.resource_type || "auto",
//         });
//       } else {
//         reject(new Error("Failed to get secure URL from Cloudinary result"));
//       }
//     });
//   });
// };


// The cloudinaryUploadImg function wraps the asynchronous operation of uploading an image to Cloudinary in a Promise.
// It uses the cloudinary.uploader.upload method to perform the upload.
// The function resolves the Promise with an object containing the secure URL of the uploaded image and an additional configuration specifying the resource type as "auto."

module.exports = cloudinaryUploadImg;