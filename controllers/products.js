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

const getAllProducts = asyncHandler(async (req,res) =>{
  try {
    const products = await Product.find({});
    if (!products) {
      return res.status(404).json({ error: "No products found" });
    }

    res.status(200).json({ products, totalProducts: products.length });
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