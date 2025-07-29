const fs = require('fs').promises;
const path = require('path');
// Sharp not available in root - using simple SVG generation

// Image compression configurations
const COMPRESSION_CONFIGS = {
  hero: {
    width: 1200,
    height: 800,
    quality: 85,
    format: 'webp'
  },
  gallery: {
    width: 600,
    height: 400,
    quality: 80,
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
    quality: 80,
    format: 'webp'
  },
  thumbnail: {
    width: 200,
    height: 200,
    quality: 75,
    format: 'webp'
  }
};

// Create placeholder SVG images
const createPlaceholderImage = async (outputPath, config, text = 'Placeholder') => {
  try {
    const { width, height } = config;

    // Create a simple SVG placeholder
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f4e4bc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d4af37;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad1)"/>
  <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="#2c2c2c" stroke-width="3" stroke-dasharray="10,5"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="${Math.max(16, width/20)}" font-weight="bold"
        text-anchor="middle" dominant-baseline="middle" fill="#2c2c2c">${text}</text>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="${Math.max(12, width/30)}"
        text-anchor="middle" dominant-baseline="middle" fill="#2c2c2c" opacity="0.7">Elite Barber Shop</text>
</svg>`;

    // Ensure directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write SVG file
    await fs.writeFile(outputPath, svg, 'utf8');

    const stats = await fs.stat(outputPath);
    console.log(`✅ Created placeholder: ${outputPath} (${(stats.size / 1024).toFixed(2)} KB)`);

    return {
      success: true,
      path: outputPath,
      size: stats.size
    };
  } catch (error) {
    console.error(`❌ Error creating placeholder ${outputPath}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Skip compression for now since sharp is not available
const compressImage = async (inputPath, outputPath, config) => {
  console.log(`⚠️  Skipping compression for ${inputPath} (sharp not available)`);
  return {
    success: false,
    error: 'Sharp module not available'
  };
};

// Find all image files in directory
const findImageFiles = async (directory) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
  const imageFiles = [];
  
  try {
    const files = await fs.readdir(directory, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(directory, file.name);
      
      if (file.isDirectory()) {
        const subImages = await findImageFiles(fullPath);
        imageFiles.push(...subImages);
      } else if (imageExtensions.includes(path.extname(file.name).toLowerCase())) {
        imageFiles.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
    console.log(`⚠️  Directory not accessible: ${directory}`);
  }
  
  return imageFiles;
};

// Main compression function
const compressAllImages = async () => {
  console.log('🖼️  Starting image compression process...\n');
  
  // Directories to check for images
  const imageDirs = [
    'src/assets',
    'src/asset/images',
    'public/images',
    'backend/uploads'
  ];
  
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let processedCount = 0;
  
  // Find and compress existing images
  for (const dir of imageDirs) {
    console.log(`📁 Checking directory: ${dir}`);
    const imageFiles = await findImageFiles(dir);
    
    if (imageFiles.length === 0) {
      console.log(`   No images found in ${dir}\n`);
      continue;
    }
    
    console.log(`   Found ${imageFiles.length} image(s)\n`);
    
    for (const imagePath of imageFiles) {
      const ext = path.extname(imagePath);
      const basename = path.basename(imagePath, ext);
      const dirname = path.dirname(imagePath);
      const compressedPath = path.join(dirname, `${basename}-compressed.webp`);
      
      const result = await compressImage(imagePath, compressedPath, COMPRESSION_CONFIGS.gallery);
      
      if (result.success) {
        totalOriginalSize += result.originalSize;
        totalCompressedSize += result.compressedSize;
        processedCount++;
      }
    }
  }
  
  // Create missing placeholder images
  console.log('\n📸 Creating placeholder images for missing assets...\n');
  
  // Ensure assets directory exists
  await fs.mkdir('src/assets/images', { recursive: true });
  
  const placeholders = [
    {
      path: 'src/assets/images/client-doing-hair-cut-barber-shop-salon.svg',
      config: COMPRESSION_CONFIGS.hero,
      text: 'Barber Service'
    },
    {
      path: 'src/assets/images/Buzz-cut2.svg',
      config: COMPRESSION_CONFIGS.gallery,
      text: 'Buzz Cut'
    },
    {
      path: 'src/assets/images/professional-styling.svg',
      config: COMPRESSION_CONFIGS.gallery,
      text: 'Professional Styling'
    },
    {
      path: 'src/assets/images/expert-grooming.svg',
      config: COMPRESSION_CONFIGS.gallery,
      text: 'Expert Grooming'
    }
  ];
  
  for (const placeholder of placeholders) {
    await createPlaceholderImage(placeholder.path, placeholder.config, placeholder.text);
  }
  
  // Summary
  console.log('\n📊 Compression Summary:');
  console.log(`   Processed: ${processedCount} images`);
  if (processedCount > 0) {
    const totalReduction = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(2);
    console.log(`   Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total compressed size: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total space saved: ${((totalOriginalSize - totalCompressedSize) / 1024 / 1024).toFixed(2)} MB (${totalReduction}%)`);
  }
  console.log('\n✅ Image compression completed!');
};

// Run the compression
if (require.main === module) {
  compressAllImages().catch(console.error);
}

module.exports = {
  compressImage,
  createPlaceholderImage,
  compressAllImages,
  COMPRESSION_CONFIGS
};
