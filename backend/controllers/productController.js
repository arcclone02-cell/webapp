const Product = require('../models/Product');

// Get free products
exports.getFreeProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFree: true, status: 'active' })
      .sort('-createdAt');
    
    res.status(200).json(products);
  } catch (error) {
    console.error('Get free products error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Get all products of current user
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.userId }).sort('-createdAt');
    res.status(200).json({
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, image, category } = req.body;

    if (!title || !description || !price || !image) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    const product = new Product({
      userId: req.userId,
      title,
      description,
      price,
      image,
      category: category || 'other'
    });

    await product.save();

    res.status(201).json({
      message: 'Sản phẩm được tạo thành công',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Get product by ID
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('userId', 'name email');
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.status(200).json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, image, category, status } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Check ownership
    if (product.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật sản phẩm này' });
    }

    // Update fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (image) product.image = image;
    if (category) product.category = category;
    if (status) product.status = status;

    await product.save();

    res.status(200).json({
      message: 'Sản phẩm được cập nhật thành công',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Check ownership
    if (product.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa sản phẩm này' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Sản phẩm được xóa thành công' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};
