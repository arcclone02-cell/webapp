const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const User = require('../models/User');

async function checkUsers() {
  try {
    console.log('🔗 Kết nối tới MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:MRmagical123@cluster0.pnnzz3r.mongodb.net/e-market', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Đã kết nối MongoDB\n');

    const users = await User.find({}, '-password');
    console.log(`📊 Tổng users: ${users.length}\n`);

    if (users.length > 0) {
      console.log('👥 Danh sách users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Tạo lúc: ${user.createdAt}\n`);
      });
    } else {
      console.log('❌ Không có users nào trong database!');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

checkUsers();
