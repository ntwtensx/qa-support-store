/**
 * 🚀 Rocket Coding - QA-Support Store V5.2 (Always-Awake Production Edition)
 * Backend Server: Node.js + Express + MongoDB (Mongoose)
 * Features: 3-Layer Anti-Sleep Keep-Alive Engine, PIN Auth, 92 PMA Master List, Smart Barcode Lookup
 */

require('dotenv').config();
const dns = require('dns');

// --- [1] ตั้งค่า DNS อัตโนมัติสำหรับ Localhost และ Render Cloud ---
if (!process.env.RENDER) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {}
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- [2] Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- [3] ฐานข้อมูลหมวดหมู่ PMA มาตรฐาน (92 รายการ) ---
const PMA_MASTER_LIST = [
  { code: '01', name: 'CHILLED BREAD' },
  { code: '02', name: 'APPETIZER' },
  { code: '03', name: 'FRUIT & CHILLED DESSERT' },
  { code: '04', name: 'AVAILABLE' },
  { code: '05', name: 'SI COUNTER DRINK' },
  { code: '06', name: 'FOOD PLACE' },
  { code: '07', name: 'TOASTED SANDWICH & HOT BREAD' },
  { code: '08', name: 'BURGER & HOT DOG' },
  { code: '09', name: 'VALUE CARD' },
  { code: '10', name: 'BEER AND RTD ALCOHOL' },
  { code: '11', name: 'LIQUOR' },
  { code: '12', name: 'IMPORT CIGARETTE' },
  { code: '13', name: 'AVAILABLE' },
  { code: '14', name: 'HEALTH CARE' },
  { code: '15', name: 'COUNT CUSTOMER' },
  { code: '16', name: 'สลัด (Salad)' },
  { code: '18', name: 'MEDICINE' },
  { code: '19', name: 'CHILLED MEAL BOX 1' },
  { code: '20', name: 'FROZEN MEAL BOX' },
  { code: '21', name: 'SAUSAGE - COLD CUT AND FURTHER' },
  { code: '22', name: 'CHILLED MEAL BOX 2' },
  { code: '23', name: 'GRILLED SAUSAGE' },
  { code: '24', name: 'WARMED FOODS' },
  { code: '25', name: 'RETORT MEAL' },
  { code: '26', name: 'บัตรโทรศัพท์' },
  { code: '27', name: 'GAME (7 TOP UP)' },
  { code: '28', name: 'BOOKS' },
  { code: '29', name: 'UHT MILK' },
  { code: '30', name: 'PASTEURIZED MILK' },
  { code: '31', name: 'PASTEURIZED DRINK' },
  { code: '32', name: 'COOKING AND CANNED FOODS' },
  { code: '33', name: 'INSTANT FOODS' },
  { code: '34', name: 'PACKAGED FOODS AND DRINKS' },
  { code: '35', name: 'SPECIAL ITEM' },
  { code: '36', name: 'CHILLED BREAD & SYNERGY PROJECT' },
  { code: '37', name: 'แสตมป์ 7-11' },
  { code: '38', name: 'NON-CARBONATED SOFT DRINK' },
  { code: '39', name: 'ENTERTAINMENT' },
  { code: '40', name: 'CONFECTIONERY' },
  { code: '41', name: 'SNACKS' },
  { code: '42', name: 'CARBONATED SOFT DRINK (CSD)' },
  { code: '43', name: 'IT Devices' },
  { code: '44', name: 'ICE CREAM AND NOVELTIES' },
  { code: '45', name: 'ICE' },
  { code: '46', name: '7 Service (GP)' },
  { code: '48', name: 'HEALTH AND WELLNESS' },
  { code: '49', name: 'ENERGY AND SPORT DRINK' },
  { code: '50', name: 'PERSONAL CARE' },
  { code: '51', name: 'HOUSEWARE' },
  { code: '52', name: 'STATIONERY' },
  { code: '53', name: 'DRUG & HEALTHCARE' },
  { code: '54', name: 'SANITARY' },
  { code: '55', name: 'HOUSEHOLD' },
  { code: '56', name: 'ELECTRONIC' },
  { code: '57', name: 'AVAILABLE' },
  { code: '58', name: 'IT APPLIANCE' },
  { code: '59', name: 'HERBAL PERSONAL CARE' },
  { code: '60', name: 'PACKAGE BAKERY' },
  { code: '61', name: 'SANDWICH BREAD' },
  { code: '62', name: 'FRESH BAKERY' },
  { code: '63', name: 'THAI SNACK AND DRY FRUIT' },
  { code: '64', name: 'เติมเงิน ONLINE (GP)' },
  { code: '65', name: 'AVAILABLE' },
  { code: '66', name: '7 SERVICE (Commission.)' },
  { code: '67', name: 'AVAILABLE' },
  { code: '68', name: 'สินค้าเทศกาล' },
  { code: '69', name: 'SERVICE CARD' },
  { code: '70', name: 'เติมเงิน ONLINE (Commission)' },
  { code: '71', name: '7 TOP UP CASH' },
  { code: '72', name: 'THAI CIGARETTEE' },
  { code: '73', name: 'BELLINEE BAKERY' },
  { code: '74', name: 'CHARITY' },
  { code: '75', name: 'BELLINEE PACKAGED BAKERY' },
  { code: '76', name: 'KUDSAN SUPPLY USED.' },
  { code: '77', name: 'WELLNESS AND FASHION' },
  { code: '78', name: 'BASKET' },
  { code: '79', name: 'BELLINEE BEVERAGE' },
  { code: '80', name: 'VARIETY BAKERY' },
  { code: '81', name: 'AVAILABLE' },
  { code: '82', name: 'CPG SYNERGY' },
  { code: '83', name: 'PROJECT SYNERGY' },
  { code: '84', name: 'VEGETABLE' },
  { code: '85', name: 'READY TO COOK(RTC)' },
  { code: '86', name: 'MAGAZINE AND NEWSPAPER' },
  { code: '87', name: 'KUDSAN BEVERAGE' },
  { code: '88', name: 'HOME & LIVING' },
  { code: '89', name: 'CATALOG ON SHELF' },
  { code: '90', name: 'PROMOTION PREMIUM' },
  { code: '91', name: 'DUMMY PRODUCT PROMOTION' },
  { code: '94', name: 'SUPPLY FOR SALE' },
  { code: '96', name: 'HOT SERVED' },
  { code: '97', name: 'SOCIAL WELFARE' }
];

