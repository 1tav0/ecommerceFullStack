const Blog = require('../models/Blog');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const validateMongoDBId = require('../utils/validateMongodbid');
const cloudinaryUploadImg = require('../utils/cloudinary');
const fs = require('fs');


const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json(newBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  const { id: blogid } = req.params;
  validateMongoDBId(blogid);
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(blogid,
      req.body, {
        new: true
      }
    )
    res.status(200).json(updatedBlog);
  } catch (error) {
    throw new Error(error);
  }
})

const getBlog = asyncHandler(async (req, res) => {
  const { id: blogid } = req.params;
  validateMongoDBId(blogid);
  try {
    const blog = await Blog.findById(blogid)
      .populate("likes")
      .populate("dislikes");
    await Blog.findByIdAndUpdate(blogid, {
      $inc: {
        views: 1
      }
    }, {
      new: true
    })
    res.status(200).json(blog);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find({});
    if (!blogs) {
      throw new Error("No blogs found in database");
    }
    res.status(200).json({ blogs, total: blogs.length });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id: blogid } = req.params;
  validateMongoDBId(blogid);
  try {
    const deletedBlog = await Blog.findByIdAndDelete(blogid);
    if (!deletedBlog) {
      throw new Error("No blog to delete in database");
    }
    res.status(200).json(deletedBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const likeBlog = asyncHandler(async (req, res) => {
  const { blogid } = req.body;
  validateMongoDBId(blogid);
  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogid);
  //find the user that is logged in
  const loggedUserId = req?.user?._id;
  // get the like property from the blog
  const isLiked = blog?.isLiked;
  // find if the user has disliked the blog
  const disliked = blog?.dislikes?.find(
    (userId => userId?.toString() === loggedUserId?.toString())
  )
  if (disliked) {
    const blog = await Blog.findByIdAndUpdate(blogid, {
      $pull: {
        dislikes: loggedUserId
      },
      isDisliked: false
    }, {
      new: true
    });
    res.json(blog);
  }
  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(blogid, {
      $pull: {
        likes: loggedUserId
      },
      isLiked: false
    }, {
      new: true
    });
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(blogid, {
      $push: {
        likes: loggedUserId
      },
      isLiked: true
    }, {
      new: true
    });
    res.json(blog);
  }
});

const unlikeBlog = asyncHandler(async (req, res) => {
  const { blogid } = req.body;
  validateMongoDBId(blogid);
  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogid);
  //find the user that is logged in
  const loggedUserId = req?.user?._id;
  // get the dislike property from the blog
  const isDisliked = blog?.isDisliked;
  // find if the user has liked the blog
  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === loggedUserId?.toString()
  )
  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(blogid, {
      $pull: {
        likes: loggedUserId
      },
      isLiked: false
    }, {
      new: true
    });
    res.json(blog);
  }
  if (isDisliked) {
    const blog = await Blog.findByIdAndUpdate(blogid, {
      $pull: {
        dislikes: loggedUserId
      },
      isDisliked: false
    }, {
      new: true
    });
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(blogid, {
      $push: {
        dislikes: loggedUserId
      },
      isDisliked: true
    }, {
      new: true
    });
    res.json(blog);
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  const { id: blogid } = req.params;
  validateMongoDBId(blogid);
  
  try {
    const uploader = (file) => cloudinaryUploadImg(file);
    const urls = [];
    const files = req.files;
    console.log(files);
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      // try {
      //   fs.unlinkSync(path);
      // } catch (unlinkError) {
      //   console.error('Error deleting file:', unlinkError);
      // }
    }
    const blog = await Blog.findByIdAndUpdate(blogid, {
      images: urls.map((file) => {
        return file;
      })
    }, {
      new: true
    })
    res.json(blog);
  } catch (error) {
    throw new Error(error);
  }
})

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  unlikeBlog,
  uploadImages
}