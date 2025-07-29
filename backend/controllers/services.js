const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const { sort, category, active } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by active status
    if (active !== undefined) {
      query.isActive = active === 'true';
    } else {
      query.isActive = true; // Default to active services only
    }

    let services = Service.find(query);

    // Sorting
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      services = services.sort(sortBy);
    } else {
      services = services.sort('price'); // Default sort by price
    }

    const result = await services;

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Increment popularity
    await service.incrementPopularity();

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Admin
exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service,
      message: 'Service created successfully'
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      data: service,
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public
exports.getServicesByCategory = async (req, res) => {
  try {
    const services = await Service.getByCategory(req.params.category);

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get popular services
// @route   GET /api/services/popular
// @access  Public
exports.getPopularServices = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const services = await Service.getPopular(limit);

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get popular services error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search services
// @route   GET /api/services/search
// @access  Public
exports.searchServices = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const services = await Service.search(q);

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
