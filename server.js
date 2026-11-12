/**
 * 🚀 Rocket Coding - QA-Support Store V5.0 (Enterprise Store Edition)
 * Backend Server: Node.js + Express + MongoDB (Mongoose)
 * Features: PIN Auth (Staff/Admin), 92 PMA Master Categories, Smart Barcode Auto-Lookup, Deep Edit
 */

require('dotenv').config();
const dns = require('dns');

// --- [1] Smart DNS Configuration ---
// หากรันบนเครื่องตัวเอง (Localhost) ให้ใช้ Google/Cloudflare DNS เพื่อทะลวง Router ที่บล็อก SRV
// หากรันบน Render Cloud ให้ใช้ระบบ DNS ภายในของ Data Center โดยตรง
if (!process.env.RENDER) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {
    console.warn('⚠️ DNS Override skipped:', e.message);
  }
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

// --- [3] ฐานข้อมูลหมวดหมู่ PMA ฉบับสมบูรณ์ตามอ้างอิง (92 รายการ) ---
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

// สร้าง Map สำหรับค้นหาชื่อ PMA จากรหัส 2 หลักได้ใน O(1)
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

// --- [4] บัญชีผู้ใช้งานและรหัส PIN ทดลอง ---
const STORE_ACCOUNTS = {
  'test@store': {
    email: 'test@store',
    pin: '000000',
    role: 'staff',
    title: 'พนักงานร้านค้า (Store Staff)'
  },
  'admin@store': {
    email: 'admin@store',
    pin: '000000',
    role: 'admin',
    title: 'ผู้จัดการระบบ (Store Admin)'
  }
};

// --- [5] ระบบเชื่อมต่อ MongoDB Atlas ---
const MONGODB_URI = process.env.MONGODB_URI;
let lastDbError = null;

async function connectDatabase() {
  if (!MONGODB_URI) {
    lastDbError = 'ยังไม่ได้ตั้งค่า MONGODB_URI ใน Environment Variables';
    console.error('❌ ERROR:', lastDbError);
    return;
  }
  try {
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

// --- [6] โครงสร้างตารางสินค้า (Mongoose Schema) ---
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true, index: true }, // รหัสบาร์โค้ดสินค้า
  pmaCode: { type: String, required: true, trim: true, index: true }, // รหัส PMA 2 หลัก เช่น "40"
  category: { type: String, required: true, trim: true },        // ชื่อเต็มเช่น "40 - CONFECTIONERY"
  name: { type: String, required: true, trim: true },            // ชื่อสินค้า
  price: { type: Number, required: true, default: 0 },           // ราคา
  inventory: { type: Number, required: true, default: 0 },       // จำนวนคงเหลือ
  mfgDate: { type: String, required: true },                     // วันผลิต (YYYY-MM-DD)
  expDate: { type: String, required: true },                     // วันหมดอายุ (YYYY-MM-DD)
  expDateObj: { type: Number, required: true },                  // Timestamp สำหรับเรียงลำดับ
  status: { type: String, enum: ['Pending', 'Managed'], default: 'Pending' },
  actionDate: { type: String, default: '' },
  pl: { type: String, default: '-' },                            // ตำแหน่ง Planogram
  createdBy: { type: String, default: 'system' },                // ผู้รับสินค้าเข้า
  managedBy: { type: String, default: '' }                       // ผู้กดตรวจสอบจัดการ
}, { timestamps: true });

productSchema.index({ pmaCode: 1, expDateObj: 1 });
productSchema.index({ status: 1, expDate: 1 });

const Product = mongoose.model('Product', productSchema);

// --- [7] Helper Functions (เวลาประเทศไทย UTC+7) ---
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
// 🚀 REST API ENDPOINTS (V5.0)
// ==========================================

// 0. Health Check & Master PMA List
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    connected: isConnected,
    error: isConnected ? null : (lastDbError || 'กำลังเชื่อมต่อฐานข้อมูล...'),
    thaiDate: formatDate(getThaiDateObj())
  });
});

app.get('/api/pma-master', (req, res) => {
  res.json(PMA_MASTER_LIST);
});

