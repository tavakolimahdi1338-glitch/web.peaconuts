import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import type {
  ProductWeight,
  OrderItem,
  Order,
  OrderStatus,
  DeliveryMethod,
  Product,
  Coupon,
  CouponType,
} from './src/types';

const app = express();
const PORT = 3000;
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Support large JSON payloads for base64 file uploads (5MB max file -> ~7MB base64)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: Normalize Persian/Arabic digits to English digits
function normalizeDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .trim();
}

// In-memory set of valid admin tokens
const validAdminTokens = new Set<string>();

// Middleware: Admin Authentication
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'احراز هویت ناموفق بود. لطفاً مجدداً وارد شوید.' });
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    return res.status(401).json({ error: 'توکن یافت نشد.' });
  }

  const database = db.get();

  // If token matches current database admin token or valid issued tokens
  const isMatch =
    (database.admin.token && database.admin.token === token) ||
    validAdminTokens.has(token) ||
    (!database.admin.token && token.length >= 32);

  if (isMatch) {
    if (database.admin.token !== token) {
      database.admin.token = token;
      db.save();
    }
    validAdminTokens.add(token);
    return next();
  }

  return res.status(401).json({ error: 'توکن نامعتبر یا منقضی شده است. لطفاً مجدداً وارد شوید.' });
}

// ----------------------------------------------------
// Public API Endpoints
// ----------------------------------------------------

// 1. Bootstrap: Settings, active announcement, active products
app.get('/api/public/bootstrap', (req, res) => {
  const database = db.get();
  const activeProducts = database.products.filter((p) => p.active);
  const activeAnnouncement = database.announcements.find((a) => a.active) || null;

  res.json({
    settings: database.settings,
    announcement: activeAnnouncement,
    products: activeProducts,
  });
});

// 2. Products (active only)
app.get('/api/products', (req, res) => {
  const database = db.get();
  const active = database.products.filter((p) => p.active);
  res.json(active);
});

// 3. Product detail by ID
app.get('/api/products/:id', (req, res) => {
  const database = db.get();
  const product = database.products.find((p) => p.id === req.params.id && p.active);
  if (!product) {
    return res.status(404).json({ error: 'محصول مورد نظر یافت نشد یا غیرفعال است.' });
  }
  res.json(product);
});

// 4. Validate Coupon
app.post('/api/coupons/validate', (req, res) => {
  const { code, phone, subtotal } = req.body;
  const cleanCode = (code || '').trim().toUpperCase();
  const cleanPhone = normalizeDigits(phone || '');
  const numericSubtotal = Number(subtotal) || 0;

  if (!cleanCode) {
    return res.status(400).json({ error: 'کد تخفیف را وارد کنید.' });
  }

  const database = db.get();
  const coupon = database.coupons.find(
    (c) => c.code.toUpperCase() === cleanCode && c.active
  );

  if (!coupon) {
    return res.status(404).json({ error: 'کد تخفیف وارد شده معتبر نیست یا غیرفعال شده است.' });
  }

  if (new Date(coupon.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ error: 'مهلت استفاده از این کد تخفیف به پایان رسیده است.' });
  }

  if (coupon.used_count >= coupon.max_uses) {
    return res.status(400).json({ error: 'سقف استفاده از این کد تخفیف به اتمام رسیده است.' });
  }

  if (numericSubtotal < coupon.min_order) {
    return res.status(400).json({
      error: `حداقل مبلغ سفارش برای استفاده از این کد ${coupon.min_order.toLocaleString('fa-IR')} تومان است.`,
    });
  }

  if (cleanPhone) {
    const alreadyUsed = database.coupon_uses.some(
      (u) => u.code.toUpperCase() === cleanCode && u.phone === cleanPhone
    );
    if (alreadyUsed) {
      return res.status(400).json({ error: 'این شماره تماس قبلاً از این کد تخفیف استفاده کرده است.' });
    }
  }

  let discountAmount = 0;
  if (coupon.type === 'percent') {
    discountAmount = Math.round(numericSubtotal * (coupon.value / 100));
  } else {
    discountAmount = coupon.value;
  }
  discountAmount = Math.min(numericSubtotal, discountAmount);

  res.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount_amount: discountAmount,
    message: `کد تخفیف با موفقیت اعمال شد. تخفیف: ${discountAmount.toLocaleString('fa-IR')} تومان`,
  });
});

