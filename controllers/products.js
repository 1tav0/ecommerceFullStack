const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const slugify = require("slugify");
const User = require('../models/User');
const validateMongoDBId = require('../utils/validateMongodbid');
const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require('fs');



const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.status(200).json({ newProduct });
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const {id: productid} = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updatedProduct = await Product.findByIdAndUpdate( productid,
    req.body, 
    {
      new: true,
      runValidators: true // Ensure validation runs on update
    })
    res.status(200).json({ updatedProduct });
  } catch (error) {
    throw new Error(error);
  }
})

const deleteProduct = asyncHandler(async (req, res) => {
  const { id: productid } = req.params;
  try {
    const deletedProduct = await Product.findOneAndDelete(productid );
    res.status(200).json(deletedProduct);
  } catch (error) {
    throw new Error(error);
  }
})

const getProduct = asyncHandler(async (req, res) => {
  const { id: productid } = req.params;
  try {
    const product = await Product.findById(productid);
    if (!product) {
      return res.status(404).json({ error: `No product found with id ${productid}` })
    }

    res.status(200).json({ product });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProducts = asyncHandler(async (req, res) => {
  // console.log(req.query);
  try {
    /*** Filtering ***/
    const queryObject = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(item => delete queryObject[item]);
    // console.log(queryObject, req.query);
    // const products = await Product.find(req.query);
    // const products = await Product.find({
    //   brand: req.query.brand,
    //   category: req.query.category
    // });
    // const products = await Product.where("category").equals(req.query.category);

    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    //console.log(JSON.parse(queryStr));
    let query = Product.find(JSON.parse(queryStr));

    /*** Sorting ***/
    if (req.query.sort) {
      const sortList = req.query.sort.split(',').join(' ');
      query = query.sort(sortList);
    } else {
      query = query.sort("-createdAt");
    }

    /*** Limiting The Fields ***/
    if (req.query.fields) {
      const fieldsList = req.query.fields.split(',').join(' ');
      query = query.select(fieldsList);
    } else {
      query = query.select('-__v');
    }

    /*** Pagination ***/
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    // console.log(page, limit, skip);
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) {
        throw new Error("This Page Does Not Exist");
      }
    }

    const product = await query;
    if (!product) {
      return res.status(404).json({ error: "No products found" });
    }

    res.status(200).json({ product, totalProducts: product.length });
  } catch (error) {
    throw new Error(error);
  }
});

const addToWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { productid } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyAdded = user?.wishlist?.find(
      (id => id.toString() === productid.toString())
    )
    if (alreadyAdded) {
      const result = await User.findByIdAndUpdate(_id, {
        $pull: {
          wishlist: productid
        }
      }, {
        new: true
      });
      res.status(200).json(result);
    } else {
      const result = await User.findByIdAndUpdate(_id, {
        $push: {
          wishlist: productid
        }
      }, {
        new: true
      });
      res.status(200).json(result);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, productid, comment } = req.body;
  const product = await Product.findById(productid);
  const alreadyRated = product.ratings.find(
    (userId) => userId.postedBy.toString() === _id.toString()
  );
  try {
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: {
            $elemMatch: alreadyRated
          }
        },
        {
          $set: {
            "ratings.$.star": star,
            "ratings.$.comment": comment
          }
        },
        {
          new: true
        }
      )
      // res.json(updateRating);
    } else {
      const rateProduct = await Product.findByIdAndUpdate(productid, {
        $push: {
          ratings: {
            star: star,
            comment: comment,
            postedBy: _id
          }
        }
      }, {
        new: true
      });

      // res.json(rateProduct);
    }

    const products = await Product.findById(productid);
    let ratingSize = products.ratings.length;
    let ratingsSum = products.ratings.map(item => item.star).reduce((prev, curr) => prev + curr, 0);
    let rating = Math.round(ratingsSum / ratingSize);
    let updateRating = await Product.findByIdAndUpdate(productid, {
      totalRating: rating
    }, {
      new: true
    })

    res.json(updateRating);
  } catch (error) {
    throw new Error(error);
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  const { id: productid } = req.params;
  validateMongoDBId(productid);
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    
    const urls = [];
    const files = req.files;
    //console.log(files);
    for (const file of files) {
      const { path } = file;
      console.log(path);
      const newpath = await uploader(path);
      //console.log(newpath);
      urls.push(newpath);
      // try {
      //   fs.unlinkSync(path);
      // } catch (unlinkError) {
      //   console.error('Error deleting file:', unlinkError);
      // }
    }
    const findProduct = await Product.findByIdAndUpdate(productid, {
      images: urls.map((file) => {
        return file;
      })
    }, {
      new: true
    })
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
})

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  uploadImages
}