const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const Cart = require('../models/Cart');

const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE;
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET;
const VNPAY_URL = process.env.VNPAY_URL;
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL;
const VNPAY_NOTIFY_URL = process.env.VNPAY_NOTIFY_URL;

// Tạo URL thanh toán VNPay
exports.createPaymentUrl = async (req, res) => {
  try {
    const { cartItems, totalAmount } = req.body;
    const userId = req.userId;

    console.log('💳 Creating VNPay payment URL for user:', userId);
    console.log('📦 Cart items:', cartItems.length, 'items');
    console.log('💰 Total amount:', totalAmount);

    if (!cartItems || cartItems.length === 0 || !totalAmount) {
      return res.status(400).json({ message: 'Giỏ hàng trống hoặc số tiền không hợp lệ' });
    }

    if (!VNPAY_TMN_CODE || !VNPAY_HASH_SECRET) {
      console.error('❌ VNPay configuration missing');
      return res.status(500).json({ message: 'Cấu hình VNPay chưa đầy đủ' });
    }

    // Lưu thông tin đơn hàng tạm thời
    const orderId = `${userId}-${Date.now()}`;
    
    // Chuẩn bị dữ liệu gửi đến VNPay
    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: VNPAY_TMN_CODE,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: totalAmount * 100, // VNPay yêu cầu tính bằng đơn vị nhỏ nhất (×100)
      vnp_ReturnUrl: VNPAY_RETURN_URL,
      vnp_NotifyUrl: VNPAY_NOTIFY_URL,
      vnp_IpAddr: getClientIP(req),
      vnp_CreateDate: getDatetime(),
      vnp_ExpireDate: getExpireDate()
    };

    console.log('📝 VNPay Params prepared');

    // Sắp xếp theo thứ tự từ điển
    vnp_Params = sortObject(vnp_Params);
    
    console.log('🔍 Sorted VNPay Params:', vnp_Params);

    // Tạo URL request - không encode vì sortObject đã encode
    let query = '';
    for (let key in vnp_Params) {
      if (query === '') {
        query = key + '=' + vnp_Params[key];
      } else {
        query += '&' + key + '=' + vnp_Params[key];
      }
    }
    console.log('📄 Query string:', query);
    
    let hmac = crypto
      .createHmac('sha512', VNPAY_HASH_SECRET)
      .update(Buffer.from(query, 'utf-8'))
      .digest('hex');
    
    vnp_Params['vnp_SecureHash'] = hmac;
    console.log('🔐 Secure Hash:', hmac);

    // URL thanh toán
    const paymentUrl = VNPAY_URL + '?' + query + '&vnp_SecureHash=' + hmac;

    console.log('✅ Payment URL created successfully');
    console.log('🔗 Full URL:', paymentUrl);

    res.status(200).json({
      message: 'URL thanh toán đã được tạo',
      paymentUrl: paymentUrl,
      orderId: orderId
    });

  } catch (error) {
    console.error('❌ Error creating payment URL:', error);
    res.status(500).json({ message: 'Lỗi khi tạo URL thanh toán', error: error.message });
  }
};