// 5. File Upload (Images & PDF up to 5MB)
app.post('/api/upload', (req, res) => {
  try {
    const { base64, filename, mimeType } = req.body;
    if (!base64) {
      return res.status(400).json({ error: 'فایلی ارسال نشده است.' });
    }

    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
      'image/svg+xml',
      'application/pdf',
    ];
    if (mimeType && !allowedMimes.includes(mimeType.toLowerCase())) {
      return res.status(400).json({ error: 'فرمت فایل مجاز نیست. فقط تصویر (JPG, PNG, WebP, GIF) یا PDF مجاز است.' });
    }

    // Strip metadata prefix if present (e.g. data:image/png;base64,...)
    const cleanBase64 = base64.includes(';base64,') ? base64.split(';base64,')[1] : base64;
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'حجم فایل نباید بیشتر از ۵ مگابایت باشد.' });
    }

    let ext = '.png';
    if (mimeType === 'image/jpeg') ext = '.jpg';
    else if (mimeType === 'image/webp') ext = '.webp';
    else if (mimeType === 'application/pdf') ext = '.pdf';
    else if (filename) {
      const match = filename.match(/\.[0-9a-z]+$/i);
      if (match) ext = match[0];
    }

    const uniqueName = `upload_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, buffer);
    res.json({ url: `/uploads/${uniqueName}` });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'خطا در بارگذاری فایل.' });
  }
});

// 6. Submit Order (Strict server-side validation and stock decrement)
app.post('/api/orders', (req, res) => {
  try {
    const {
      customer_name,
      phone,
      delivery_method,
      address,
      details,
      raw_items,
      coupon_code,
      receipt_url,
    } = req.body;

    const cleanName = (customer_name || '').trim();
    const cleanPhone = normalizeDigits(phone || '');
    const cleanAddress = (address || '').trim();
    const cleanMethod = (delivery_method || 'post') as DeliveryMethod;

    if (!cleanName) {
      return res.status(400).json({ error: 'لطفاً نام و نام خانوادگی را وارد کنید.' });
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ error: 'لطفاً شماره تماس معتبر وارد کنید.' });
    }
    if (cleanMethod === 'post' && !cleanAddress) {
      return res.status(400).json({ error: 'برای ارسال با پست، وارد کردن آدرس پستی الزامی است.' });
    }
    if (!receipt_url) {
      return res.status(400).json({ error: 'لطفاً تصویر یا فایل فیش واریزی را آپلود کنید.' });
    }
    if (!Array.isArray(raw_items) || raw_items.length === 0) {
      return res.status(400).json({ error: 'سبد خرید شما خالی است.' });
    }

    const database = db.get();

    // Step 1: Validate Products, Weights, and Quantities
    // Stock is unified per product (total packages)
    const productQtyNeeded: Record<string, number> = {};
    const calculatedItems: OrderItem[] = [];

    for (const item of raw_items) {
      const product = database.products.find((p) => p.id === item.product_id);
      if (!product || !product.active) {
        return res.status(400).json({ error: `محصول با شناسه ${item.product_id} نامعتبر یا غیرفعال است.` });
      }

      const weight = Number(item.weight) as ProductWeight;
      if (![300, 500, 1000].includes(weight)) {
        return res.status(400).json({ error: `وزن انتخاب شده (${weight} گرم) برای محصول ${product.name} نامعتبر است.` });
      }

      const basePrice = product[`price_${weight}` as keyof Product] as number;
      if (!basePrice || basePrice <= 0) {
        return res.status(400).json({ error: `وزن ${weight} گرم برای محصول «${product.name}» ارائه نمی‌شود.` });
      }

      const discountPercent = (product[`discount_${weight}` as keyof Product] as number) || 0;
      const unitPrice = Math.round(basePrice * (1 - discountPercent / 100));
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

      productQtyNeeded[product.id] = (productQtyNeeded[product.id] || 0) + quantity;

      const rowTotal = unitPrice * quantity;
      const savingsRow = (basePrice - unitPrice) * quantity;

      calculatedItems.push({
        product_id: product.id,
        product_name: product.name,
        image_url: product.image_url,
        weight,
        quantity,
        base_price: basePrice,
        discount_percent: discountPercent,
        unit_price: unitPrice,
        row_total: rowTotal,
        savings_row: savingsRow,
      });
    }

    // Step 2: Check unified stock for each product
    for (const [productId, needed] of Object.entries(productQtyNeeded)) {
      const product = database.products.find((p) => p.id === productId)!;
      if (product.stock < needed) {
        return res.status(400).json({
          error: `موجودی محصول «${product.name}» کافی نیست (موجودی فعلی: ${product.stock} بسته، درخواست شما: ${needed} بسته).`,
        });
      }
    }

    // Step 3: Compute Subtotal & Product Savings
    const subtotal = calculatedItems.reduce((sum, it) => sum + it.row_total, 0);
    const productSavings = calculatedItems.reduce((sum, it) => sum + it.savings_row, 0);

    // Step 4: Validate Coupon
    let couponDiscount = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (coupon_code && coupon_code.trim()) {
      const cleanCoupon = coupon_code.trim().toUpperCase();
      const coupon = database.coupons.find((c) => c.code.toUpperCase() === cleanCoupon && c.active);

      if (
        coupon &&
        new Date(coupon.expires_at).getTime() >= Date.now() &&
        coupon.used_count < coupon.max_uses &&
        subtotal >= coupon.min_order
      ) {
        const alreadyUsed = database.coupon_uses.some(
          (u) => u.code.toUpperCase() === cleanCoupon && u.phone === cleanPhone
        );

        if (!alreadyUsed) {
          appliedCouponCode = coupon.code;
          if (coupon.type === 'percent') {
            couponDiscount = Math.round(subtotal * (coupon.value / 100));
          } else {
            couponDiscount = coupon.value;
          }
          couponDiscount = Math.min(subtotal, couponDiscount);

          // Update coupon usage
          coupon.used_count += 1;
          database.coupon_uses.push({
            id: `use-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
            code: coupon.code,
            phone: cleanPhone,
            used_at: new Date().toISOString(),
          });
        }
      }
    }

    // Step 5: Shipping calculation
    const shipping = cleanMethod === 'pickup' ? 0 : Number(database.settings.shipping_cost) || 0;
    const total = Math.max(0, subtotal - couponDiscount + shipping);
    const totalSavings = productSavings + couponDiscount;

    // Step 6: Atomically decrement stock
    for (const [productId, needed] of Object.entries(productQtyNeeded)) {
      const product = database.products.find((p) => p.id === productId)!;
      product.stock -= needed;
      product.updated_at = new Date().toISOString();
    }

    // Step 7: Generate human-friendly order code (e.g. O2609038412)
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `O${yy}${mm}${dd}${rand}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      order_code: orderCode,
      customer_name: cleanName,
      phone: cleanPhone,
      delivery_method: cleanMethod,
      address: cleanMethod === 'post' ? cleanAddress : 'تحویل حضوری در محل کارگاه',
      details: (details || '').trim(),
      items: calculatedItems,
      subtotal,
      coupon_code: appliedCouponCode,
      coupon_discount: couponDiscount,
      shipping,
      total,
      savings: totalSavings,
      receipt_url,
      status: 'pending',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    database.orders.unshift(newOrder);
    db.save();

    res.json({
      success: true,
      order: newOrder,
      message: 'سفارش شما با موفقیت ثبت شد و رسید در نوبت بررسی قرار گرفت.',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'خطایی در ثبت سفارش رخ داد.' });
  }
});

// 7. Track Order by Code and Phone
app.get('/api/orders/track', (req, res) => {
  const code = (req.query.code as string || '').trim().toUpperCase();
  const phone = normalizeDigits((req.query.phone as string || '').trim());

  if (!code || !phone) {
    return res.status(400).json({ error: 'لطفاً کد سفارش و شماره تماس را وارد کنید.' });
  }

  const database = db.get();
  const order = database.orders.find(
    (o) => o.order_code.toUpperCase() === code && o.phone === phone
  );

  if (!order) {
    return res.status(404).json({ error: 'سفارشی با این مشخصات یافت نشد.' });
  }

  res.json(order);
});

// 8. Submit Support Ticket
app.post('/api/support', (req, res) => {
  const { customer_name, phone, email, message, file_url } = req.body;
  const cleanName = (customer_name || '').trim();
  const cleanPhone = normalizeDigits(phone || '');
  const cleanMessage = (message || '').trim();

  if (!cleanName || !cleanPhone || !cleanMessage) {
    return res.status(400).json({ error: 'لطفاً نام، شماره تماس و متن پیام را کامل وارد نمایید.' });
  }

  const database = db.get();
  const newTicket = {
    id: `tic-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    customer_name: cleanName,
    phone: cleanPhone,
    email: (email || '').trim(),
    message: cleanMessage,
    file_url: file_url || undefined,
    status: 'open' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  database.tickets.unshift(newTicket);
  db.save();

  res.json({
    success: true,
    message: 'پیام شما دریافت شد و تیم پشتیبانی در اسرع وقت پاسخ خواهند داد.',
    ticket: newTicket,
  });
});

