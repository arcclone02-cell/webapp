const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vui lòng cung cấp ID của người mua']
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Vui lòng cung cấp ID sản phẩm']
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vui lòng cung cấp ID của người bán']
    },
    productData: {
      title: String,
      price: Number,
      image: String,
      description: String
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    totalPrice: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'completed'
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'free', 'vnpay'],
      default: 'credit_card'
    },
    transactionId: String,
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      reviewedAt: Date
    },
    downloadUrl: String, // Link tải sản phẩm nếu là digital
    expiresAt: Date // Thời hạn truy cập sản phẩm
  },
  {
    timestamps: true
  }
);

// Index để tìm kiếm mua hàng của một người dùng
purchaseSchema.index({ buyerId: 1 });
purchaseSchema.index({ sellerId: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
