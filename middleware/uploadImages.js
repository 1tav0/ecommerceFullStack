const multer = require("multer"); // handling file uploads
const sharp = require("sharp"); // for image processing
const path = require("path"); // for working with file paths
const fs = require("fs").promises;
const { PDFDocument, rgb } = require("pdf-lib");


// Configuring multer's storage engine. This specifies where to save the uploaded files and how to name them
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

    const extension = file.originalname.split(".").pop().toLowerCase();

    switch (extension) {
      case "jpeg":
        cb(null, file.originalname + "-" + uniqueSuffix + ".jpeg");
        break;
      case "jpg":
        cb(null, file.originalname + "-" + uniqueSuffix + ".jpg");
        break;
      case "pdf":
        cb(null, file.originalname + "-" + uniqueSuffix + ".pdf");
        break;
      default:
        cb({
          message: "Unsupported file format"
        }, false);
        break;
    }
  }
})

// This function is a filter used by Multer to determine whether to accept or reject an uploaded file.
const multerFilter = (req, file, cb) => {
  const allowedExtensions = ["jpeg", "jpg", "pdf"]
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    if (allowedExtensions.includes(file.originalname.split('.').pop().toLowerCase())) {
      cb(null, true)
    } else {
      cb({
        message: "Unsupported file format"
      }, false)
    }
  } else {
    cb({
      message: "Unsupported file type"
    }, false)
  }
}
// creates a Multer instance named uploadPhoto with specific configuration options for handling file uploads.
const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fieldSize: 2000000 }
});

const processImage = async (file, index) => {
  const fileExtension = file.originalname.split(".").pop().toLowerCase();
  await sharp(file.path)
    .resize(300, 300)
    .toFormat(fileExtension)
    .jpeg({ quality: 90 })
    .toFile(`public/images/products/processed_page_${index+1}_${file.filename}`)
}

const processPDF = async (file, index) => {
  const pdfBytes = await fs.readFile(file.path);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const newPdfDoc = await PDFDocument.create();
  let pageIndex = 0; // Counter to keep track of the page index

  const resizedPages = await Promise.all(
    pdfDoc.getPages().map(async (page, pageIndex) => {
      const { width, height } = page.getSize();
      const scaleFactor = 300 / Math.max(width, height);

      const resizedPage = pdfDoc.insertPage(
        pageIndex++, // Increment the index after using it
        [width * scaleFactor, height * scaleFactor]
      );

      // Copy the content from the original page to the resized page
      const copiedContent = await pdfDoc.copyPages([page], pdfDoc);
      resizedPage.drawPage(copiedContent[0]);

      return resizedPage;
    })
  );

  //resizedPages.forEach((page) => newPdfDoc.addPage(page));

  const outputFilename = `processed_page_${index + 1}_${file.filename}`;
  const outputPath = path.join(__dirname, `../public/images/products/${outputFilename}`);

  const newPdfBytes = await newPdfDoc.save();
  await fs.writeFile(outputPath, newPdfBytes);
}

// asynchronous middleware to resize and save uploaded images
const productImgResize = async (req, res, next) => {
  if (!req.files) return next(); //no files, it immediately calls the next middleware 
  await Promise.all( // Uses Promise.all to concurrently process multiple files in parallel. 
    // req.files.map function creates an array of promises, each representing the asynchronous processing of an individual file.
    req.files.map(async (file, index) => { // Iterates over each uploaded file in req.files.
      const fileExtension = file.originalname.split('.').pop().toLowerCase(); // Extracts the file extension from the original filename and converts it to lowercase.

      if (file.mimetype.startsWith("image/")) {
        await processImage(file, index)
      }
      else if (file.mimetype === "application/pdf") {
        await processPDF(file, index);
      }
    })
  )
  next();
}

const blogImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/blogs/${file.filename}`);
    })
  );
  next();
}


module.exports = {
  uploadPhoto,
  productImgResize,
  blogImgResize
}