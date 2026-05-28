const mongoose = require('mongoose');

const propertySchema =
  new mongoose.Schema(

    {

      title: {
        type: String,
        required: true,
      },

      description: {
        type: String,
        default: '',
      },

      price: {
        type: Number,
        required: true,
      },

      location: {
        type: String,
        default: '',
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        default:
          'Andhra Pradesh',
      },

      propertyType: {
        type: String,
        default: 'House',
      },

      status: {
        type: String,
        default: 'For Sale',
      },

      bedrooms: {
        type: Number,
        default: 0,
      },

      bathrooms: {
        type: Number,
        default: 0,
      },

      area: {
        type: Number,
        default: 0,
      },

      featured: {
        type: Boolean,
        default: false,
      },

      amenities: [

        {
          type: String,
        }

      ],

      images: [

        {

          url: {
            type: String,
          },

          public_id: {
            type: String,
          },

        }

      ],

    },

    {
      timestamps: true,
    }

  );

module.exports =
  mongoose.model(
    'Property',
    propertySchema
  );