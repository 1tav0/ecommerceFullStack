const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const slugify = require("slugify");

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
    const query = Product.find(JSON.parse(queryStr));
    const product = await query;
    if (!product) {
      return res.status(404).json({ error: "No products found" });
    }

    res.status(200).json({ product, totalProducts: product.length });
  } catch (error) {
    throw new Error(error);
  }
})

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct
}