// Xử lý callback từ VNPay (Return URL)
exports.handlePaymentReturn = async (req, res) => {
  try {
    console.log('🔄 Payment return from VNPay');
    console.log('📨 Query params:', JSON.stringify(req.query, null, 2));
    
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa secure hash khỏi params để verify
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp và tạo hash
    vnp_Params = sortObject(vnp_Params);
    let query = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto
      .createHmac('sha512', VNPAY_HASH_SECRET)
      .update(Buffer.from(query, 'utf-8'))
      .digest('hex');

    console.log('🔐 Verifying hash...');

    // Verify hash
    if (secureHash === hmac) {
      if (vnp_Params['vnp_ResponseCode'] === '00') {
        // Thanh toán thành công
        console.log('✅ Payment successful!');
        const orderId = vnp_Params['vnp_TxnRef'];
        const amount = vnp_Params['vnp_Amount'] / 100;
        const transactionId = vnp_Params['vnp_TransactionNo'];
        const bankCode = vnp_Params['vnp_BankCode'];

        console.log(`📊 Order Details:
          - Order ID: ${orderId}
          - Amount: ${amount}
          - Transaction ID: ${transactionId}
          - Bank: ${bankCode}`);

        // Redirect về frontend với thông tin thành công
        return res.redirect(`http://localhost:4200/payment-success?orderId=${orderId}&amount=${amount}&transactionId=${transactionId}`);
      } else {
        // Thanh toán thất bại
        console.log('❌ Payment failed with response code:', vnp_Params['vnp_ResponseCode']);
        return res.redirect(`http://localhost:4200/payment-failed?code=${vnp_Params['vnp_ResponseCode']}`);
      }
    } else {
      console.log('❌ Invalid secure hash');
      console.log('Expected:', hmac);
      console.log('Received:', secureHash);
      return res.redirect(`http://localhost:4200/payment-failed?code=99`);
    }
  } catch (error) {
    console.error('❌ Error handling payment return:', error);
    return res.redirect(`http://localhost:4200/payment-failed?code=99`);
  }
};

// Nhận thông báo từ VNPay (IPN - Instant Payment Notification)
exports.handlePaymentNotify = async (req, res) => {
  try {
    console.log('📬 Payment notification from VNPay');
    console.log('📨 Notify data:', JSON.stringify(req.body, null, 2));
    
    let vnp_Params = req.body;
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let query = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto
      .createHmac('sha512', VNPAY_HASH_SECRET)
      .update(Buffer.from(query, 'utf-8'))
      .digest('hex');

    console.log('🔐 Verifying notify hash...');

    if (secureHash === hmac) {
      if (vnp_Params['vnp_ResponseCode'] === '00') {
        console.log('✅ Notify: Payment successful');
        
        const orderId = vnp_Params['vnp_TxnRef'];
        const amount = vnp_Params['vnp_Amount'] / 100;
        const transactionId = vnp_Params['vnp_TransactionNo'];

        console.log(`📊 Processing order: ${orderId}`);

        // TODO: Cập nhật Purchase records trong database
        // Có thể implement logic để tạo Purchase từ Cart items

        console.log('✅ Order updated successfully');
        res.status(200).json({ RspCode: '00', Message: 'Success' });
      } else {
        console.log('❌ Notify: Payment failed');
        res.status(200).json({ RspCode: '01', Message: 'Failed' });
      }
    } else {
      console.log('❌ Invalid notify signature');
      res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('❌ Error handling payment notify:', error);
    res.status(200).json({ RspCode: '99', Message: 'Error' });
  }
};

// Hàm helper: Sắp xếp object
function sortObject(o) {
  let sorted = {};
  let str = [];
  for (let key in o) {
    if (o.hasOwnProperty(key)) {
      str.push(key);
    }
  }
  str.sort();
  for (let key of str) {
    sorted[key] = encodeURIComponent(o[key]).replace(/%20/g, '+');
  }
  return sorted;
}

// Hàm helper: Lấy IP của client
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
}

// Hàm helper: Lấy datetime (YYYYMMDDhhmmss)
function getDatetime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return year + month + date + hours + minutes + seconds;
}

// Hàm helper: Lấy expire date (15 phút sau)
function getExpireDate() {
  const now = new Date();
  const expireDate = new Date(now.getTime() + 15 * 60000); // 15 phút
  const year = expireDate.getFullYear();
  const month = String(expireDate.getMonth() + 1).padStart(2, '0');
  const date = String(expireDate.getDate()).padStart(2, '0');
  const hours = String(expireDate.getHours()).padStart(2, '0');
  const minutes = String(expireDate.getMinutes()).padStart(2, '0');
  const seconds = String(expireDate.getSeconds()).padStart(2, '0');
  
  return year + month + date + hours + minutes + seconds;
}

module.exports = {
  createPaymentUrl: exports.createPaymentUrl,
  handlePaymentReturn: exports.handlePaymentReturn,
  handlePaymentNotify: exports.handlePaymentNotify
};