// สร้าง Map สำหรับจับคู่รหัส PMA ความเร็วสูงระดับ O(1)
const PMA_MAP = new Map(PMA_MASTER_LIST.map(item => [item.code, `${item.code} - ${item.name}`]));

function resolvePmaLabel(input) {
  if (!input) return '00 - UNDEFINED';
  const match = String(input).match(/(\d{2})/);
  if (match && PMA_MAP.has(match[1])) {
    return PMA_MAP.get(match[1]);
  }
  return String(input).trim();
}

function extractPmaCode(input) {
  const match = String(input || '').match(/(\d{2})/);
  return match ? match[1] : '';
}

// --- [4] บัญชีผู้ใช้งานระบบ ---
const STORE_ACCOUNTS = {
  'test@store': {
    email: 'test@store',
    pin: '000000',
    role: 'staff',
    title: 'พนักงานร้านค้า'
  },
  'admin@store': {
    email: 'admin@store',
    pin: '000000',
    role: 'admin',
    title: 'ผู้ดูแลระบบ'
  }
};

// --- [5] เชื่อมต่อฐานข้อมูล MongoDB Atlas ---
const MONGODB_URI = process.env.MONGODB_URI;
let lastDbError = null;

async function connectDatabase() {
  if (!MONGODB_URI) {
    lastDbError = 'ไม่ได้ตั้งค่า MONGODB_URI';
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    lastDbError = null;
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    lastDbError = err.message;
    console.error('❌ MongoDB Connection Error:', err.message);
  }
}

connectDatabase();

// --- [6] โครงสร้างตารางฐานข้อมูล (Product Schema) ---
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true, index: true },
  pmaCode: { type: String, required: true, trim: true, index: true },
  category: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, default: 0 },
  inventory: { type: Number, required: true, default: 0 },
  mfgDate: { type: String, required: true },
  expDate: { type: String, required: true },
  expDateObj: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Managed'], default: 'Pending' },
  actionDate: { type: String, default: '' },
  pl: { type: String, default: '-' },
  createdBy: { type: String, default: 'system' },
  managedBy: { type: String, default: '' }
}, { timestamps: true });

