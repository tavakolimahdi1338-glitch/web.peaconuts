export type ProductWeight = 300 | 500 | 1000;

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  delivery_type: 'physical' | 'service';
  stock: number; // موجودی کلی برای همه وزن‌ها
  active: boolean;
  price_300: number; // ۰ یعنی ارائه نمی‌شود
  price_500: number;
  price_1000: number;
  discount_300: number; // ۰ تا ۹۹ درصد
  discount_500: number;
  discount_1000: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  image_url: string;
  weight: ProductWeight;
  quantity: number;
  base_price: number;
  discount_percent: number;
  unit_price: number;
  row_total: number;
  savings_row: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'rejected';
export type DeliveryMethod = 'pickup' | 'post';

export interface Order {
  id: string;
  order_code: string; // خوانا مانند O2609031234
  customer_name: string;
  phone: string;
  delivery_method: DeliveryMethod;
  address: string;
  details?: string;
  items: OrderItem[];
  subtotal: number;
  coupon_code?: string;
  coupon_discount: number;
  shipping: number;
  total: number;
  savings: number; // سود مشتری: مجموع تخفیف محصولات + تخفیف کوپن
  receipt_url: string;
  status: OrderStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export type CouponType = 'percent' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order: number;
  max_uses: number;
  used_count: number;
  expires_at: string; // ISO string
  active: boolean;
  created_at: string;
}

export interface CouponUse {
  id: string;
  code: string;
  phone: string;
  used_at: string;
}

export interface SupportTicket {
  id: string;
  customer_name: string;
  phone: string;
  email?: string;
  message: string;
  file_url?: string;
  status: 'open' | 'answered' | 'closed';
  admin_reply?: string;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  store_name: string;
  welcome_text: string;
  about_text: string;
  telegram_id: string;
  instagram_id: string;
  phone: string;
  address: string;
  card_number: string;
  card_holder: string;
  shipping_cost: number;
  currency: string;
  logo_url: string;
  hero_title: string;
  hero_subtitle: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  active: boolean;
  created_at: string;
}

export interface AdminStats {
  today_orders_count: number;
  confirmed_sales_today: number;
  confirmed_sales_7d: number;
  confirmed_sales_30d: number;
  pending_orders_count: number;
  low_stock_count: number;
  open_tickets_count: number;
  total_customers_count: number;
}

export interface SalesReport {
  period_today: { count: number; total_amount: number; total_discount: number };
  period_7d: { count: number; total_amount: number; total_discount: number };
  period_30d: { count: number; total_amount: number; total_discount: number };
  top_products: Array<{ product_id: string; product_name: string; total_quantity: number; total_revenue: number }>;
  pending_count: number;
  shipped_count: number;
}

export interface CartItem {
  product: Product;
  weight: ProductWeight;
  quantity: number;
}