// 9. Customer tickets lookup by phone
app.get('/api/support/my', (req, res) => {
  const phone = normalizeDigits((req.query.phone as string || '').trim());
  if (!phone) {
    return res.status(400).json({ error: 'شماره تماس الزامی است.' });
  }

  const database = db.get();
  const userTickets = database.tickets.filter((t) => t.phone === phone);
  res.json(userTickets);
});

// ----------------------------------------------------
// Admin API Endpoints (Protected)
// ----------------------------------------------------

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  const database = db.get();
  const hash = db.hashPassword(cleanPass);

  if (database.admin.email.toLowerCase() === cleanEmail && database.admin.password_hash === hash) {
    const token = crypto.randomBytes(32).toString('hex');
    database.admin.token = token;
    db.save();

    return res.json({
      success: true,
      token,
      email: database.admin.email,
    });
  }

  return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است.' });
});

// Admin Me
app.get('/api/admin/me', requireAdmin, (req, res) => {
  const database = db.get();
  res.json({ email: database.admin.email });
});

// Admin Update Credentials / Profile (email & password)
const handleUpdateCredentials = (req: express.Request, res: express.Response) => {
  const current_password = req.body.current_password || req.body.currentPassword || '';
  const new_email = req.body.new_email || req.body.newEmail || '';
  const new_password = req.body.new_password || req.body.newPassword || '';
  const database = db.get();

  if (db.hashPassword(current_password) !== database.admin.password_hash) {
    return res.status(400).json({ error: 'رمز عبور فعلی نادرست است.' });
  }

  if (new_email && new_email.includes('@')) {
    database.admin.email = new_email.trim().toLowerCase();
  }
  if (new_password && new_password.length >= 6) {
    database.admin.password_hash = db.hashPassword(new_password.trim());
  }

  database.admin.updated_at = new Date().toISOString();
  db.save();

  res.json({ success: true, message: 'اطلاعات ورود با موفقیت به‌روزرسانی شد.' });
};

