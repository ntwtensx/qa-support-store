/**
 * 🚀 Rocket Coding - QA & Inbound System V4.2 (Cloud-Ready Enterprise Edition)
 * Backend Server: Node.js + Express + MongoDB (Mongoose)
 * Features: Render Cloud Native Support, Live DB Diagnostic API, Thai Timezone (UTC+7)
 */

require('dotenv').config();
const dns = require('dns');

// --- [1] Smart DNS Configuration ---
// หากรันในเครื่องตัวเอง (ไม่มีตัวแปร RENDER) ให้ใช้ Google/Cloudflare DNS เพื่อแก้ปัญหา Router บล็อก SRV
// แต่ถ้ารันบน Render Cloud ให้ใช้ระบบ DNS ภายในของ Data Center โดยตรงเพื่อความเสถียรสูงสุด
if (!process.env.RENDER) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    console.log('🏠 Local Mode: Using Google & Cloudflare DNS Resolver');
  } catch (e) {
    console.warn('⚠️ DNS Override skipped:', e.message);
  }
} else {
  console.log('☁️ Render Cloud Mode: Using Native Enterprise Cloud DNS');
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- [2] Middleware ตั้งค่าระบบรับส่งข้อมูล ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- [3] ระบบเชื่อมต่อฐานข้อมูล MongoDB พร้อมเก็บสถานะแจ้งเตือนบนหน้าเว็บ ---
const MONGODB_URI = process.env.MONGODB_URI;
let lastDbError = null;

async function connectDatabase() {
  if (!MONGODB_URI) {
    lastDbError = 'ยังไม่ได้ตั้งค่า MONGODB_URI ใน Environment Variables ของ Render';
    console.error('❌ ERROR:', lastDbError);
    return;
  }

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    lastDbError = null;
    console.log('✅ Connected to MongoDB Atlas successfully!');
  } catch (err) {
    lastDbError = err.message;
    console.error('❌ MongoDB Connection Error:', err.message);
  }
}

connectDatabase();

// --- [4] โครงสร้างฐานข้อมูล (Mongoose Schema & Indexes) ---
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true },          // รหัสบาร์โค้ดสินค้า
  category: { type: String, required: true, trim: true },    // หมวดหมู่ PMA (เช่น PMA 40)
  name: { type: String, required: true, trim: true },        // ชื่อสินค้า
  price: { type: Number, required: true, default: 0 },       // ราคาสินค้า
  inventory: { type: Number, required: true, default: 0 },   // จำนวนคงเหลือ
  mfgDate: { type: String, required: true },                 // วันที่ผลิต (YYYY-MM-DD)
  expDate: { type: String, required: true },                 // วันหมดอายุ (YYYY-MM-DD)
  expDateObj: { type: Number, required: true },              // Timestamp สำหรับจัดเรียงความเร็วสูง
  status: { type: String, enum: ['Pending', 'Managed'], default: 'Pending' }, // สถานะการตรวจสอบ
  actionDate: { type: String, default: '' },                 // วันที่กดจัดการสำเร็จ
  pl: { type: String, default: '-' }                         // รหัสตำแหน่งชั้นวาง Planogram
}, { timestamps: true });

// สร้าง Index เพื่อให้การดึงหมวดหมู่และเรียงวันหมดอายุทำงานในระดับเสี้ยววินาที
productSchema.index({ category: 1, expDateObj: 1 });
productSchema.index({ status: 1, expDate: 1 });

const Product = mongoose.model('Product', productSchema);

// --- [5] ฟังก์ชันคำนวณเวลาประเทศไทย (UTC+7) ---
// สำคัญมากเมื่อรันบน Render เพราะเซิร์ฟเวอร์ Render ใช้เวลา UTC (ช้ากว่าไทย 7 ชม.)
function getThaiDateObj() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (7 * 3600000));
}

function formatDate(dateInput) {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return '';
  }
}

// ==========================================
// 🚀 REST API ENDPOINTS
// ==========================================

// 0. API ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูลเพื่อแสดงผลบนหน้าเว็บ
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    connected: isConnected,
    error: isConnected ? null : (lastDbError || 'กำลังเชื่อมต่อฐานข้อมูล...'),
    thaiDate: formatDate(getThaiDateObj())
  });
});

