import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  Product,
  Order,
  Coupon,
  CouponUse,
  SupportTicket,
  StoreSettings,
  Announcement,
} from '../src/types';

export interface AdminAccount {
  email: string;
  password_hash: string;
  token?: string;
  updated_at: string;
}

export interface DatabaseSchema {
  admin: AdminAccount;
  settings: StoreSettings;
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  coupon_uses: CouponUse[];
  tickets: SupportTicket[];
  announcements: Announcement[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function hashPassword(pass: string): string {
  return crypto.createHash('sha256').update(pass.trim()).digest('hex');
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'فروشگاه کره مغزها',
  welcome_text: 'طعم ناب و اصیل کره‌های آجیلی خالص؛ فرآوری روزانه و کاملاً ارگانیک بدون شکر و پالم',
  about_text: 'ما در فروشگاه کره مغزها با عشق و تکیه بر استانداردهای سلامت، تازه‌ترین و غنی‌ترین کره‌های طبیعی بادام زمینی، پسته، بادام و فندق را بدون قطره‌ای روغن صنعتی، شکر یا نگهدارنده تولید می‌کنیم. انتخاب ما سلامت و انرژی روزانه شماست.',
  telegram_id: '@Mr_tavakolii',
  instagram_id: '@karehmaghzha',
  phone: '۰۲۱-۲۲۴۴۶۶۸۸',
  address: 'تهران، میدان تجریش، خیابان دربند، نبش بن‌بست یاس، کارگاه کره مغزها',
  card_number: '۶۰۳۷-۹۹۷۵-۱۲۳۴-۵۶۷۸',
  card_holder: 'مهدی توکلی',
  shipping_cost: 45000,
  currency: 'تومان',
  logo_url: '/uploads/peaconuts_icon.jpg',
  hero_title: 'کره‌های طبیعی مغزها؛ خالص، تازه و انرژی‌بخش',
  hero_subtitle: 'آسیاب تازه در حضور مشتری و ارسال سریع در ظروف شیشه‌ای بهداشتی به سراسر کشور',
};

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'تخفیف ویژه اعضای جدید فروشگاه',
    body: 'با وارد کردن کد تخفیف WELCOME10 در مرحله پرداخت، از ۱۰٪ تخفیف روی خرید‌های بالای ۲۰۰,۰۰۰ تومان بهره‌مند شوید!',
    active: true,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'c-1',
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    min_order: 200000,
    max_uses: 20,
    used_count: 0,
    expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'کره بادام زمینی اعلا (کلاسیک و کرانچی)',
    description: 'تهیه شده از مرغوب‌ترین بادام زمینی خرد شده آستانه اشرفیه با طعمی اصیل و بافتی نرم و دلپذیر. کاملاً بدون نمک، بدون شکر و بدون روغن هیدروژنه.',
    image_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    delivery_type: 'physical',
    stock: 35,
    active: true,
    price_300: 120000,
    price_500: 190000,
    price_1000: 360000,
    discount_300: 10,
    discount_500: 15,
    discount_1000: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-2',
    name: 'کره پسته ممتاز رفسنجان (سبز اکبری)',
    description: 'تهیه شده از مرغوب‌ترین مغز پسته اکبری و کله‌قوچی تازه، با رنگ سبز زمردی طبیعی و رایحه بی‌نظیر. بمب انرژی و سرشار از پروتئین، آهن و آنتی‌اکسیدان.',
    image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
    delivery_type: 'physical',
    stock: 20,
    active: true,
    price_300: 390000,
    price_500: 640000,
    price_1000: 1250000,
    discount_300: 0,
    discount_500: 8,
    discount_1000: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-3',
    name: 'کره بادام درختی تفت داده شده خالص',
    description: 'تولید شده از بادام ایرانی ارگانیک با برشته‌کاری ملایم بدون هیچ چربی افزوده. طعمی گرم و آجیلی با غلظت عالی، حاوی کلسیم و ویتامین E فراوان برای سلامت قلب و عروق.',
    image_url: 'https://images.unsplash.com/photo-1620921575116-bbf4c329a1ee?auto=format&fit=crop&w=800&q=80',
    delivery_type: 'physical',
    stock: 15,
    active: true,
    price_300: 250000,
    price_500: 410000,
    price_1000: 790000,
    discount_300: 5,
    discount_500: 10,
    discount_1000: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-4',
    name: 'کره فندق شکلاتی طبیعی (بدون پالم)',
    description: 'ترکیب اعجازانگیز فندق بو داده گیلان، پودر خالص دانه کاکائو تلخ و اندکی شیره خرمای کبکاب طبیعی. بهترین و مقوی‌ترین جایگزین نوتلا برای فرزندان و ورزشکاران.',
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    delivery_type: 'physical',
    stock: 28,
    active: true,
    price_300: 220000,
    price_500: 360000,
    price_1000: 0, // ۱ کیلو ارائه نمی‌شود
    discount_300: 10,
    discount_500: 10,
    discount_1000: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let inMemoryDb: DatabaseSchema;

function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Ensure defaults if missing
      return {
        admin: parsed.admin || {
          email: 'admin@store.local',
          password_hash: hashPassword('Admin1234!'),
          updated_at: new Date().toISOString(),
        },
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        products: parsed.products || DEFAULT_PRODUCTS,
        orders: parsed.orders || [],
        coupons: parsed.coupons || DEFAULT_COUPONS,
        coupon_uses: parsed.coupon_uses || [],
        tickets: parsed.tickets || [],
        announcements: parsed.announcements || DEFAULT_ANNOUNCEMENTS,
      };
    } catch (e) {
      console.error('Error reading store.json, creating initial backup:', e);
    }
  }

  const initial: DatabaseSchema = {
    admin: {
      email: 'admin@store.local',
      password_hash: hashPassword('Admin1234!'),
      updated_at: new Date().toISOString(),
    },
    settings: DEFAULT_SETTINGS,
    products: DEFAULT_PRODUCTS,
    orders: [],
    coupons: DEFAULT_COUPONS,
    coupon_uses: [],
    tickets: [],
    announcements: DEFAULT_ANNOUNCEMENTS,
  };
  saveDatabase(initial);
  return initial;
}

export function saveDatabase(db?: DatabaseSchema): void {
  const target = db || inMemoryDb;
  fs.writeFileSync(DB_FILE, JSON.stringify(target, null, 2), 'utf-8');
}

inMemoryDb = loadDatabase();

export const db = {
  get: () => inMemoryDb,
  save: () => saveDatabase(inMemoryDb),
  hashPassword,
};
