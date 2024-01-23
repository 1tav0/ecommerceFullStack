const express = require('express');
const router = express.Router();
const { createCoupon, getAllCoupons, updateCoupon, deleteCoupon } = require('../controllers/coupon');
const { isAdmin, authMiddleware } = require('../middleware/authMiddleware');


router.route("/").post(authMiddleware, isAdmin, createCoupon).get(authMiddleware, isAdmin, getAllCoupons);
router.route('/:id').patch(authMiddleware, isAdmin, updateCoupon).delete(authMiddleware, isAdmin, deleteCoupon)

module.exports = router;