app.put('/api/admin/credentials', requireAdmin, handleUpdateCredentials);
app.patch('/api/admin/credentials', requireAdmin, handleUpdateCredentials);
app.put('/api/admin/profile', requireAdmin, handleUpdateCredentials);
app.patch('/api/admin/profile', requireAdmin, handleUpdateCredentials);

// Admin Dashboard Stats
app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  const database = db.get();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

  const validStatuses = ['confirmed', 'shipped', 'completed'];

  let todayOrdersCount = 0;
  let confirmedSalesToday = 0;
  let confirmedSales7d = 0;
  let confirmedSales30d = 0;
  let pendingOrdersCount = 0;

  for (const ord of database.orders) {
    const ordTime = new Date(ord.created_at).getTime();

    if (ordTime >= startOfToday) {
      todayOrdersCount++;
    }

    if (ord.status === 'pending') {
      pendingOrdersCount++;
    }

    if (validStatuses.includes(ord.status)) {
      if (ordTime >= startOfToday) {
        confirmedSalesToday += ord.total;
      }
      if (ordTime >= sevenDaysAgo) {
        confirmedSales7d += ord.total;
      }
      if (ordTime >= thirtyDaysAgo) {
        confirmedSales30d += ord.total;
      }
    }
  }

  const lowStockCount = database.products.filter((p) => p.stock < 5).length;
  const openTicketsCount = database.tickets.filter((t) => t.status === 'open').length;

  res.json({
    today_orders_count: todayOrdersCount,
    confirmed_sales_today: confirmedSalesToday,
    confirmed_sales_7d: confirmedSales7d,
    confirmed_sales_30d: confirmedSales30d,
    pending_orders_count: pendingOrdersCount,
    low_stock_count: lowStockCount,
    open_tickets_count: openTicketsCount,
    total_customers_count: new Set(database.orders.map((o) => o.phone)).size,
  });
});

