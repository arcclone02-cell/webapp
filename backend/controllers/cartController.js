const Cart = require('../models/Cart');

// Get cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      cart = new Cart({ userId: req.userId });
      await cart.save();
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const { item } = req.body;

    if (!item || !item.id) {
      return res.status(400).json({ message: 'Vui lòng cung cấp thông tin sản phẩm' });
    }

    let cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [item] });
    } else {
      // Check if item already exists
      const existingIndex = cart.items.findIndex(i => i.id === item.id);

      if (existingIndex > -1) {
        // Increase quantity
        cart.items[existingIndex].quantity = (cart.items[existingIndex].quantity || 1) + 1;
      } else {
        // Add new item
        cart.items.push(item);
      }
    }

    await cart.save();

    res.status(200).json({
      message: 'Thêm vào giỏ hàng thành công',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ID sản phẩm' });
    }

    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    cart.items = cart.items.filter(item => item.id !== itemId);
    await cart.save();

    res.status(200).json({
      message: 'Xóa khỏi giỏ hàng thành công',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: 'Xóa giỏ hàng thành công',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Update item quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Vui lòng cung cấp itemId và quantity hợp lệ' });
    }

    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    const item = cart.items.find(i => i.id === itemId);

    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ' });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      message: 'Cập nhật số lượng thành công',
      cart
    });
  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};
