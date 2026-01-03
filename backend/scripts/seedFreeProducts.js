const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Product = require('../models/Product');
const User = require('../models/User');
                                        
if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not set in .env file');
  process.exit(1);        
}
const MONGODB_URI = process.env.MONGODB_URI;
// Sample free products from Pexels
const sampleProducts = [
  {
    title: 'Abstract Colorful Waves',
    description: 'Beautiful abstract artwork with vibrant colors and smooth waves. Perfect for digital art lovers.',
    price: 0,
    image: 'https://images.pexels.com/photos/355881/pexels-photo-355881.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'abstract',
    tags: ['abstract', 'colorful', 'waves', 'modern'],
    isFree: true,
  },
  {
    title: 'Mountain Landscape at Sunset',
    description: 'Stunning mountain landscape photography captured during golden hour. Ideal for nature enthusiasts.',
    price: 0,
    image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'photo',
    tags: ['landscape', 'mountain', 'sunset', 'nature', 'photography'],
    isFree: true,
  },
  {
    title: 'Modern Geometric Design',
    description: 'Contemporary geometric design with clean lines and bold colors. Great for minimalist lovers.',
    price: 0,
    image: 'https://images.pexels.com/photos/3721999/pexels-photo-3721999.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'design',
    tags: ['geometric', 'modern', 'minimalist', 'design'],
    isFree: true,
  },
  {
    title: 'Ocean Wave Splash',
    description: 'Dynamic ocean wave photography. Perfect for beach and nature lovers. High quality image.',
    price: 0,
    image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'photo',
    tags: ['ocean', 'waves', 'nature', 'water', 'beach'],
    isFree: true,
  },
  {
    title: 'Forest Green Nature',
    description: 'Lush green forest landscape. Peaceful and calming nature photography.',
    price: 0,
    image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'photo',
    tags: ['forest', 'nature', 'green', 'landscape'],
    isFree: true,
  },
];

async function seedFreeProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB connected');

    // Get a test user or use the first user
    let testUser = await User.findOne({ email: 'designer@example.com' });
    if (!testUser) {
      testUser = await User.findOne();
    }

    if (!testUser) {
      console.log('❌ No user found. Please create a user first.');
      process.exit(1);
    }

    console.log(`📝 Using user: ${testUser.email}`);

    // Add userId to products
    const productsToAdd = sampleProducts.map((product) => ({
      ...product,
      userId: testUser._id,
      status: 'active',
    }));

    // Insert products
    const inserted = await Product.insertMany(productsToAdd);
    console.log(`✅ ${inserted.length} free products added successfully!`);

    // List inserted products
    inserted.forEach((product) => {
      console.log(`  - ${product.title} (${product.category}) - Tags: ${product.tags.join(', ')}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedFreeProducts();