// 1. ระบบตรวจสอบ PIN Login (Authentication)
app.post('/api/auth/login', (req, res) => {
  const { email, pin } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();
  const account = STORE_ACCOUNTS[cleanEmail];

  if (!account) {
    return res.status(401).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ (ใช้ test@store หรือ admin@store)' });
  }
  if (account.pin !== String(pin || '').trim()) {
    return res.status(401).json({ success: false, message: 'รหัส PIN ไม่ถูกต้อง (รหัสทดลองคือ 000000)' });
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

// 2. ค้นหาข้อมูลสินค้าจากรหัสบาร์โค้ด (Smart Barcode Auto-Lookup สำหรับหน้า Inbound)
app.get('/api/products/lookup/:barcode', async (req, res) => {
  try {
    const barcode = String(req.params.barcode || '').trim();
    // ค้นหารายการล่าสุดที่เคยบันทึกด้วยบาร์โค้ดนี้
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

// 3. รับสินค้าเข้าใหม่ (Inbound Product Save)
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

// 4. ดึงหมวดหมู่ PMA ทั้งหมดพร้อมนับจำนวนสินค้าจริงในแต่ละหมวดหมู่
app.get('/api/categories', async (req, res) => {
  try {
    // นับจำนวนสินค้าแยกตาม pmaCode จาก MongoDB
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

    // ผสานข้อมูล PMA ทั้ง 92 รายการเข้ากับจำนวนสินค้าจริง
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

// 5. ดึงรายการสินค้าตามรหัส PMA (เรียงตามวันหมดอายุใกล้สุดขึ้นก่อน)
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

// 6. แก้ไขข้อมูลสินค้าเชิงลึก (สงวนสิทธิ์เฉพาะ admin@store)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, name, pmaCode, pl, price, inventory, mfgDate, expDate, status } = req.body;

    if (role !== 'admin') {
      return res.status(403).json({ success: false, message: 'ปฏิเสธการเข้าถึง: เฉพาะบัญชี admin@store เท่านั้นที่แก้ไขเชิงลึกได้' });
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
      return res.status(404).json({ success: false, message: 'ไม่พบสินค้าที่ต้องการแก้ไข' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. ลบรายการสินค้า (สงวนสิทธิ์เฉพาะ admin@store)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.headers['x-user-role'];

    if (role !== 'admin') {
      return res.status(403).json({ success: false, message: 'ปฏิเสธการเข้าถึง: เฉพาะ admin@store เท่านั้นที่ลบสินค้าได้' });
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. ดึงประวัติสินค้าที่จัดการแล้ว (Managed History)
app.get('/api/products/history', async (req, res) => {
  try {
    const history = await Product.find({ status: 'Managed' }).sort({ updatedAt: -1 }).lean();
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 9. แจ้งเตือนสินค้าหมดอายุพรุ่งนี้
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

// 10. แจ้งเตือนสินค้าหมดอายุเดือนหน้า จัดกลุ่มตาม PMA
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

// 11. กดยืนยันการจัดการสินค้า (Mark as Managed)
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
      return res.status(404).json({ success: false, message: 'ไม่พบรายการสินค้านี้' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 12. สร้างข้อมูลทดสอบ 50 รายการ โดยใช้รหัส PMA จริงจากอ้างอิง
app.post('/api/seed', async (req, res) => {
  try {
    await Product.deleteMany({});

    const samplePmas = [
      { code: '01', sample: 'ขนมปังไส้ครีม' },
      { code: '16', sample: 'สลัดอกไก่พริกไทยดำ' },
      { code: '19', sample: 'ข้าวผัดปูกล่องแช่เย็น' },
      { code: '29', sample: 'นม UHT รสจืด 225ml' },
      { code: '30', sample: 'นมพาสเจอร์ไรส์ 400ml' },
      { code: '40', sample: 'ช็อกโกแลตอัลมอนด์' },
      { code: '41', sample: 'มันฝรั่งทอดกรอบรสโนริสาหร่าย' },
      { code: '42', sample: 'น้ำอัดลมโคล่า 325ml' },
      { code: '49', sample: 'เครื่องดื่มเกลือแร่' },
      { code: '60', sample: 'เค้กกล้วยหอมแพ็คคู่' }
    ];

    const baseDate = getThaiDateObj();
    const mockData = [];

    for (let i = 1; i <= 50; i++) {
      const picked = samplePmas[i % samplePmas.length];
      const plCode = `${picked.code}-${String.fromCharCode(65 + (i % 6))}-0${(i % 9) + 1}`;
      const expOffset = i <= 5 ? 1 : Math.floor(Math.random() * 60) - 3;
      const expDate = new Date(baseDate);
      expDate.setDate(baseDate.getDate() + expOffset);

      const mfgDate = new Date(expDate);
      mfgDate.setMonth(mfgDate.getMonth() - 3);
      const expStr = formatDate(expDate);

      // สร้างบาร์โค้ดซ้ำกันบางรายการเพื่อทดสอบระบบ Smart Auto-Lookup ได้ทันที!
      const barcodeId = `8851000000${String((i % 15) + 1).padStart(3, '0')}`;

      mockData.push({
        id: barcodeId,
        pmaCode: picked.code,
        category: resolvePmaLabel(picked.code),
        name: `${picked.sample} รุ่น #${(i % 15) + 1}`,
        price: ((i % 8) + 2) * 5,
        inventory: Math.floor(Math.random() * 35) + 5,
        mfgDate: formatDate(mfgDate),
        expDate: expStr,
        expDateObj: new Date(expStr).getTime(),
        status: 'Pending',
        actionDate: '',
        pl: plCode,
        createdBy: 'admin@store'
      });
    }

    await Product.insertMany(mockData);
    res.json({ success: true, count: mockData.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 QA-Support Store V5.0 Enterprise Edition is running on port ${PORT}`);
});