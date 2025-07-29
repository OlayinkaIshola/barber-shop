const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Image optimization configurations
const IMAGE_CONFIGS = {
  thumbnail: {
    width: 150,
    height: 150,
    quality: 80,
    format: 'webp'
  },
  small: {
    width: 300,
    height: 300,
    quality: 85,
    format: 'webp'
  },
  medium: {
    width: 600,
    height: 600,
    quality: 90,
    format: 'webp'
  },
  large: {
    width: 1200,
    height: 1200,
    quality: 95,
    format: 'webp'
  },
  profile: {
    width: 400,
    height: 400,
    quality: 85,
    format: 'webp'
  },
  portfolio: {
    width: 800,
    height: 600,
    quality: 90,
    format: 'webp'
  }
};

// Optimize single image
const optimizeImage = async (inputPath, outputPath, config) => {
  try {
    const { width, height, quality, format } = config;
    
    let pipeline = sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      });

    // Apply format-specific optimizations
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg({ quality, progressive: true });
        break;
      case 'png':
        pipeline = pipeline.png({ quality, progressive: true });
        break;
      default:
        pipeline = pipeline.webp({ quality });
    }

    await pipeline.toFile(outputPath);
    
    // Get file sizes for comparison
    const originalStats = await fs.stat(inputPath);
    const optimizedStats = await fs.stat(outputPath);
    
    return {
      success: true,
      originalSize: originalStats.size,
      optimizedSize: optimizedStats.size,
      compressionRatio: ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(2)
    };
  } catch (error) {
    console.error('Image optimization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate multiple sizes for responsive images
const generateResponsiveSizes = async (inputPath, outputDir, baseName) => {
  try {
    const results = {};
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate different sizes
    for (const [sizeName, config] of Object.entries(IMAGE_CONFIGS)) {
      const outputPath = path.join(outputDir, `${baseName}-${sizeName}.${config.format}`);
      const result = await optimizeImage(inputPath, outputPath, config);
      
      if (result.success) {
        results[sizeName] = {
          path: outputPath,
          url: `/uploads/${path.basename(outputPath)}`,
          width: config.width,
          height: config.height,
          size: result.optimizedSize
        };
      }
    }
    
    return {
      success: true,
      sizes: results
    };
  } catch (error) {
    console.error('Responsive image generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Optimize profile image
const optimizeProfileImage = async (inputPath, outputDir, userId) => {
  const baseName = `profile-${userId}-${Date.now()}`;
  const config = IMAGE_CONFIGS.profile;
  const outputPath = path.join(outputDir, `${baseName}.${config.format}`);
  
  const result = await optimizeImage(inputPath, outputPath, config);
  
  if (result.success) {
    return {
      success: true,
      url: `/uploads/${path.basename(outputPath)}`,
      path: outputPath,
      ...result
    };
  }
  
  return result;
};

// Optimize portfolio image
const optimizePortfolioImage = async (inputPath, outputDir, userId, index) => {
  const baseName = `portfolio-${userId}-${Date.now()}-${index}`;
  const config = IMAGE_CONFIGS.portfolio;
  const outputPath = path.join(outputDir, `${baseName}.${config.format}`);
  
  const result = await optimizeImage(inputPath, outputPath, config);
  
  if (result.success) {
    // Also generate thumbnail
    const thumbnailConfig = IMAGE_CONFIGS.thumbnail;
    const thumbnailPath = path.join(outputDir, `${baseName}-thumb.${thumbnailConfig.format}`);
    const thumbnailResult = await optimizeImage(inputPath, thumbnailPath, thumbnailConfig);
    
    return {
      success: true,
      url: `/uploads/${path.basename(outputPath)}`,
      thumbnailUrl: thumbnailResult.success ? `/uploads/${path.basename(thumbnailPath)}` : null,
      path: outputPath,
      thumbnailPath: thumbnailResult.success ? thumbnailPath : null,
      ...result
    };
  }
  
  return result;
};

// Batch optimize images
const batchOptimizeImages = async (inputPaths, outputDir, configName = 'medium') => {
  const results = [];
  const config = IMAGE_CONFIGS[configName];
  
  if (!config) {
    throw new Error(`Invalid config name: ${configName}`);
  }
  
  await fs.mkdir(outputDir, { recursive: true });
  
  for (let i = 0; i < inputPaths.length; i++) {
    const inputPath = inputPaths[i];
    const baseName = `batch-${Date.now()}-${i}`;
    const outputPath = path.join(outputDir, `${baseName}.${config.format}`);
    
    const result = await optimizeImage(inputPath, outputPath, config);
    results.push({
      inputPath,
      outputPath: result.success ? outputPath : null,
      url: result.success ? `/uploads/${path.basename(outputPath)}` : null,
      ...result
    });
  }
  
  return results;
};

// Get image metadata
const getImageMetadata = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    const stats = await fs.stat(imagePath);
    
    return {
      success: true,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Validate image file
const validateImage = async (filePath, maxSize = 5 * 1024 * 1024) => {
  try {
    const stats = await fs.stat(filePath);
    
    if (stats.size > maxSize) {
      return {
        valid: false,
        error: `File size ${(stats.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`
      };
    }
    
    const metadata = await sharp(filePath).metadata();
    
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    if (!allowedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `Format ${metadata.format} not allowed. Allowed formats: ${allowedFormats.join(', ')}`
      };
    }
    
    const maxDimension = 4000;
    if (metadata.width > maxDimension || metadata.height > maxDimension) {
      return {
        valid: false,
        error: `Image dimensions ${metadata.width}x${metadata.height} exceed maximum ${maxDimension}x${maxDimension}`
      };
    }
    
    return {
      valid: true,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: stats.size
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid image file: ${error.message}`
    };
  }
};

// Clean up old images
const cleanupOldImages = async (directory, maxAge = 30 * 24 * 60 * 60 * 1000) => {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }
    
    return {
      success: true,
      deletedCount
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Convert image to WebP format
const convertToWebP = async (inputPath, outputPath, quality = 85) => {
  try {
    await sharp(inputPath)
      .webp({ quality })
      .toFile(outputPath);
    
    return {
      success: true,
      outputPath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Create image placeholder/blur
const createPlaceholder = async (inputPath, outputPath, width = 20, height = 20) => {
  try {
    await sharp(inputPath)
      .resize(width, height)
      .blur(1)
      .webp({ quality: 20 })
      .toFile(outputPath);
    
    return {
      success: true,
      outputPath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  IMAGE_CONFIGS,
  optimizeImage,
  generateResponsiveSizes,
  optimizeProfileImage,
  optimizePortfolioImage,
  batchOptimizeImages,
  getImageMetadata,
  validateImage,
  cleanupOldImages,
  convertToWebP,
  createPlaceholder
};
