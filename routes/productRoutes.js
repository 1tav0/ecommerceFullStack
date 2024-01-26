const express = require('express');
const router = express.Router();
const {isAdmin, authMiddleware} = require('../middleware/authMiddleware');
const { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct, addToWishList, rating, uploadImages } = require('../controllers/products');
const { uploadPhoto, productImgResize } = require('../middleware/uploadImages');

router.route("/").post(authMiddleware, isAdmin, createProduct).get(getAllProducts);

router.route("/upload/:id").patch(authMiddleware, isAdmin, uploadPhoto.array("images", 10), productImgResize, uploadImages);
router.route("/wishlist").patch(authMiddleware, addToWishList);
router.route("/rating").patch(authMiddleware, rating);
router.route("/:id").get(getProduct).patch(authMiddleware,isAdmin,updateProduct).delete(authMiddleware,isAdmin,deleteProduct);

module.exports = router;