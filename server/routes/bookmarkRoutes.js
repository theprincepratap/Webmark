const express = require('express');
const { body, validationResult } = require('express-validator');
const Bookmark = require('../models/Bookmark');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Validation rules
const bookmarkValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('url')
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please enter a valid URL'),
  body('categoryId')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

const updateBookmarkValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('url')
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please enter a valid URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// @route   GET /api/bookmarks
// @desc    Get all bookmarks for user (with optional search)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { search, categoryId, limit = 50, page = 1 } = req.query;
    
    let query = { userId: req.user.userId };
    
    // Filter by category if provided
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Text search if provided
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { url: searchRegex },
        { description: searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [bookmarks, total] = await Promise.all([
      Bookmark.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('categoryId', 'name icon color'),
      Bookmark.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: bookmarks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bookmarks'
    });
  }
});

// @route   GET /api/bookmarks/recent
// @desc    Get recently added bookmarks
// @access  Private
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const bookmarks = await Bookmark.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('categoryId', 'name icon color');

    res.json({
      success: true,
      data: bookmarks
    });
  } catch (error) {
    console.error('Get recent bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recent bookmarks'
    });
  }
});

// @route   GET /api/bookmarks/category/:categoryId
// @desc    Get all bookmarks in a category
// @access  Private
router.get('/category/:categoryId', async (req, res) => {
  try {
    // Verify category belongs to user
    const category = await Category.findOne({
      _id: req.params.categoryId,
      userId: req.user.userId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const bookmarks = await Bookmark.find({
      categoryId: req.params.categoryId,
      userId: req.user.userId
    }).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        category,
        bookmarks
      }
    });
  } catch (error) {
    console.error('Get category bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bookmarks'
    });
  }
});

// @route   GET /api/bookmarks/:id
// @desc    Get single bookmark
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('categoryId', 'name icon color');

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    res.json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    console.error('Get bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bookmark'
    });
  }
});

// @route   POST /api/bookmarks
// @desc    Create new bookmark
// @access  Private
router.post('/', bookmarkValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { title, url, description, categoryId } = req.body;

    // Verify category belongs to user
    const category = await Category.findOne({
      _id: categoryId,
      userId: req.user.userId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get highest order for this category
    const lastBookmark = await Bookmark.findOne({
      categoryId,
      userId: req.user.userId
    }).sort({ order: -1 });

    const order = lastBookmark ? lastBookmark.order + 1 : 0;

    const bookmark = new Bookmark({
      userId: req.user.userId,
      categoryId,
      title,
      url,
      description: description || '',
      order
    });

    await bookmark.save();
    
    // Populate category info
    await bookmark.populate('categoryId', 'name icon color');

    res.status(201).json({
      success: true,
      message: 'Bookmark created successfully',
      data: bookmark
    });
  } catch (error) {
    console.error('Create bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating bookmark'
    });
  }
});

// @route   PUT /api/bookmarks/:id
// @desc    Update bookmark
// @access  Private
router.put('/:id', updateBookmarkValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { title, url, description, categoryId } = req.body;

    // If categoryId is being changed, verify new category belongs to user
    if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        userId: req.user.userId
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Generate new favicon if URL changed
    let updateData = { title, url, description };
    if (url) {
      try {
        const domain = new URL(url).hostname;
        updateData.favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch (err) {
        updateData.favicon = '';
      }
    }
    
    if (categoryId) {
      updateData.categoryId = categoryId;
    }

    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name icon color');

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    res.json({
      success: true,
      message: 'Bookmark updated successfully',
      data: bookmark
    });
  } catch (error) {
    console.error('Update bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating bookmark'
    });
  }
});

// @route   PUT /api/bookmarks/reorder
// @desc    Reorder bookmarks (drag and drop)
// @access  Private
router.put('/reorder/batch', async (req, res) => {
  try {
    const { bookmarks } = req.body;

    if (!Array.isArray(bookmarks)) {
      return res.status(400).json({
        success: false,
        message: 'Bookmarks array is required'
      });
    }

    // Update order for each bookmark
    const updatePromises = bookmarks.map((item, index) =>
      Bookmark.findOneAndUpdate(
        { _id: item.id, userId: req.user.userId },
        { order: index },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Bookmarks reordered successfully'
    });
  } catch (error) {
    console.error('Reorder bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reordering bookmarks'
    });
  }
});

// @route   DELETE /api/bookmarks/:id
// @desc    Delete bookmark
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    res.json({
      success: true,
      message: 'Bookmark deleted successfully'
    });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting bookmark'
    });
  }
});

module.exports = router;
