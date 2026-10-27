-- Smart Canteen Menu Database Schema
-- Compatible with Supabase PostgreSQL

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Categories
INSERT INTO categories (name) VALUES 
('Breakfast'), 
('Lunch'), 
('Snacks'), 
('Beverages'), 
('Desserts')
ON CONFLICT (name) DO NOTHING;

-- 2. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    is_available BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Order Items Table (Junction Table)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0)
);

-- Index for fetching order details
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Sample Seed Data for Menu Items
INSERT INTO menu_items (name, description, price, category_id, is_available, image_url) VALUES
('Masala Dosa', 'Crispy rice crepe filled with spiced potato mixture, served with chutney & sambar', 60.00, 1, TRUE, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80'),
('Veg Cheese Burger', 'Juicy veg patty topped with melted cheese, lettuce, and tangy sauce', 80.00, 3, TRUE, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'),
('Paneer Butter Masala Combo', 'Rich gravy paneer butter masala served with 2 butter naan and rice', 140.00, 2, TRUE, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80'),
('Cold Coffee with Ice Cream', 'Thick creamy cold coffee topped with a scoop of vanilla ice cream', 70.00, 4, TRUE, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80'),
('Chocolate Brownie', 'Warm chocolate brownie served with chocolate drizzle', 90.00, 5, TRUE, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80'),
('Samosa (2 Pcs)', 'Crispy deep-fried pastry filled with spiced potato and peas', 30.00, 3, TRUE, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80');

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories and menu items
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Menu Items" ON menu_items FOR SELECT USING (true);

-- Allow backend service role / public insert for demo (Adjust according to auth setup)
CREATE POLICY "Allow All Access Categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow All Access Menu Items" ON menu_items FOR ALL USING (true);
CREATE POLICY "Allow All Access Orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow All Access Order Items" ON order_items FOR ALL USING (true);