// 1. รับสินค้าเข้าใหม่ (Inbound Product)
app.post('/api/products', async (req, res) => {
  try {
    const { id, pma, name, price, qty, mfg, exp, pl } = req.body;
    const expFormatted = formatDate(exp);
    const mfgFormatted = formatDate(mfg);

    const newProduct = new Product({
      id: String(id).trim(),
      category: String(pma).trim(),
      name: String(name).trim(),
      price: Number(price),
      inventory: Number(qty),
      mfgDate: mfgFormatted,
      expDate: expFormatted,
      expDateObj: new Date(expFormatted).getTime(),
      status: 'Pending',
      actionDate: '',
      pl: pl ? String(pl).trim().toUpperCase() : '-'
    });

    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. ดึงรายชื่อหมวดหมู่ PMA ทั้งหมด
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    categories.sort();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. ดึงสินค้าตามหมวดหมู่ พร้อมเรียงลำดับตามวันหมดอายุ
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category }).sort({ expDateObj: 1 }).lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. ดึงประวัติสินค้าที่จัดการแล้ว (Managed History)
app.get('/api/products/history', async (req, res) => {
  try {
    const history = await Product.find({ status: 'Managed' }).sort({ updatedAt: -1 }).lean();
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. แจ้งเตือนสินค้าที่จะหมดอายุพรุ่งนี้ (Expiring Tomorrow)
app.get('/api/notifications/tomorrow', async (req, res) => {
  try {
    const todayThai = getThaiDateObj();
    const tomorrowThai = new Date(todayThai);
    tomorrowThai.setDate(todayThai.getDate() + 1);
    const targetStr = formatDate(tomorrowThai);

    const items = await Product.find({
      expDate: targetStr,
      status: { $ne: 'Managed' }
    }).sort({ category: 1 }).lean();

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. แจ้งเตือนสินค้าหมดอายุเดือนหน้า จัดกลุ่มตาม PMA (Expiring Next Month)
app.get('/api/notifications/next-month', async (req, res) => {
  try {
    const todayThai = getThaiDateObj();
    let nextMonth = todayThai.getMonth() + 1;
    let year = todayThai.getFullYear();
    if (nextMonth > 11) {
      nextMonth = 0;
      year++;
    }

    const monthPrefix = `${year}-${String(nextMonth + 1).padStart(2, '0')}`;

    const items = await Product.find({
      expDate: { $regex: `^${monthPrefix}` },
      status: { $ne: 'Managed' }
    }).sort({ category: 1, expDateObj: 1 }).lean();

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 7. อัปเดตสถานะสินค้าเป็นจัดการแล้ว (Mark as Managed)
app.patch('/api/products/:identifier/manage', async (req, res) => {
  try {
    const { identifier } = req.params;
    const todayStr = formatDate(getThaiDateObj());

    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { id: identifier, status: { $ne: 'Managed' } };

    const updated = await Product.findOneAndUpdate(
      query,
      { $set: { status: 'Managed', actionDate: todayStr } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายการสินค้านี้' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. สร้างข้อมูลจำลอง 50 รายการสำหรับการทดสอบบน Cloud (Seed Demo Data)
app.post('/api/seed', async (req, res) => {
  try {
    await Product.deleteMany({});

    const categories = ['40', '41', '42', '50', '60'];
    const productTypes = ['Snack', 'Chocolate', 'Candy', 'Drink', 'Bakery'];
    const baseDate = getThaiDateObj();
    const mockData = [];

    for (let i = 1; i <= 50; i++) {
      const pmaPrefix = categories[Math.floor(Math.random() * categories.length)];
      const type = productTypes[Math.floor(Math.random() * productTypes.length)];
      const plCode = `${pmaPrefix}-${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-0${Math.floor(Math.random() * 9) + 1}`;

      // กำหนดให้ 5 รายการแรกหมดอายุพรุ่งนี้ เพื่อทดสอบแจ้งเตือนกระดิ่งได้ทันที
      const expOffset = i <= 5 ? 1 : Math.floor(Math.random() * 60) - 5;
      const expDate = new Date(baseDate);
      expDate.setDate(baseDate.getDate() + expOffset);

      const mfgDate = new Date(expDate);
      mfgDate.setMonth(mfgDate.getMonth() - 6);

      const expStr = formatDate(expDate);

      mockData.push({
        id: `885${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        category: `PMA ${pmaPrefix}`,
        name: `${type} ${String.fromCharCode(65 + (i % 26))} (Item ${i})`,
        price: (Math.floor(Math.random() * 10) + 1) * 5,
        inventory: Math.floor(Math.random() * 50) + 10,
        mfgDate: formatDate(mfgDate),
        expDate: expStr,
        expDateObj: new Date(expStr).getTime(),
        status: 'Pending',
        actionDate: '',
        pl: plCode
      });
    }

    await Product.insertMany(mockData);
    res.json({ success: true, count: mockData.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ส่งหน้าเว็บหลักสำหรับทุก Route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 QA-Support Store V4.2 is live on port ${PORT}`);
});