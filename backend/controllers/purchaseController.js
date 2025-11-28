const Purchase = require('../models/Purchase');

// Get all purchases of current user (as buyer)
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ buyerId: req.userId })
      .populate('productId', 'title price image description')
      .populate('sellerId', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      count: purchases.length,
      purchases
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Get all sales of current user (as seller)
exports.getSales = async (req, res) => {
  try {
    const sales = await Purchase.find({ sellerId: req.userId })
      .populate('productId', 'title price image description')
      .populate('buyerId', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      count: sales.length,
      sales
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Create purchase for free product
exports.createFreePurchase = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp productId' });
    }

    // Get product data
    const Product = require('../models/Product');
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    if (!product.isFree) {
      return res.status(400).json({ message: 'Sản phẩm này không phải miễn phí' });
    }

    const purchase = new Purchase({
      buyerId: req.userId,
      productId,
      sellerId: product.userId,
      productData: {
        title: product.title,
        price: 0,
        image: product.image,
        description: product.description
      },
      quantity,
      totalPrice: 0,
      status: 'completed',
      paymentMethod: 'free'
    });

    await purchase.save();

    res.status(201).json({
      message: 'Lấy sản phẩm miễn phí thành công',
      purchase
    });
  } catch (error) {
    console.error('Create free purchase error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Create purchase
exports.createPurchase = async (req, res) => {
  try {
    const { productId, sellerId, quantity = 1, paymentMethod } = req.body;

    if (!productId || !sellerId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp productId và sellerId' });
    }

    // Get product data
    const Product = require('../models/Product');
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const totalPrice = product.price * quantity;

    const purchase = new Purchase({
      buyerId: req.userId,
      productId,
      sellerId,
      productData: {
        title: product.title,
        price: product.price,
        image: product.image,
        description: product.description
      },
      quantity,
      totalPrice,
      paymentMethod: paymentMethod || 'credit_card'
    });

    await purchase.save();

    res.status(201).json({
      message: 'Mua hàng thành công',
      purchase
    });
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Update purchase status
exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Check if user is seller or buyer
    if (
      purchase.sellerId.toString() !== req.userId &&
      purchase.buyerId.toString() !== req.userId
    ) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật đơn hàng này' });
    }

    purchase.status = status;
    await purchase.save();

    res.status(200).json({
      message: 'Cập nhật trạng thái thành công',
      purchase
    });
  } catch (error) {
    console.error('Update purchase status error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Add review to purchase
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Check if user is buyer
    if (purchase.buyerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Chỉ người mua mới có thể đánh giá' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Vui lòng cung cấp rating từ 1 đến 5' });
    }

    purchase.review = {
      rating,
      comment: comment || '',
      reviewedAt: new Date()
    };

    await purchase.save();

    res.status(200).json({
      message: 'Đánh giá thành công',
      purchase
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};
