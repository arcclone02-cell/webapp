/**
 * Database Initialization Script
 * 
 * This script creates the MongoDB collections and indexes
 * Run once to set up the database structure
 * 
 * Usage: node backend/scripts/initializeDB.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const Cart = require('../models/Cart');

const MONGODB_URI = process.env.MONGODB_URI || 'URl database mongodb';

async function initializeDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Create indexes
    console.log('📑 Creating indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('  ✅ User email index created');

    // Product indexes
    await Product.collection.createIndex({ userId: 1 });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ status: 1 });
    console.log('  ✅ Product indexes created');

    // Purchase indexes
    await Purchase.collection.createIndex({ buyerId: 1 });
    await Purchase.collection.createIndex({ sellerId: 1 });
    await Purchase.collection.createIndex({ productId: 1 });
    console.log('  ✅ Purchase indexes created');

    // Cart indexes
    await Cart.collection.createIndex({ userId: 1 }, { unique: true });
    console.log('  ✅ Cart indexes created');

    console.log('\n✨ Database initialization completed successfully!');
    console.log('\n📊 Collections:');
    console.log('  • users');
    console.log('  • products');
    console.log('  • purchases');
    console.log('  • carts');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
