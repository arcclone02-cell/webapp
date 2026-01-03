/**
 * Seed Database Script
 * 
 * This script creates sample data for testing
 * 
 * Usage: node backend/scripts/seedDatabase.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const Cart = require('../models/Cart');

const MONGODB_URI = process.env.MONGODB_URI || 'URl database mongodb';

// Sample users
const sampleUsers = [
  {
    name: 'Nguyễn Văn A',
    email: 'user1@example.com',
    password: 'password123',
    role: 'user',
    avatar: 'https://via.placeholder.com/150'
  },
  {
    name: 'Trần Thị B',
    email: 'user2@example.com',
    password: 'password123',
    role: 'user',
    avatar: 'https://via.placeholder.com/150'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://via.placeholder.com/150'
  }
];

// Sample products
const createSampleProducts = (userId) => [
  {
    userId,
    title: 'Bộ sưu tập ảnh thiên nhiên',
    description: 'Bộ sưu tập 50 bức ảnh thiên nhiên đẹp nhất được chụp từ các bình minh trên núi',
    price: 150000,
    image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg',
    category: 'photo',
    status: 'active'
  },
  {
    userId,
    title: 'Logo Design Bundle',
    description: 'Bộ 20 logo design chuyên nghiệp cho thương hiệu của bạn',
    price: 200000,
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
    category: 'design',
    status: 'active'
  },
  {
    userId,
    title: 'Abstract Art Collection',
    description: 'Bộ sưu tập tranh trừu tượng độc đáo với 15 tác phẩm nghệ thuật số',
    price: 300000,
    image: 'https://images.pexels.com/photos/3561339/pexels-photo-3561339.jpeg',
    category: 'art',
    status: 'active'
  }
];

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Purchase.deleteMany({});
    await Cart.deleteMany({});
    console.log('✅ Data cleared');

    // Create users
    console.log('\n👥 Creating sample users...');
    const users = await User.create(sampleUsers);
    console.log(`✅ Created ${users.length} users`);

    // Create products
    console.log('\n📦 Creating sample products...');
    let productCount = 0;
    for (const user of users) {
      const products = createSampleProducts(user._id);
      await Product.create(products);
      productCount += products.length;
    }
    console.log(`✅ Created ${productCount} products`);

    // Create purchases
    console.log('\n🛒 Creating sample purchases...');
    const allProducts = await Product.find();
    const purchaseData = {
      buyerId: users[0]._id,
      productId: allProducts[0]._id,
      sellerId: users[1]._id,
      productData: {
        title: allProducts[0].title,
        price: allProducts[0].price,
        image: allProducts[0].image,
        description: allProducts[0].description
      },
      quantity: 1,
      totalPrice: allProducts[0].price,
      status: 'completed',
      paymentMethod: 'credit_card'
    };

    const purchase = await Purchase.create(purchaseData);
    console.log('✅ Created sample purchase');

    // Create carts
    console.log('\n🛍️  Creating sample carts...');
    for (const user of users) {
      await Cart.create({ userId: user._id, items: [] });
    }
    console.log(`✅ Created ${users.length} carts`);

    console.log('\n✨ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`  • Users: ${users.length}`);
    console.log(`  • Products: ${productCount}`);
    console.log('  • Purchases: 1');
    console.log(`  • Carts: ${users.length}`);

    console.log('\n👤 Test Accounts:');
    console.log('  1. Email: user1@example.com | Password: password123');
    console.log('  2. Email: user2@example.com | Password: password123');
    console.log('  3. Email: admin@example.com | Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
