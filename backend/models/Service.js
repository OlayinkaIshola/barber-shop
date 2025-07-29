const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [500, 'Service description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Service duration is required'],
    min: [5, 'Duration must be at least 5 minutes'],
    max: [300, 'Duration cannot exceed 300 minutes']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'Haircuts',
      'Beard Services',
      'Hair Treatments',
      'Styling',
      'Packages',
      'Specialty Services'
    ]
  },
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  aftercare: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
serviceSchema.index({ name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ isActive: 1 });

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for formatted duration
serviceSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
});

// Static method to get services by category
serviceSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ popularity: -1, name: 1 });
};

// Static method to get popular services
serviceSchema.statics.getPopular = function(limit = 5) {
  return this.find({ isActive: true })
    .sort({ popularity: -1, name: 1 })
    .limit(limit);
};

// Static method to search services
serviceSchema.statics.search = function(query) {
  return this.find({
    isActive: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  }).sort({ popularity: -1, name: 1 });
};

// Method to increment popularity
serviceSchema.methods.incrementPopularity = function() {
  this.popularity += 1;
  return this.save();
};

module.exports = mongoose.model('Service', serviceSchema);
