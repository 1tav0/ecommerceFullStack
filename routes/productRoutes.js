const express = require('express');
const router = express.Router();
const {isAdmin, authMiddleware} = require('../middleware/authMiddleware');
const { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct } = require('../controllers/products');

router.route("/").post(authMiddleware,isAdmin, createProduct).get(getAllProducts);
router.route("/:id").get(getProduct).patch(authMiddleware,isAdmin,updateProduct).delete(authMiddleware,isAdmin,deleteProduct);

module.exports = router;