const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Property price is required'],
    },
    location: {
      type: String,
      required: [true, 'Property location is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      default: 'Andhra Pradesh',
      trim: true,
    },
    propertyType: {
      type: String,
      enum: ['Apartment', 'Villa', 'Plot', 'House', 'Commercial', 'Penthouse'],
      required: [true, 'Property type is required'],
    },
    status: {
      type: String,
      enum: ['For Sale', 'For Rent', 'Sold', 'Rented'],
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
      type: Number, // sq ft
      required: [true, 'Area is required'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', propertySchema);