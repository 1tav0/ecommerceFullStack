const BlogCategory = require('../models/BlogCategory');
const asyncHandler = require("express-async-handler");
const validateMongoDBId = require('../utils/validateMongodbid');

const createCategory = asyncHandler(async (req, res) => {
  try {
    const category = await BlogCategory.create(req.body);
    res.json(category);
  } catch (error) {
    throw new Error(error);
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id: categoryid } = req.params;
    // console.log(categoryid)
    validateMongoDBId(categoryid);
    const updatedCategory = await BlogCategory.findByIdAndUpdate(categoryid, req.body, { new: true });
    if (!updatedCategory) {
      throw new Error("Something went wrong please try again");
    }
    res.status(200).json({msg: "Successfully updated category", updatedCategory});
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id: categoryid } = req.params;
    validateMongoDBId(categoryid);
    const deletedCategory = await BlogCategory.findByIdAndDelete(categoryid);
    if (!deletedCategory) {
      throw new Error("Cannot delete category with that id");
    }
    res.status(200).json({ msg: "Successfully deleted category", deletedCategory });
  } catch (error) {
    throw new Error(error);
  }
});

const getCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDBId(id);
    const category = await BlogCategory.findById(id);
    if (!category) {
      throw new Error("Cannot find category in database");
    }
    res.status(200).json(category);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await BlogCategory.find({});
    if (!categories) {
      throw new Error("cannot find categories in database");
    }
  res.status(200).json({categories, total: categories.length});
  } catch (error) {
    throw new Error(error);
  }
})

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories
}