const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const Cart = require('../models/Cart');

async function resetDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'URl database mongodb', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB connected');

    // Drop all collections
    console.log('🗑️  Dropping collections...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Purchase.deleteMany({});
    await Cart.deleteMany({});
    console.log('✅ Collections dropped');

    // Create users
    console.log('\n👥 Creating users...');
    const users = await User.create([
      {
        name: 'Creative Designer',
        email: 'designer@example.com',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Khánh Cao',
        email: 'khanhcfcf00@gmail.com',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Art Collector',
        email: 'collector@example.com',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      }
    ]);
    console.log(`✅ Created ${users.length} users`);
    users.forEach(u => console.log(`   - ${u.email} (${u.role})`));

    // Create products (mix of free Pexels and paid)
    console.log('\n📦 Creating products...');
    const products = await Product.create([
      {
        userId: users[0]._id,
        title: 'Abstract Colorful Waves',
        description: 'Beautiful abstract artwork with vibrant colors and smooth waves. Perfect for digital art lovers and modern interior design.',
        price: 0,
        image: 'https://images.pexels.com/photos/355881/pexels-photo-355881.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'abstract',
        tags: ['abstract', 'colorful', 'waves', 'modern', 'vibrant'],
        isFree: true,
        status: 'active'
      },
      {
        userId: users[0]._id,
        title: 'Mountain Landscape at Sunset',
        description: 'Stunning mountain landscape photography captured during golden hour. Ideal for nature enthusiasts and landscape lovers.',
        price: 0,
        image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'photo',
        tags: ['landscape', 'mountain', 'sunset', 'nature', 'photography'],
        isFree: true,
        status: 'active'
      },
      {
        userId: users[0]._id,
        title: 'Modern Geometric Design',
        description: 'Contemporary geometric design with clean lines and bold colors. Great for minimalist lovers and modern design enthusiasts.',
        price: 0,
        image: 'https://images.pexels.com/photos/3721999/pexels-photo-3721999.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'design',
        tags: ['geometric', 'modern', 'minimalist', 'design', 'clean'],
        isFree: true,
        status: 'active'
      },
      {
        userId: users[0]._id,
        title: 'Ocean Wave Splash',
        description: 'Dynamic ocean wave photography. Perfect for beach and nature lovers. High quality image with professional editing.',
        price: 0,
        image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'photo',
        tags: ['ocean', 'waves', 'nature', 'water', 'beach'],
        isFree: true,
        status: 'active'
      },
      {
        userId: users[0]._id,
        title: 'Forest Green Nature',
        description: 'Lush green forest landscape. Peaceful and calming nature photography. Perfect for zen and meditation themes.',
        price: 0,
        image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'photo',
        tags: ['forest', 'nature', 'green', 'landscape', 'calm'],
        isFree: true,
        status: 'active'
      },
      {
        userId: users[1]._id,
        title: 'Custom Digital Art Commission',
        description: 'Custom digital art piece created specifically for your needs. High resolution and fully editable.',
        price: 99999,
        image: 'https://images.pexels.com/photos/3721999/pexels-photo-3721999.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'art',
        tags: ['custom', 'digital', 'commission', 'art', 'professional'],
        isFree: false,
        status: 'active'
      },
      {
        userId: users[1]._id,
        title: 'Premium Logo Design',
        description: 'Professional premium logo design service. Includes multiple concepts and revisions.',
        price: 199999,
        image: 'https://images.pexels.com/photos/3721999/pexels-photo-3721999.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'design',
        tags: ['logo', 'design', 'branding', 'professional'],
        isFree: false,
        status: 'active'
      }
    ]);
    console.log(`✅ Created ${products.length} products`);

    // Create sample purchases (for testing reviews)
    console.log('\n📋 Creating purchases...');
    const purchases = await Purchase.create([
      {
        buyerId: users[2]._id,
        productId: products[0]._id,
        sellerId: products[0].userId,
        productData: {
          title: products[0].title,
          price: products[0].price,
          image: products[0].image,
          description: products[0].description
        },
        quantity: 1,
        totalPrice: 0,
        status: 'completed',
        paymentMethod: 'credit_card'
      },
      {
        buyerId: users[2]._id,
        productId: products[1]._id,
        sellerId: products[1].userId,
        productData: {
          title: products[1].title,
          price: products[1].price,
          image: products[1].image,
          description: products[1].description
        },
        quantity: 1,
        totalPrice: 0,
        status: 'completed',
        paymentMethod: 'credit_card',
        review: {
          rating: 5,
          comment: 'Tuyệt vời! Ảnh có chất lượng rất cao, đúng như mô tả.',
          reviewedAt: new Date()
        }
      },
      {
        buyerId: users[2]._id,
        productId: products[2]._id,
        sellerId: products[2].userId,
        productData: {
          title: products[2].title,
          price: products[2].price,
          image: products[2].image,
          description: products[2].description
        },
        quantity: 1,
        totalPrice: 0,
        status: 'completed',
        paymentMethod: 'credit_card',
        review: {
          rating: 4,
          comment: 'Tốt lắm! Thiết kế rất đẹp và hiện đại.',
          reviewedAt: new Date()
        }
      }
    ]);
    console.log(`✅ Created ${purchases.length} purchases`);

    // Create sample carts
    console.log('\n🛒 Creating carts...');
    const carts = await Cart.create([
      {
        userId: users[2]._id,
        items: [],
        totalPrice: 0,
        totalItems: 0
      },
      {
        userId: users[3]._id,
        items: [],
        totalPrice: 0,
        totalItems: 0
      }
    ]);
    console.log(`✅ Created ${carts.length} carts`);

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 DATABASE RESET COMPLETED');
    console.log('='.repeat(50));
    console.log(`👥 Users: ${users.length}`);
    console.log(`📦 Products: ${products.length}`);
    console.log(`📋 Purchases: ${purchases.length}`);
    console.log(`🛒 Carts: ${carts.length}`);
    console.log('='.repeat(50));

    console.log('\n🔐 Test credentials:');
    console.log('   Email: designer@example.com');
    console.log('   Pass: password123');
    console.log('   OR');
    console.log('   Email: khanhcfcf00@gmail.com');
    console.log('   Pass: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetDatabase();