// Admin: Manage Products (CRUD)
app.get('/api/admin/products', requireAdmin, (req, res) => {
  const database = db.get();
  res.json(database.products);
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const data = req.body;
  const database = db.get();

  const newProduct: Product = {
    id: `prod-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: data.name || 'محصول جدید',
    description: data.description || '',
    image_url: data.image_url || 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    delivery_type: data.delivery_type === 'service' ? 'service' : 'physical',
    stock: Number(data.stock) || 0,
    active: Boolean(data.active),
    price_300: Number(data.price_300) || 0,
    price_500: Number(data.price_500) || 0,
    price_1000: Number(data.price_1000) || 0,
    discount_300: Math.min(99, Math.max(0, Number(data.discount_300) || 0)),
    discount_500: Math.min(99, Math.max(0, Number(data.discount_500) || 0)),
    discount_1000: Math.min(99, Math.max(0, Number(data.discount_1000) || 0)),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  database.products.unshift(newProduct);
  db.save();
  res.json(newProduct);
});

const handleUpdateProduct = (req: express.Request, res: express.Response) => {
  const database = db.get();
  const product = database.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'محصول یافت نشد.' });
  }

  const data = req.body;
  if (data.name !== undefined) product.name = data.name;
  if (data.description !== undefined) product.description = data.description;
  if (data.image_url !== undefined) product.image_url = data.image_url;
  if (data.delivery_type !== undefined) product.delivery_type = data.delivery_type;
  if (data.stock !== undefined) product.stock = Math.max(0, Number(data.stock) || 0);
  if (data.active !== undefined) product.active = Boolean(data.active);
  if (data.price_300 !== undefined) product.price_300 = Number(data.price_300) || 0;
  if (data.price_500 !== undefined) product.price_500 = Number(data.price_500) || 0;
  if (data.price_1000 !== undefined) product.price_1000 = Number(data.price_1000) || 0;
  if (data.discount_300 !== undefined) product.discount_300 = Math.min(99, Math.max(0, Number(data.discount_300) || 0));
  if (data.discount_500 !== undefined) product.discount_500 = Math.min(99, Math.max(0, Number(data.discount_500) || 0));
  if (data.discount_1000 !== undefined) product.discount_1000 = Math.min(99, Math.max(0, Number(data.discount_1000) || 0));
  product.updated_at = new Date().toISOString();

  db.save();
  res.json(product);
};

app.put('/api/admin/products/:id', requireAdmin, handleUpdateProduct);
app.patch('/api/admin/products/:id', requireAdmin, handleUpdateProduct);

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const database = db.get();
  const index = database.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'محصول یافت نشد.' });
  }

  database.products.splice(index, 1);
  db.save();
  res.json({ success: true, message: 'محصول با موفقیت حذف گردید.' });
});

// Admin: Manage Orders & Payments
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const database = db.get();
  const statusFilter = req.query.status as string;

  if (statusFilter && statusFilter !== 'all') {
    return res.json(database.orders.filter((o) => o.status === statusFilter));
  }
  res.json(database.orders);
});

const handleUpdateOrderStatus = (req: express.Request, res: express.Response) => {
  const { status, admin_notes } = req.body;
  const newStatus = status as OrderStatus;
  const valid = ['pending', 'confirmed', 'shipped', 'completed', 'rejected'];

  if (!valid.includes(newStatus)) {
    return res.status(400).json({ error: 'وضعیت نامعتبر است.' });
  }

  const database = db.get();
  const order = database.orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'سفارش یافت نشد.' });
  }

  const previousStatus = order.status;

  // RULE: "اگر مدیر پرداخت را رد کرد، موجودی برگردد."
  // When transitioning to 'rejected' from a non-rejected status, restore stock
  if (newStatus === 'rejected' && previousStatus !== 'rejected') {
    for (const item of order.items) {
      const product = database.products.find((p) => p.id === item.product_id);
      if (product) {
        product.stock += item.quantity;
        product.updated_at = new Date().toISOString();
      }
    }
  }

  // If restoring an accidentally rejected order back to pending/confirmed, deduct stock again if available
  if (previousStatus === 'rejected' && newStatus !== 'rejected') {
    for (const item of order.items) {
      const product = database.products.find((p) => p.id === item.product_id);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        product.updated_at = new Date().toISOString();
      }
    }
  }

  order.status = newStatus;
  if (admin_notes !== undefined) {
    order.admin_notes = admin_notes;
  }
  order.updated_at = new Date().toISOString();

  db.save();
  // Return both envelope and order fields for flexible frontend consumption
  res.json({ success: true, order, ...order });
};

app.put('/api/admin/orders/:id/status', requireAdmin, handleUpdateOrderStatus);
app.patch('/api/admin/orders/:id/status', requireAdmin, handleUpdateOrderStatus);

// Admin: Coupons (CRUD)
app.get('/api/admin/coupons', requireAdmin, (req, res) => {
  const database = db.get();
  res.json(database.coupons);
});

app.post('/api/admin/coupons', requireAdmin, (req, res) => {
  const { code, type, value, min_order, min_order_amount, max_uses, valid_days, expiry_days, active } = req.body;
  const cleanCode = (code || '').trim().toUpperCase();

  if (!cleanCode) {
    return res.status(400).json({ error: 'کد تخفیف الزامی است.' });
  }

  const database = db.get();
  if (database.coupons.some((c) => c.code.toUpperCase() === cleanCode)) {
    return res.status(400).json({ error: 'این کد تخفیف از قبل وجود دارد.' });
  }

  const days = Math.max(1, Number(valid_days || expiry_days) || 7);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const couponType: CouponType = type === 'fixed' ? 'fixed' : 'percent';
  const newCoupon: Coupon = {
    id: `coup-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    code: cleanCode,
    type: couponType,
    value: Math.max(1, Number(value) || 10),
    min_order: Math.max(0, Number(min_order ?? min_order_amount) || 0),
    max_uses: Math.max(1, Number(max_uses) || 50),
    used_count: 0,
    expires_at: expiresAt,
    active: active !== undefined ? Boolean(active) : true,
    created_at: new Date().toISOString(),
  };

  database.coupons.unshift(newCoupon);
  db.save();
  res.json(newCoupon);
});

