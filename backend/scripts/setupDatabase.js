/**
 * Complete Database Setup Script
 * Creates database, collections, indexes, and sample data for Digital Art Marketplace
 * 
 * Usage: node backend/scripts/setupDatabase.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const Cart = require('../models/Cart');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:MRmagical123@cluster0.pnnzz3r.mongodb.net/e-market';

// ==================== SAMPLE DATA ====================

const sampleUsers = [
  {
    name: 'Digital Artist Pro',
    email: 'artist1@example.com',
    password: 'Password123!',
    role: 'user',
    avatar: 'https://via.placeholder.com/150'
  },
  {
    name: 'Creative Designer',
    email: 'designer@example.com',
    password: 'Password123!',
    role: 'user',
    avatar: 'https://via.placeholder.com/150'
  },
  {
    name: 'Art Collector',
    email: 'collector@example.com',
    password: 'Password123!',
    role: 'user',
    avatar: 'https://via.placeholder.com/150'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123!',
    role: 'admin',
    avatar: 'https://via.placeholder.com/150'
  }
];

const createSampleProducts = (userId) => [
  {
    userId,
    title: 'Abstract Neon Dreams',
    description: 'A vibrant digital artwork featuring neon colors with abstract shapes. Perfect for modern interior design. High resolution 4K PNG file.',
    price: 350000,
    image: 'https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg',
    category: 'abstract',
    style: 'neon',
    resolution: '4K',
    fileFormat: 'PNG',
    status: 'active',
    viewCount: 234,
    rating: 4.9
  },
  {
    userId,
    title: 'Cyberpunk City Night',
    description: 'Futuristic digital landscape with glowing neon buildings and flying vehicles. Ideal for wallpapers and printing. 8K resolution.',
    price: 450000,
    image: 'https://images.pexels.com/photos/3644014/pexels-photo-3644014.jpeg',
    category: 'landscape',
    style: 'cyberpunk',
    resolution: '8K',
    fileFormat: 'JPG',
    status: 'active',
    viewCount: 312,
    rating: 4.8
  },
  {
    userId,
    title: 'Ethereal Watercolor Portrait',
    description: 'Beautiful digital portrait with watercolor effects. Perfect for gallery printing and personal collections. High-quality digital art.',
    price: 280000,
    image: 'https://images.pexels.com/photos/3561339/pexels-photo-3561339.jpeg',
    category: 'portrait',
    style: 'watercolor',
    resolution: '4K',
    fileFormat: 'PSD',
    status: 'active',
    viewCount: 189,
    rating: 4.7
  },
  {
    userId,
    title: 'Retro Synthwave Sunset',
    description: 'Nostalgic 80s style digital art with vibrant gradient sunset and silhouettes. Great for posters and merchandise.',
    price: 250000,
    image: 'https://images.pexels.com/photos/3768105/pexels-photo-3768105.jpeg',
    category: 'retro',
    style: 'synthwave',
    resolution: '4K',
    fileFormat: 'PNG',
    status: 'active',
    viewCount: 156,
    rating: 4.6
  },
  {
    userId,
    title: 'Minimalist Geometric Poster',
    description: 'Clean and modern minimalist design with geometric patterns. Perfect for web design and branding projects.',
    price: 180000,
    image: 'https://images.pexels.com/photos/3648118/pexels-photo-3648118.jpeg',
    category: 'minimalist',
    style: 'geometric',
    resolution: '2K',
    fileFormat: 'AI',
    status: 'active',
    viewCount: 123,
    rating: 4.5
  },
  {
    userId,
    title: 'Fantasy Character Illustration',
    description: 'Detailed digital illustration of an fantasy character with magical effects. Suitable for book covers and game assets.',
    price: 520000,
    image: 'https://images.pexels.com/photos/3661155/pexels-photo-3661155.jpeg',
    category: 'fantasy',
    style: 'illustration',
    resolution: '4K',
    fileFormat: 'PSD',
    status: 'active',
    viewCount: 267,
    rating: 4.9
  },
  {
    userId,
    title: 'Nature Digital Composition',
    description: 'Stunning digital artwork combining nature elements with artistic filters. Perfect for environmental campaigns and nature lovers.',
    price: 320000,
    image: 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg',
    category: 'nature',
    style: 'digital',
    resolution: '4K',
    fileFormat: 'PNG',
    status: 'active',
    viewCount: 198,
    rating: 4.8
  },
  {
    userId,
    title: 'Urban Graffiti Street Art',
    description: 'Contemporary street art style digital creation with vibrant colors and urban elements. Great for wall art and posters.',
    price: 290000,
    image: 'https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg',
    category: 'urban',
    style: 'graffiti',
    resolution: '4K',
    fileFormat: 'JPG',
    status: 'active',
    viewCount: 145,
    rating: 4.7
  }
];

const createSamplePurchases = (buyerId, sellerId, productIds) => [
  {
    buyerId,
    sellerId,
    productId: productIds[0],
    productData: {
      title: 'Abstract Neon Dreams',
      price: 350000,
      image: 'https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg'
    },
    quantity: 1,
    totalPrice: 350000,
    status: 'completed',
    paymentMethod: 'credit_card',
    review: {
      rating: 5,
      comment: 'Absolutely stunning artwork! High quality and delivered promptly.',
      reviewer: buyerId
    }
  },
  {
    buyerId,
    sellerId,
    productId: productIds[1],
    productData: {
      title: 'Cyberpunk City Night',
      price: 450000,
      image: 'https://images.pexels.com/photos/3644014/pexels-photo-3644014.jpeg'
    },
    quantity: 1,
    totalPrice: 450000,
    status: 'completed',
    paymentMethod: 'bank_transfer'
  },
  {
    buyerId,
    sellerId,
    productId: productIds[2],
    productData: {
      title: 'Ethereal Watercolor Portrait',
      price: 280000,
      image: 'https://images.pexels.com/photos/3561339/pexels-photo-3561339.jpeg'
    },
    quantity: 1,
    totalPrice: 280000,
    status: 'pending',
    paymentMethod: 'credit_card'
  }
];

// ==================== DATABASE SETUP ====================

async function setupDatabase() {
  try {
    console.log('\n🚀 Starting Database Setup for Digital Art Marketplace...\n');

    // Connect to MongoDB
    console.log(`🔗 Connecting to MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Purchase.deleteMany({}),
      Cart.deleteMany({})
    ]);
    
    // Drop old indexes
    try {
      await User.collection.dropIndex('email_1');
    } catch (err) {
      // Index might not exist
    }
    
    console.log('✅ Data cleared\n');

    // Create Users
    console.log('👥 Creating sample users...');
    const users = await User.create(sampleUsers);
    console.log(`✅ Created ${users.length} users`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    // Create Products
    console.log('\n🎨 Creating sample digital artworks...');
    let productCount = 0;
    const productsByUser = {};

    for (let i = 0; i < users.length - 1; i++) {
      const userId = users[i]._id;
      const products = await Product.create(createSampleProducts(userId));
      productsByUser[i] = products.map(p => p._id);
      productCount += products.length;
      console.log(`   - ${products.length} artworks for ${users[i].name}`);
    }
    console.log(`✅ Created ${productCount} digital artworks\n`);

    // Create Purchases
    console.log('💳 Creating sample purchases...');
    const buyerId = users[2]._id;
    const sellerId = users[0]._id;
    const purchases = await Purchase.create(
      createSamplePurchases(buyerId, sellerId, productsByUser[0])
    );
    console.log(`✅ Created ${purchases.length} purchases\n`);

    // Create Shopping Carts
    console.log('🛒 Creating sample shopping carts...');
    const carts = await Cart.create([
      {
        userId: users[2]._id,
        items: [
          {
            productId: productsByUser[1][0],
            quantity: 1,
            price: 450000
          }
        ]
      },
      {
        userId: users[1]._id,
        items: [
          {
            productId: productsByUser[0][2],
            quantity: 1,
            price: 280000
          }
        ]
      }
    ]);
    console.log(`✅ Created ${carts.length} shopping carts\n`);

    // Create Indexes
    console.log('📑 Creating indexes...');
    try {
      await Promise.all([
        // User indexes
        User.collection.createIndex({ email: 1 }, { unique: true, sparse: true }).catch(err => {
          if (err.code !== 68) throw err; // Ignore "index already exists" error
        }),
        User.collection.createIndex({ createdAt: -1 }).catch(err => {
          if (err.code !== 68) throw err;
        }),
        
        // Product indexes
        Product.collection.createIndex({ userId: 1 }).catch(err => {
          if (err.code !== 68) throw err;
        }),
        Product.collection.createIndex({ category: 1 }).catch(err => {
          if (err.code !== 68) throw err;
        }),
        Product.collection.createIndex({ style: 1 }).catch(err => {
          if (err.code !== 68) throw err;
        }),
        Product.collection.createIndex({ status: 1 }).catch(err => {
          if (err.code !== 68) throw err;
        }),
        Product.collection.createIndex({ createdAt: -1 }).catch(err => {
          if (err.code !== 68) throw err;
        }),
        
        // Purchase indexes
        Purchase.collection.createIndex({ buyerId: 1 }).catch(err => {
          if (err.code !== 68) throw err;
        }),
        Purchase.collection.createIndex({ sellerId: 1 }).catch(err => {
          if (err.code !== 68) throw err;
        }),
        Purchase.collection.createIndex({ productId: 1 }).catch(err => {
          if (err.code !== 68) throw err;
        }),
        Purchase.collection.createIndex({ createdAt: -1 }).catch(err => {
          if (err.code !== 68) throw err;
        }),
        
        // Cart indexes
        Cart.collection.createIndex({ userId: 1 }, { unique: true }).catch(err => {
          if (err.code !== 68) throw err;
        })
      ]);
    } catch (err) {
      if (err.code !== 68) {
        throw err;
      }
    }
    console.log('✅ Indexes created\n');

    // Display Database Info
    console.log('📊 Database Information:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections:');
    collections.forEach(col => {
      console.log(`  ✓ ${col.name}`);
    });

    console.log('\n📈 Document Counts:');
    const counts = {
      users: await User.countDocuments(),
      artworks: await Product.countDocuments(),
      purchases: await Purchase.countDocuments(),
      carts: await Cart.countDocuments()
    };
    Object.entries(counts).forEach(([key, count]) => {
      console.log(`  ${key}: ${count}`);
    });

    console.log('\n✨ Database setup completed successfully!\n');
    console.log('📝 Test Accounts:');
    sampleUsers.forEach(user => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Role: ${user.role}\n`);
    });

  } catch (error) {
    console.error('\n❌ Error setting up database:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// Run setup
setupDatabase();
