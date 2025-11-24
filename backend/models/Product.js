const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sản phẩm phải thuộc về một người dùng']
    },
    title: {
      type: String,
      required: [true, 'Vui lòng cung cấp tên sản phẩm'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Vui lòng cung cấp mô tả sản phẩm']
    },
    price: {
      type: Number,
      required: [true, 'Vui lòng cung cấp giá sản phẩm'],
      min: 0
    },
    image: {
      type: String,
      required: [true, 'Vui lòng cung cấp hình ảnh sản phẩm']
    },
    category: {
      type: String,
      enum: ['abstract', 'landscape', 'portrait', 'fantasy', 'nature', 'retro', 'minimalist', 'urban', 'art', 'photo', 'design', 'other'],
      default: 'other'
    },
    style: {
      type: String,
      enum: ['neon', 'cyberpunk', 'watercolor', 'synthwave', 'geometric', 'illustration', 'digital', 'graffiti', 'other'],
      default: 'other'
    },
    resolution: {
      type: String,
      enum: ['2K', '4K', '8K'],
      default: '4K'
    },
    fileFormat: {
      type: String,
      enum: ['PNG', 'JPG', 'PSD', 'AI', 'SVG', 'other'],
      default: 'PNG'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'sold'],
      default: 'active'
    },
    ratings: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    },
    viewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index để tìm kiếm sản phẩm của một người dùng
productSchema.index({ userId: 1 });

module.exports = mongoose.model('Product', productSchema);
