const Coupon = require('../models/Coupon');
const validateMongodbid = require('../utils/validateMongodbid');
const asyncHandler = require('express-async-handler');

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.json(newCoupon);
  } catch (error) {
    throw new Error(error);
  }
})

const getAllCoupons = asyncHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    if (!coupons) {
      throw new Error("No coupons in database");
    }
    res.status(200).json(coupons);
  } catch (error) {
    throw new Error(error);
  }
})

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const updatecoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!updateCoupon) {
      throw new Error("cannot update the coupon");
    }
    res.status(200).json(updatecoupon);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const result = await Coupon.findByIdAndDelete(id);
    if (!result) {
      throw new Error("something went wrong cannot delete coupon");
    }
    res.status(200).json(result);
  } catch (error) {
    throw new Error(error);
  }
})

module.exports = {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon
}