const express = require("express");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const { createCategory, updateCategory, deleteCategory, getCategory, getAllCategories } = require("../controllers/productCategory");
const router = express.Router();

router.route('/').post(authMiddleware, isAdmin, createCategory).get(getAllCategories);
router.route('/:id').patch(authMiddleware, isAdmin, updateCategory).delete(authMiddleware, deleteCategory).get(getCategory);

module.exports = router;