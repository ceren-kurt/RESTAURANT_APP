-- Restaurant Order System Database Schema
-- Run this migration in Supabase to create all required tables

-- Category table
CREATE TABLE IF NOT EXISTS category (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Product table
CREATE TABLE IF NOT EXISTS product (
  product_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  category_id INTEGER REFERENCES category(category_id) ON DELETE SET NULL
);

-- Customer table
CREATE TABLE IF NOT EXISTS customer (
  customer_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100)
);

-- Restaurant Table
CREATE TABLE IF NOT EXISTS restaurant_table (
  table_id SERIAL PRIMARY KEY,
  table_number VARCHAR(20) NOT NULL,
  capacity INTEGER DEFAULT 4,
  status VARCHAR(20) DEFAULT 'available'
);

-- Address table
CREATE TABLE IF NOT EXISTS address (
  address_id SERIAL PRIMARY KEY,
  title VARCHAR(100),
  full_address TEXT NOT NULL,
  customer_id INTEGER REFERENCES customer(customer_id) ON DELETE CASCADE
);

-- Order table
CREATE TABLE IF NOT EXISTS restaurant_order (
  order_id SERIAL PRIMARY KEY,
  order_date TIMESTAMP DEFAULT NOW(),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('dine-in', 'takeaway')),
  table_id INTEGER REFERENCES restaurant_table(table_id) ON DELETE SET NULL,
  customer_id INTEGER REFERENCES customer(customer_id) ON DELETE SET NULL,
  address_id INTEGER REFERENCES address(address_id) ON DELETE SET NULL
);

-- Order detail table
CREATE TABLE IF NOT EXISTS order_detail (
  detail_id SERIAL PRIMARY KEY,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  order_id INTEGER REFERENCES restaurant_order(order_id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES product(product_id) ON DELETE SET NULL
);

-- Payment table
CREATE TABLE IF NOT EXISTS payment (
  payment_id SERIAL PRIMARY KEY,
  payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('cash', 'credit_card')),
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT NOW(),
  order_id INTEGER REFERENCES restaurant_order(order_id) ON DELETE CASCADE
);

-- Enable RLS on all tables
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE address ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment ENABLE ROW LEVEL SECURITY;

-- Public read policies for menu items (categories and products)
CREATE POLICY "Public can read active categories" ON category FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read available products" ON product FOR SELECT USING (is_available = true);
CREATE POLICY "Public can read tables" ON restaurant_table FOR SELECT USING (true);

-- Public insert policies for orders (customers can place orders without authentication)
CREATE POLICY "Public can insert customers" ON customer FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert addresses" ON address FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert orders" ON restaurant_order FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert order details" ON order_detail FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert payments" ON payment FOR INSERT WITH CHECK (true);

-- Public read policies for order tracking
CREATE POLICY "Public can read customers" ON customer FOR SELECT USING (true);
CREATE POLICY "Public can read addresses" ON address FOR SELECT USING (true);
CREATE POLICY "Public can read orders" ON restaurant_order FOR SELECT USING (true);
CREATE POLICY "Public can read order details" ON order_detail FOR SELECT USING (true);
CREATE POLICY "Public can read payments" ON payment FOR SELECT USING (true);