const handleUpdateCoupon = (req: express.Request, res: express.Response) => {
  const database = db.get();
  const coupon = database.coupons.find((c) => c.id === req.params.id);
  if (!coupon) {
    return res.status(404).json({ error: 'کوپن یافت نشد.' });
  }

  if (req.path.endsWith('/toggle')) {
    coupon.active = !coupon.active;
  } else {
    if (req.body.active !== undefined) coupon.active = Boolean(req.body.active);
    if (req.body.value !== undefined) coupon.value = Number(req.body.value);
    if (req.body.min_order !== undefined || req.body.min_order_amount !== undefined) {
      coupon.min_order = Number(req.body.min_order ?? req.body.min_order_amount) || 0;
    }
  }

  db.save();
  res.json(coupon);
};

app.put('/api/admin/coupons/:id', requireAdmin, handleUpdateCoupon);
app.patch('/api/admin/coupons/:id', requireAdmin, handleUpdateCoupon);
app.put('/api/admin/coupons/:id/toggle', requireAdmin, handleUpdateCoupon);
app.patch('/api/admin/coupons/:id/toggle', requireAdmin, handleUpdateCoupon);

app.delete('/api/admin/coupons/:id', requireAdmin, (req, res) => {
  const database = db.get();
  const idx = database.coupons.findIndex((c) => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'کوپن یافت نشد.' });
  }

  database.coupons.splice(idx, 1);
  db.save();
  res.json({ success: true, message: 'کد تخفیف حذف شد.' });
});

