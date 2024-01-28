const express = require('express');
const router = express.Router();
const { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, unlikeBlog, uploadImages } = require('../controllers/blog');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const { blogImgResize, uploadPhoto } = require('../middleware/uploadImages');

router.route('/').post(authMiddleware, isAdmin, createBlog).get(getAllBlogs);
router.route('/upload/:id').patch(authMiddleware, isAdmin, uploadPhoto.array("images", 2), blogImgResize, uploadImages)

router.route('/likes').patch(authMiddleware, likeBlog);
router.route('/dislikes').patch(authMiddleware, unlikeBlog);
router.route('/:id').patch(authMiddleware, isAdmin, updateBlog).get(getBlog).delete(authMiddleware, isAdmin, deleteBlog);

module.exports = router;