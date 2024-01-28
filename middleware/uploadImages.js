const multer = require("multer"); // handling file uploads
const sharp = require("sharp"); // for image processing
const path = require("path"); // for working with file paths
const fs = require("fs"); //for files to unlink in this case
// Configuring multer's storage engine. This specifies where to save the uploaded files and how to name them
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
  }
})

// This function is a filter used by Multer to determine whether to accept or reject an uploaded file.
const multerFilter = (req, file, cb) => {
  const allowedExtensions = ["jpeg", "jpg"]
  if (file.mimetype.startsWith("image/") && allowedExtensions.includes(file.originalname.split('.').pop().toLowerCase())) {
    cb(null, true)
  } else {
    cb({
      message: "Unsupported file format"
    }, false)
  }
}
// creates a Multer instance named uploadPhoto with specific configuration options for handling file uploads.
const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fieldSize: 2000000 }
});

// asynchronous middleware to resize and save uploaded images
const productImgResize = async (req, res, next) => {
  if (!req.files) return next(); //no files, it immediately calls the next middleware 
  await Promise.all( // Uses Promise.all to concurrently process multiple files in parallel. 
    // req.files.map function creates an array of promises, each representing the asynchronous processing of an individual file.
    req.files.map(async (file, index) => { // Iterates over each uploaded file in req.files.
      const fileExtension = file.originalname.split('.').pop().toLowerCase(); // Extracts the file extension from the original filename and converts it to lowercase.

      await sharp(file.path) // Creates a Sharp instance for the specified file.
        .resize(300, 300) // Resizes the image to 300x300 pixels.
        .toFormat(fileExtension) // Specifies the desired format based on the file extension extracted earlier.
        .jpeg({ quality: 90 }) // Converts the image to JPEG format with a specified quality of 90%.
        .toFile(`public/images/products/processed_page${index + 1}_${file.filename}`); // Saves the processed image to the specified directory with the original filename.
      fs.unlinkSync(`public/images/products/processed_page${index + 1}_${file.filename}`) // so the pictures arent saved in the local folder and just in cloudinary browser
    })
  );
  next();
}

const blogImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file, index) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/blogs/processed_page${index+1}_${file.filename}`);
      fs.unlinkSync(`public/images/blogs/processed_page${index+1}_${file.filename}`)
    })
  );
  next();
}


module.exports = {
  uploadPhoto,
  productImgResize,
  blogImgResize
}