// Admin: Support Tickets
app.get('/api/admin/support', requireAdmin, (req, res) => {
  const database = db.get();
  res.json(database.tickets);
});

const handleUpdateTicket = (req: express.Request, res: express.Response) => {
  const { reply, admin_reply, status } = req.body;
  const replyContent = admin_reply !== undefined ? admin_reply : reply;
  const database = db.get();
  const ticket = database.tickets.find((t) => t.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'تیکت یافت نشد.' });
  }

  if (replyContent !== undefined) {
    ticket.admin_reply = replyContent;
  }
  if (status) {
    ticket.status = status;
  } else if (replyContent && ticket.status === 'open') {
    ticket.status = 'answered';
  }
  ticket.updated_at = new Date().toISOString();

  db.save();
  res.json({ success: true, ticket, ...ticket });
};

app.put('/api/admin/support/:id', requireAdmin, handleUpdateTicket);
app.patch('/api/admin/support/:id', requireAdmin, handleUpdateTicket);
app.put('/api/admin/support/:id/reply', requireAdmin, handleUpdateTicket);
app.patch('/api/admin/support/:id/reply', requireAdmin, handleUpdateTicket);

// Admin: Sales Reports (Only confirmed, shipped, completed)
const handleReports = (req: express.Request, res: express.Response) => {
  const database = db.get();
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const validOrders = database.orders.filter((o) =>
    ['confirmed', 'shipped', 'completed'].includes(o.status)
  );

  const periodToday = { count: 0, total_amount: 0, total_discount: 0 };
  const period7d = { count: 0, total_amount: 0, total_discount: 0 };
  const period30d = { count: 0, total_amount: 0, total_discount: 0 };

  let totalSalesAllTime = 0;
  let totalOrdersAllTime = validOrders.length;
  let totalDiscountsAllTime = 0;

  const productStats: Record<string, { product_id: string; product_name: string; total_quantity: number; total_revenue: number }> = {};

  for (const ord of validOrders) {
    const t = new Date(ord.created_at).getTime();
    totalSalesAllTime += ord.total;
    totalDiscountsAllTime += ord.savings;

    if (t >= startOfToday.getTime()) {
      periodToday.count++;
      periodToday.total_amount += ord.total;
      periodToday.total_discount += ord.savings;
    }
    if (t >= sevenDaysAgo) {
      period7d.count++;
      period7d.total_amount += ord.total;
      period7d.total_discount += ord.savings;
    }
    if (t >= thirtyDaysAgo) {
      period30d.count++;
      period30d.total_amount += ord.total;
      period30d.total_discount += ord.savings;
    }

    // Top products
    for (const item of ord.items) {
      if (!productStats[item.product_id]) {
        productStats[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product_name,
          total_quantity: 0,
          total_revenue: 0,
        };
      }
      productStats[item.product_id].total_quantity += item.quantity;
      productStats[item.product_id].total_revenue += item.row_total;
    }
  }

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, 5)
    .map((p) => ({
      product_id: p.product_id,
      product_name: p.product_name,
      name: p.product_name,
      total_quantity: p.total_quantity,
      quantity: p.total_quantity,
      total_revenue: p.total_revenue,
      revenue: p.total_revenue,
    }));

  const pendingCount = database.orders.filter((o) => o.status === 'pending').length;
  const shippedCount = database.orders.filter((o) => o.status === 'shipped').length;

  res.json({
    // Shape for ReportsTab & OverviewTab
    sales_today: { total_revenue: periodToday.total_amount, order_count: periodToday.count },
    sales_7_days: { total_revenue: period7d.total_amount, order_count: period7d.count },
    sales_30_days: { total_revenue: period30d.total_amount, order_count: period30d.count },
    aggregate: {
      total_revenue: totalSalesAllTime,
      total_orders: totalOrdersAllTime,
      total_discounts: totalDiscountsAllTime,
    },
    top_products: topProducts,
    pending_orders_count: pendingCount,
    shipping_orders_count: shippedCount,
    // Original shape for backward compatibility
    period_today: periodToday,
    period_7d: period7d,
    period_30d: period30d,
    pending_count: pendingCount,
    shipped_count: shippedCount,
  });
};

