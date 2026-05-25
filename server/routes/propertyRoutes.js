const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

// GET /api/properties - Public: get all properties
router.get('/', async (req, res) => {
  try {
    const { type, status, city, featured, limit = 20, page = 1 } = req.query;
    const filter = {};

    if (type) filter.propertyType = type;
    if (status) filter.status = status;
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (featured === 'true') filter.featured = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), properties });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/properties/:id - Public: get single property
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST /api/properties - Protected: create property
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const {
      title, description, price, location, city, state,
      propertyType, status, bedrooms, bathrooms, area, amenities, featured,
    } = req.body;

    const images = req.files?.map((file) => ({
      url: file.path,
      public_id: file.filename,
    })) || [];

    const amenitiesArr = amenities
      ? (Array.isArray(amenities) ? amenities : amenities.split(',').map((a) => a.trim()))
      : [];

    const property = await Property.create({
      title, description, price: Number(price),
      location, city, state: state || 'Andhra Pradesh',
      propertyType, status: status || 'For Sale',
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      area: Number(area),
      amenities: amenitiesArr,
      images,
      featured: featured === 'true' || featured === true,
    });

    res.status(201).json({ success: true, message: 'Property created', property });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// PUT /api/properties/:id - Protected: update property
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const {
      title, description, price, location, city, state,
      propertyType, status, bedrooms, bathrooms, area,
      amenities, featured, removeImages,
    } = req.body;

    // Handle image removals
    if (removeImages) {
      const toRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
      for (const public_id of toRemove) {
        await cloudinary.uploader.destroy(public_id);
        property.images = property.images.filter((img) => img.public_id !== public_id);
      }
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
      property.images = [...property.images, ...newImages];
    }

    // Update fields
    if (title) property.title = title;
    if (description) property.description = description;
    if (price) property.price = Number(price);
    if (location) property.location = location;
    if (city) property.city = city;
    if (state) property.state = state;
    if (propertyType) property.propertyType = propertyType;
    if (status) property.status = status;
    if (bedrooms !== undefined) property.bedrooms = Number(bedrooms);
    if (bathrooms !== undefined) property.bathrooms = Number(bathrooms);
    if (area) property.area = Number(area);
    if (amenities) {
      property.amenities = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim());
    }
    if (featured !== undefined) property.featured = featured === 'true' || featured === true;

    await property.save();
    res.json({ success: true, message: 'Property updated', property });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// DELETE /api/properties/:id - Protected: delete property
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    // Delete images from cloudinary
    for (const img of property.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;