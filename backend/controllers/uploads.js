const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    
    try {
      await fs.access(uploadPath);
    } catch (error) {
      await fs.mkdir(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// @desc    Upload profile image
// @route   POST /api/uploads/profile
// @access  Private
exports.uploadProfileImage = [
  upload.single('profileImage'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Process image with sharp
      const processedImagePath = path.join(
        path.dirname(req.file.path),
        `processed-${req.file.filename}`
      );

      await sharp(req.file.path)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(processedImagePath);

      // Delete original file
      await fs.unlink(req.file.path);

      // Delete old profile image if exists
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, '../uploads', path.basename(user.profileImage));
        try {
          await fs.unlink(oldImagePath);
        } catch (error) {
          console.log('Old image not found or already deleted');
        }
      }

      // Update user profile
      const imageUrl = `/uploads/${path.basename(processedImagePath)}`;
      user.profileImage = imageUrl;
      await user.save();

      res.status(200).json({
        success: true,
        data: {
          imageUrl,
          message: 'Profile image uploaded successfully'
        }
      });
    } catch (error) {
      console.error('Upload profile image error:', error);
      
      // Clean up uploaded file on error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to upload profile image'
      });
    }
  }
];

// @desc    Upload portfolio images (for stylists)
// @route   POST /api/uploads/portfolio
// @access  Private/Barber
exports.uploadPortfolioImages = [
  upload.array('portfolioImages', 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'barber') {
        return res.status(403).json({
          success: false,
          error: 'Only barbers can upload portfolio images'
        });
      }

      const processedImages = [];

      for (const file of req.files) {
        try {
          // Process image
          const processedImagePath = path.join(
            path.dirname(file.path),
            `portfolio-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`
          );

          await sharp(file.path)
            .resize(800, 600, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 90 })
            .toFile(processedImagePath);

          // Delete original file
          await fs.unlink(file.path);

          const imageUrl = `/uploads/${path.basename(processedImagePath)}`;
          processedImages.push({
            url: imageUrl,
            originalName: file.originalname,
            size: file.size
          });
        } catch (error) {
          console.error('Error processing image:', error);
          // Continue with other images
        }
      }

      // Update user portfolio
      if (!user.portfolio) {
        user.portfolio = [];
      }

      user.portfolio.push(...processedImages.map(img => ({
        imageUrl: img.url,
        title: img.originalName,
        description: '',
        uploadDate: new Date()
      })));

      await user.save();

      res.status(200).json({
        success: true,
        data: {
          uploadedImages: processedImages,
          totalPortfolioImages: user.portfolio.length,
          message: `Successfully uploaded ${processedImages.length} portfolio images`
        }
      });
    } catch (error) {
      console.error('Upload portfolio images error:', error);
      
      // Clean up uploaded files on error
      if (req.files) {
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Error deleting uploaded file:', unlinkError);
          }
        }
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to upload portfolio images'
      });
    }
  }
];

// @desc    Delete portfolio image
// @route   DELETE /api/uploads/portfolio/:imageId
// @access  Private/Barber
exports.deletePortfolioImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'barber') {
      return res.status(403).json({
        success: false,
        error: 'Only barbers can delete portfolio images'
      });
    }

    const imageId = req.params.imageId;
    const imageIndex = user.portfolio.findIndex(img => img._id.toString() === imageId);

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio image not found'
      });
    }

    const image = user.portfolio[imageIndex];
    
    // Delete physical file
    const imagePath = path.join(__dirname, '../uploads', path.basename(image.imageUrl));
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.log('Image file not found or already deleted');
    }

    // Remove from portfolio
    user.portfolio.splice(imageIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Portfolio image deleted successfully'
    });
  } catch (error) {
    console.error('Delete portfolio image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete portfolio image'
    });
  }
};

// @desc    Update portfolio image details
// @route   PUT /api/uploads/portfolio/:imageId
// @access  Private/Barber
exports.updatePortfolioImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'barber') {
      return res.status(403).json({
        success: false,
        error: 'Only barbers can update portfolio images'
      });
    }

    const imageId = req.params.imageId;
    const { title, description } = req.body;

    const image = user.portfolio.find(img => img._id.toString() === imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio image not found'
      });
    }

    // Update image details
    if (title !== undefined) image.title = title;
    if (description !== undefined) image.description = description;

    await user.save();

    res.status(200).json({
      success: true,
      data: image,
      message: 'Portfolio image updated successfully'
    });
  } catch (error) {
    console.error('Update portfolio image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update portfolio image'
    });
  }
};

// @desc    Get user's portfolio
// @route   GET /api/uploads/portfolio
// @access  Private
exports.getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        portfolio: user.portfolio || [],
        totalImages: user.portfolio ? user.portfolio.length : 0
      }
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get portfolio'
    });
  }
};

// @desc    Get stylist's public portfolio
// @route   GET /api/uploads/portfolio/:stylistId
// @access  Public
exports.getStylistPortfolio = async (req, res) => {
  try {
    const stylist = await User.findById(req.params.stylistId);
    if (!stylist || stylist.role !== 'barber') {
      return res.status(404).json({
        success: false,
        error: 'Stylist not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        stylist: {
          id: stylist._id,
          firstName: stylist.firstName,
          lastName: stylist.lastName,
          profileImage: stylist.profileImage,
          bio: stylist.bio,
          experience: stylist.experience,
          rating: stylist.rating
        },
        portfolio: stylist.portfolio || [],
        totalImages: stylist.portfolio ? stylist.portfolio.length : 0
      }
    });
  } catch (error) {
    console.error('Get stylist portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stylist portfolio'
    });
  }
};

// Error handling middleware for multer
exports.handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum is 10 files.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
};
