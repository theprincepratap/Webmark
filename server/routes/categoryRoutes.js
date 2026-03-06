const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Bookmark = require('../models/Bookmark');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Validation rules
const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters')
];

// @route   GET /api/categories
// @desc    Get all categories for user with bookmark count
// @access  Private
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    // Get bookmark counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const bookmarkCount = await Bookmark.countDocuments({
          categoryId: category._id,
          userId: req.user.userId
        });
        return {
          ...category.toObject(),
          bookmarkCount
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const bookmarkCount = await Bookmark.countDocuments({
      categoryId: category._id,
      userId: req.user.userId
    });

    res.json({
      success: true,
      data: {
        ...category.toObject(),
        bookmarkCount
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching category'
    });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private
router.post('/', categoryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { name, icon, color } = req.body;

    // Check for duplicate category name
    const existingCategory = await Category.findOne({
      userId: req.user.userId,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists'
      });
    }

    const category = new Category({
      userId: req.user.userId,
      name,
      icon: icon || 'folder',
      color: color || '#6366f1'
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        ...category.toObject(),
        bookmarkCount: 0
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating category'
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', categoryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { name, icon, color } = req.body;

    // Check for duplicate category name (excluding current)
    const existingCategory = await Category.findOne({
      userId: req.user.userId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists'
      });
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, icon, color },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const bookmarkCount = await Bookmark.countDocuments({
      categoryId: category._id,
      userId: req.user.userId
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        ...category.toObject(),
        bookmarkCount
      }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating category'
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category and all its bookmarks
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Delete all bookmarks in this category
    await Bookmark.deleteMany({
      categoryId: req.params.id,
      userId: req.user.userId
    });

    res.json({
      success: true,
      message: 'Category and its bookmarks deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting category'
    });
  }
});

module.exports = router;