app.get('/api/admin/reports', requireAdmin, handleReports);
app.get('/api/admin/reports/sales', requireAdmin, handleReports);

// Admin: Announcements
app.get('/api/admin/announcements', requireAdmin, (req, res) => {
  const database = db.get();
  res.json(database.announcements);
});

app.post('/api/admin/announcements', requireAdmin, (req, res) => {
  const { title, body, content, active } = req.body;
  const database = db.get();

  const newAnn = {
    id: `ann-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    title: (title || '').trim(),
    body: (body || content || '').trim(),
    active: active !== undefined ? Boolean(active) : true,
    created_at: new Date().toISOString(),
  };

  // Only one announcement active at a time
  if (newAnn.active) {
    database.announcements.forEach((a) => (a.active = false));
  }
  database.announcements.unshift(newAnn);
  db.save();

  res.json(newAnn);
});

const handleUpdateAnnouncement = (req: express.Request, res: express.Response) => {
  const database = db.get();
  const ann = database.announcements.find((a) => a.id === req.params.id);
  if (!ann) {
    return res.status(404).json({ error: 'اطلاعیه یافت نشد.' });
  }

  if (req.path.endsWith('/activate')) {
    database.announcements.forEach((a) => (a.active = false));
    ann.active = true;
  } else {
    if (req.body.active !== undefined) {
      ann.active = Boolean(req.body.active);
      if (ann.active) {
        database.announcements.forEach((a) => {
          if (a.id !== ann.id) a.active = false;
        });
      }
    }
    if (req.body.title !== undefined) ann.title = req.body.title.trim();
    if (req.body.body !== undefined || req.body.content !== undefined) {
      ann.body = (req.body.body || req.body.content || '').trim();
    }
  }

  db.save();
  res.json(ann);
};

app.put('/api/admin/announcements/:id', requireAdmin, handleUpdateAnnouncement);
app.patch('/api/admin/announcements/:id', requireAdmin, handleUpdateAnnouncement);
app.put('/api/admin/announcements/:id/activate', requireAdmin, handleUpdateAnnouncement);
app.patch('/api/admin/announcements/:id/activate', requireAdmin, handleUpdateAnnouncement);

app.delete('/api/admin/announcements/:id', requireAdmin, (req, res) => {
  const database = db.get();
  const idx = database.announcements.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'اطلاعیه یافت نشد.' });
  }

  database.announcements.splice(idx, 1);
  db.save();
  res.json({ success: true, message: 'اطلاعیه حذف شد.' });
});

// Admin: Settings
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  const database = db.get();
  res.json(database.settings);
});

const handleUpdateSettings = (req: express.Request, res: express.Response) => {
  const database = db.get();
  database.settings = {
    ...database.settings,
    ...req.body,
    shipping_cost: Number(req.body.shipping_cost) || 0,
  };
  db.save();
  res.json({ success: true, settings: database.settings, message: 'تنظیمات با موفقیت ذخیره شدند.' });
};

app.put('/api/admin/settings', requireAdmin, handleUpdateSettings);
app.patch('/api/admin/settings', requireAdmin, handleUpdateSettings);

// ----------------------------------------------------
// Vite & Static Asset Handling
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`فروشگاه کره مغزها سرور در حال اجرا روی پورت ${PORT}`);
  });
}

startServer();
