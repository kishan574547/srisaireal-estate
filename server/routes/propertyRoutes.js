const express = require('express');
const router = express.Router();

const Property = require('../models/Property');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');


// GET ALL PROPERTIES
router.get('/', async (req, res) => {

  try {

    const properties =
      await Property.find()
        .sort({ createdAt: -1 });

    res.json({
      success: true,
      properties,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

});

// GET SINGLE PROPERTY
router.get('/:id', async (req, res) => {

  try {

    const property =
      await Property.findById(
        req.params.id
      );

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

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

});
// CREATE PROPERTY
router.post(
  '/',
  upload.array('images', 10),

  async (req, res) => {

    try {

      const images = [];

      // SAVE IMAGES
      if (
        req.files &&
        req.files.length > 0
      ) {

        req.files.forEach((file) => {

          images.push({

            url: file.path,

            public_id:
              file.filename,

          });

        });

      }

      // CREATE PROPERTY
      const property =
        new Property({

          title:
            req.body.title,

          description:
            req.body.description,

          price:
            req.body.price,

          location:
            req.body.location,

          city:
            req.body.city,

          state:
            req.body.state,

          propertyType:
            req.body.propertyType,

          status:
            req.body.status,

          bedrooms:
            req.body.bedrooms,

          bathrooms:
            req.body.bathrooms,

          area:
            req.body.area,

          featured:
            req.body.featured ===
            'true',

          amenities:
            req.body.amenities
              ? req.body.amenities
                  .split(',')
              : [],

          images,

        });

      await property.save();

      res.status(201).json({

        success: true,

        property,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false,

        message: err.message,

      });

    }

  }
);


// UPDATE PROPERTY
router.put(
  '/:id',
  upload.array('images', 10),

  async (req, res) => {

    try {

      const property =
        await Property.findById(
          req.params.id
        );

      if (!property) {

        return res.status(404).json({
          success: false,
          message:
            'Property not found',
        });

      }

      // REMOVE IMAGES
      if (
        req.body.removeImages
      ) {

        const removeList =
          Array.isArray(
            req.body.removeImages
          )
            ? req.body.removeImages
            : [
                req.body
                  .removeImages,
              ];

        for (const public_id of removeList) {

          await cloudinary.uploader.destroy(
            public_id
          );

          property.images =
            property.images.filter(
              (img) =>
                img.public_id !==
                public_id
            );

        }

      }

      // ADD NEW IMAGES
      if (
        req.files &&
        req.files.length > 0
      ) {

        req.files.forEach((file) => {

          property.images.push({

            url: file.path,

            public_id:
              file.filename,

          });

        });

      }

      property.title =
        req.body.title;

      property.description =
        req.body.description;

      property.price =
        req.body.price;

      property.location =
        req.body.location;

      property.city =
        req.body.city;

      property.state =
        req.body.state;

      property.propertyType =
        req.body.propertyType;

      property.status =
        req.body.status;

      property.bedrooms =
        req.body.bedrooms;

      property.bathrooms =
        req.body.bathrooms;

      property.area =
        req.body.area;

      property.featured =
        req.body.featured ===
        'true';

      property.amenities =
        req.body.amenities
          ? req.body.amenities
              .split(',')
          : [];

      await property.save();

      res.json({

        success: true,

        property,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false,

        message: err.message,

      });

    }

  }
);


// DELETE PROPERTY
router.delete('/:id', async (req, res) => {

  try {

    const property =
      await Property.findById(
        req.params.id
      );

    if (!property) {

      return res.status(404).json({
        success: false,
        message:
          'Property not found',
      });

    }

    // DELETE CLOUDINARY IMAGES
    for (const img of property.images) {

      if (img.public_id) {

        await cloudinary.uploader.destroy(
          img.public_id
        );

      }

    }

    await Property.findByIdAndDelete(
      req.params.id
    );

    res.json({

      success: true,

      message:
        'Property deleted successfully',

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

});

module.exports = router;