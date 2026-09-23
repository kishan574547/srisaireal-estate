const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Property = require('../models/Property');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET ALL PROPERTIES (Public)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.type && typeof req.query.type === 'string') {
      filter.propertyType = req.query.type;
    }
    if (req.query.status && typeof req.query.status === 'string') {
      filter.status = req.query.status;
    }
    if (req.query.city && typeof req.query.city === 'string') {
      filter.city = new RegExp(`^${req.query.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }
    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    const properties = await Property.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve properties',
    });
  }
});

// GET SINGLE PROPERTY (Public)
router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID format',
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    res.json({
      success: true,
      property,
    });
  } catch (err) {
    console.error('Error fetching property by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve property details',
    });
  }
});

// CREATE PROPERTY (Admin Only)
router.post(
  '/',
  authMiddleware,
  upload.array('images', 10),
  async (req, res) => {
    try {
      const {
        title,
        description = '',
        price,
        location = '',
        city,
        state = 'Andhra Pradesh',
        propertyType = 'House',
        status = 'For Sale',
        bedrooms = 0,
        bathrooms = 0,
        area = 0,
        featured,
        amenities,
      } = req.body;

      // Server-side Input Validation
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Property title is required' });
      }
      if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ success: false, message: 'Valid non-negative price is required' });
      }
      if (!city || typeof city !== 'string' || !city.trim()) {
        return res.status(400).json({ success: false, message: 'City is required' });
      }

      const images = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          images.push({
            url: file.path,
            public_id: file.filename,
          });
        });
      }

      let parsedAmenities = [];
      if (typeof amenities === 'string' && amenities.trim()) {
        parsedAmenities = amenities.split(',').map((a) => a.trim()).filter(Boolean);
      } else if (Array.isArray(amenities)) {
        parsedAmenities = amenities.map((a) => String(a).trim()).filter(Boolean);
      }

      const property = new Property({
        title: title.trim(),
        description: typeof description === 'string' ? description.trim() : '',
        price: Number(price),
        location: typeof location === 'string' ? location.trim() : '',
        city: city.trim(),
        state: typeof state === 'string' ? state.trim() : 'Andhra Pradesh',
        propertyType: typeof propertyType === 'string' ? propertyType.trim() : 'House',
        status: typeof status === 'string' ? status.trim() : 'For Sale',
        bedrooms: Math.max(0, parseInt(bedrooms, 10) || 0),
        bathrooms: Math.max(0, parseInt(bathrooms, 10) || 0),
        area: Math.max(0, Number(area) || 0),
        featured: featured === true || featured === 'true',
        amenities: parsedAmenities,
        images,
      });

      await property.save();

      res.status(201).json({
        success: true,
        message: 'Property created successfully',
        property,
      });
    } catch (err) {
      console.error('Error creating property:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to create property',
      });
    }
  }
);

// UPDATE PROPERTY (Admin Only)
router.put(
  '/:id',
  authMiddleware,
  upload.array('images', 10),
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid property ID format',
        });
      }

      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found',
        });
      }

      // REMOVE IMAGES FROM CLOUDINARY & PROPERTY
      if (req.body.removeImages) {
        const removeList = Array.isArray(req.body.removeImages)
          ? req.body.removeImages
          : [req.body.removeImages];

        for (const public_id of removeList) {
          if (typeof public_id === 'string' && public_id.trim()) {
            try {
              await cloudinary.uploader.destroy(public_id.trim());
            } catch (cloudErr) {
              console.error('Cloudinary destroy error:', cloudErr);
            }
            property.images = property.images.filter(
              (img) => img.public_id !== public_id.trim()
            );
          }
        }
      }

      // ADD NEW IMAGES
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          property.images.push({
            url: file.path,
            public_id: file.filename,
          });
        });
      }

      // UPDATE FIELDS
      if (req.body.title !== undefined) {
        if (!req.body.title || typeof req.body.title !== 'string' || !req.body.title.trim()) {
          return res.status(400).json({ success: false, message: 'Property title cannot be empty' });
        }
        property.title = req.body.title.trim();
      }
      if (req.body.description !== undefined) {
        property.description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
      }
      if (req.body.price !== undefined) {
        if (isNaN(Number(req.body.price)) || Number(req.body.price) < 0) {
          return res.status(400).json({ success: false, message: 'Valid non-negative price is required' });
        }
        property.price = Number(req.body.price);
      }
      if (req.body.location !== undefined) {
        property.location = typeof req.body.location === 'string' ? req.body.location.trim() : '';
      }
      if (req.body.city !== undefined) {
        if (!req.body.city || typeof req.body.city !== 'string' || !req.body.city.trim()) {
          return res.status(400).json({ success: false, message: 'City cannot be empty' });
        }
        property.city = req.body.city.trim();
      }
      if (req.body.state !== undefined) {
        property.state = typeof req.body.state === 'string' ? req.body.state.trim() : property.state;
      }
      if (req.body.propertyType !== undefined) {
        property.propertyType = typeof req.body.propertyType === 'string' ? req.body.propertyType.trim() : property.propertyType;
      }
      if (req.body.status !== undefined) {
        property.status = typeof req.body.status === 'string' ? req.body.status.trim() : property.status;
      }
      if (req.body.bedrooms !== undefined) {
        property.bedrooms = Math.max(0, parseInt(req.body.bedrooms, 10) || 0);
      }
      if (req.body.bathrooms !== undefined) {
        property.bathrooms = Math.max(0, parseInt(req.body.bathrooms, 10) || 0);
      }
      if (req.body.area !== undefined) {
        property.area = Math.max(0, Number(req.body.area) || 0);
      }
      if (req.body.featured !== undefined) {
        property.featured = req.body.featured === true || req.body.featured === 'true';
      }
      if (req.body.amenities !== undefined) {
        if (typeof req.body.amenities === 'string') {
          property.amenities = req.body.amenities.split(',').map((a) => a.trim()).filter(Boolean);
        } else if (Array.isArray(req.body.amenities)) {
          property.amenities = req.body.amenities.map((a) => String(a).trim()).filter(Boolean);
        }
      }

      await property.save();

      res.json({
        success: true,
        message: 'Property updated successfully',
        property,
      });
    } catch (err) {
      console.error('Error updating property:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to update property',
      });
    }
  }
);

// DELETE PROPERTY (Admin Only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID format',
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // DELETE CLOUDINARY IMAGES
    for (const img of property.images) {
      if (img.public_id) {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (cloudErr) {
          console.error('Cloudinary destroy error:', cloudErr);
        }
      }
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property',
    });
  }
});

module.exports = router;