productSchema.index({ pmaCode: 1, expDateObj: 1 });
productSchema.index({ status: 1, expDate: 1 });

const Product = mongoose.model('Product', productSchema);

// --- [7] ฟังก์ชันจัดการวันที่ตามเวลาประเทศไทย (UTC+7) ---
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
// 🚀 REST API ENDPOINTS & ANTI-SLEEP ROUTE
// ==========================================

// [Anti-Sleep Layer 1] Endpoint ความเร็วสูงสำหรับรับสัญญาณปลุกเซิร์ฟเวอร์ (Keep-Alive Ping)
app.get('/api/ping', (req, res) => {
  res.status(200).json({
    status: 'awake',
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: Date.now()
  });
});

// ตรวจสอบสถานะระบบและฐานข้อมูล
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    connected: isConnected,
    error: isConnected ? null : (lastDbError || 'กำลังเชื่อมต่อ...'),
    thaiDate: formatDate(getThaiDateObj())
  });
});

app.get('/api/pma-master', (req, res) => {
  res.json(PMA_MASTER_LIST);
});

// 1. ตรวจสอบการล็อกอินด้วย PIN
app.post('/api/auth/login', (req, res) => {
  const { email, pin } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();
  const account = STORE_ACCOUNTS[cleanEmail];

  if (!account) {
    return res.status(401).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้งาน' });
  }
  if (account.pin !== String(pin || '').trim()) {
    return res.status(401).json({ success: false, message: 'รหัส PIN ไม่ถูกต้อง' });
  }

  res.json({
    success: true,
    user: {
      email: account.email,
      role: account.role,
      title: account.title
    }
  });
});

// 2. ค้นหารหัสสินค้าเดิมจากบาร์โค้ด (Auto-Lookup)
app.get('/api/products/lookup/:barcode', async (req, res) => {
  try {
    const barcode = String(req.params.barcode || '').trim();
    const existing = await Product.findOne({ id: barcode }).sort({ createdAt: -1 }).lean();

    if (!existing) {
      return res.json({ found: false });
    }

    const code = existing.pmaCode || extractPmaCode(existing.category);
    res.json({
      found: true,
      product: {
        id: existing.id,
        name: existing.name,
        price: existing.price,
        pl: existing.pl,
        pmaCode: code,
        category: resolvePmaLabel(code)
      }
    });
  } catch (error) {
    res.status(500).json({ found: false, message: error.message });
  }
});

