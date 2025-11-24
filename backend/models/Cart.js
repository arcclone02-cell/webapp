const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [
      {
        id: Number, // Pexels photo ID
        src: {
          large: String,
          medium: String,
          small: String
        },
        alt: String,
        photographer: String,
        url: String,
        price: Number,
        quantity: {
          type: Number,
          default: 1
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    totalPrice: {
      type: Number,
      default: 0
    },
    totalItems: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Tính tổng giá và số lượng trước khi lưu
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  this.totalPrice = this.items.reduce((total, item) => {
    return total + (item.price * (item.quantity || 1));
  }, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
