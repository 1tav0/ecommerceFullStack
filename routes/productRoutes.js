const express = require('express');
const router = express.Router();
const { createProduct, getProduct, getAllProducts } = require('../controllers/products');

router.route("/").post(createProduct).get(getAllProducts);
router.route("/:id").get(getProduct);

module.exports = router;