// 3. บันทึกรับสินค้าเข้า
app.post('/api/products', async (req, res) => {
  try {
    const { id, pma, name, price, qty, mfg, exp, pl, userEmail } = req.body;
    const expFormatted = formatDate(exp);
    const mfgFormatted = formatDate(mfg);
    const code = extractPmaCode(pma) || extractPmaCode(pl) || '00';
    const fullCategory = resolvePmaLabel(code);

    const newProduct = new Product({
      id: String(id).trim(),
      pmaCode: code,
      category: fullCategory,
      name: String(name).trim(),
      price: Number(price),
      inventory: Number(qty),
      mfgDate: mfgFormatted,
      expDate: expFormatted,
      expDateObj: new Date(expFormatted).getTime(),
      status: 'Pending',
      actionDate: '',
      pl: pl ? String(pl).trim().toUpperCase() : '-',
      createdBy: userEmail || 'test@store'
    });

    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. ดึงหมวดหมู่ PMA ทั้งหมดพร้อมจำนวนสินค้าคงเหลือ
app.get('/api/categories', async (req, res) => {
  try {
    const counts = await Product.aggregate([
      {
        $group: {
          _id: '$pmaCode',
          totalCount: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $ne: ['$status', 'Managed'] }, 1, 0] }
          }
        }
      }
    ]);

    const countMap = new Map(counts.map(c => [c._id, c]));

    const fullDirectory = PMA_MASTER_LIST.map(pma => {
      const stat = countMap.get(pma.code) || { totalCount: 0, pendingCount: 0 };
      return {
        code: pma.code,
        name: pma.name,
        fullLabel: `${pma.code} - ${pma.name}`,
        totalCount: stat.totalCount,
        pendingCount: stat.pendingCount
      };
    });

    res.json(fullDirectory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. ดึงรายการสินค้าตามรหัสหมวดหมู่ PMA
app.get('/api/products/category/:code', async (req, res) => {
  try {
    const code = extractPmaCode(req.params.code) || req.params.code;
    const products = await Product.find({
      $or: [
        { pmaCode: code },
        { category: { $regex: `^(PMA\\s*)?${code}\\b`, $options: 'i' } }
      ]
    }).sort({ expDateObj: 1 }).lean();

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. แก้ไขข้อมูลสินค้าสำหรับ Admin
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, name, pmaCode, pl, price, inventory, mfgDate, expDate, status } = req.body;

    if (role !== 'admin') {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์แก้ไขข้อมูล' });
    }

    const code = extractPmaCode(pmaCode) || '00';
    const expFormatted = formatDate(expDate);
    const mfgFormatted = formatDate(mfgDate);

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name: String(name).trim(),
          pmaCode: code,
          category: resolvePmaLabel(code),
          pl: String(pl || '-').trim().toUpperCase(),
          price: Number(price),
          inventory: Number(inventory),
          mfgDate: mfgFormatted,
          expDate: expFormatted,
          expDateObj: new Date(expFormatted).getTime(),
          status: status || 'Pending'
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลสินค้า' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. ลบรายการสินค้าสำหรับ Admin
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.headers['x-user-role'];

    if (role !== 'admin') {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ลบข้อมูล' });
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. ดึงประวัติการจัดการสินค้า
app.get('/api/products/history', async (req, res) => {
  try {
    const history = await Product.find({ status: 'Managed' }).sort({ updatedAt: -1 }).lean();
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 9. ดึงรายการสินค้าหมดอายุวันพรุ่งนี้
app.get('/api/notifications/tomorrow', async (req, res) => {
  try {
    const todayThai = getThaiDateObj();
    const tomorrowThai = new Date(todayThai);
    tomorrowThai.setDate(todayThai.getDate() + 1);
    const targetStr = formatDate(tomorrowThai);

    const items = await Product.find({
      expDate: targetStr,
      status: { $ne: 'Managed' }
    }).sort({ pmaCode: 1 }).lean();

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 10. ดึงรายการสินค้าหมดอายุเดือนหน้า
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
    }).sort({ pmaCode: 1, expDateObj: 1 }).lean();

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 11. บันทึกสถานะตรวจสอบแล้ว (Managed)
app.patch('/api/products/:identifier/manage', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { userEmail } = req.body || {};
    const todayStr = formatDate(getThaiDateObj());

    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { id: identifier, status: { $ne: 'Managed' } };

    const updated = await Product.findOneAndUpdate(
      query,
      {
        $set: {
          status: 'Managed',
          actionDate: todayStr,
          managedBy: userEmail || 'test@store'
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายการสินค้า' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- [8] Anti-Sleep Layer 2: ระบบปลุกเซิร์ฟเวอร์อัตโนมัติ (Self-Ping Engine) ---
function startKeepAliveEngine() {
  // Render จะสร้างตัวแปร RENDER_EXTERNAL_URL (เช่น https://qa-support-store.onrender.com) ให้อัตโนมัติ
  const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;

  if (!externalUrl) {
    console.log('ℹ️ Keep-Alive Engine: Running in Local Mode (No external URL needed)');
    return;
  }

  const pingTarget = `${externalUrl.replace(/\/$/, '')}/api/ping`;
  const INTERVAL_MS = 10 * 60 * 1000; // ยิงปลุกทุกๆ 10 นาที (ก่อนครบกำหนดหลับ 15 นาทีของ Render)

  console.log(`⚡ Keep-Alive Engine Activated: Pinging ${pingTarget} every 10 minutes`);

  setInterval(async () => {
    try {
      const response = await fetch(pingTarget);
      if (response.ok) {
        console.log(`💓 [Keep-Alive] Ping success (${response.status}) at ${new Date().toISOString()}`);
      }
    } catch (err) {
      console.warn(`⚠️ [Keep-Alive] Ping warning:`, err.message);
    }
  }, INTERVAL_MS);
}

app.listen(PORT, () => {
  console.log(`🚀 QA-Support Store V5.2 (Always-Awake) running on port ${PORT}`);
  startKeepAliveEngine();
});