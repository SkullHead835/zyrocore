-- Seed categories
INSERT INTO categories (name, slug, image_url) VALUES
  ('Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80'),
  ('Fashion', 'fashion', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80'),
  ('Home & Kitchen', 'home-kitchen', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80'),
  ('Sports & Outdoors', 'sports-outdoors', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80'),
  ('Books', 'books', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80'),
  ('Beauty & Personal Care', 'beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'),
  ('Toys & Games', 'toys-games', 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80'),
  ('Automotive', 'automotive', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80')
ON CONFLICT (slug) DO NOTHING;

-- Seed admin user (password: Admin@123 - bcrypt hash)
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin', 'admin@shopzone.com', '$2b$10$rOzJqVmZnE7Q5pN6X8wDkOU9zBWQeJYgY0bm4NMmj8gL0fDDQvDqi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed products (Electronics)
INSERT INTO products (name, description, price, discount_price, category_id, images, stock, rating, rating_count, is_featured, is_best_seller) VALUES
(
  'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
  'Industry-leading noise cancellation with Auto NC Optimizer. Exceptional sound quality with HD Noise Cancelling Processor QN1. Up to 30-hour battery life. Speak-to-Chat technology automatically reduces volume during conversations.',
  349.99, 279.99,
  (SELECT id FROM categories WHERE slug = 'electronics'),
  ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80','https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80'],
  45, 4.7, 2341, true, true
),
(
  'Apple iPhone 15 Pro Max 256GB Natural Titanium',
  'The most powerful iPhone ever with A17 Pro chip. Titanium design with Action Button. 48MP main camera with 5x Telephoto. USB 3 speeds. Up to 29 hours video playback.',
  1199.99, 1099.99,
  (SELECT id FROM categories WHERE slug = 'electronics'),
  ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'],
  20, 4.8, 5621, true, true
),
(
  'Samsung 65" QLED 4K Smart TV QN65Q80C',
  'Quantum Processor 4K. 100% Color Volume with Quantum Dot technology. Quantum HDR 12x. Object Tracking Sound+. Motion Xcelerator Turbo+ for gaming.',
  1299.99, 997.99,
  (SELECT id FROM categories WHERE slug = 'electronics'),
  ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80'],
  12, 4.5, 892, true, false
),
(
  'Apple MacBook Air 15" M2 Chip 512GB',
  '15.3-inch Liquid Retina display. Apple M2 chip with 8-core CPU and 10-core GPU. 8GB unified memory. 512GB SSD storage. Up to 18 hours of battery life.',
  1299.99, 1199.99,
  (SELECT id FROM categories WHERE slug = 'electronics'),
  ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'],
  18, 4.9, 3102, true, true
),
(
  'Logitech MX Master 3S Wireless Mouse',
  'Ultra-fast MagSpeed electromagnetic scrolling. 8K DPI on any surface. Whisper-quiet clicks. USB-C quick charging. Works on glass surfaces.',
  99.99, 79.99,
  (SELECT id FROM categories WHERE slug = 'electronics'),
  ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80'],
  67, 4.6, 1876, false, true
),
(
  'Nintendo Switch OLED Model - White',
  '7-inch OLED screen with vivid colors and sharp contrast. Wide adjustable stand. Enhanced audio. 64 GB internal storage. Dock with wired LAN port.',
  349.99, null,
  (SELECT id FROM categories WHERE slug = 'electronics'),
  ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80'],
  30, 4.8, 4231, false, true
);

-- Seed products (Fashion)
INSERT INTO products (name, description, price, discount_price, category_id, images, stock, rating, rating_count, sizes, is_featured, is_best_seller) VALUES
(
  'Classic Fit Oxford Button-Down Shirt',
  'Made from 100% premium cotton. Wrinkle-resistant fabric. Perfect for formal and casual occasions. Machine washable.',
  59.99, 39.99,
  (SELECT id FROM categories WHERE slug = 'fashion'),
  ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80','https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80'],
  85, 4.3, 654, ARRAY['XS','S','M','L','XL','XXL'], false, true
),
(
  'Men''s Slim Fit Denim Jeans',
  'Premium stretch denim for all-day comfort. Tailored slim fit with 5-pocket styling. Machine washable.',
  79.99, 54.99,
  (SELECT id FROM categories WHERE slug = 'fashion'),
  ARRAY['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80'],
  60, 4.4, 1243, ARRAY['28','30','32','34','36'], true, false
),
(
  'Men''s Running Shoes - Ultra Boost 22',
  'BOOST midsole technology returns energy with every stride. Primeknit upper adapts to foot shape. Continental rubber outsole for traction in all conditions.',
  149.99, 119.99,
  (SELECT id FROM categories WHERE slug = 'fashion'),
  ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80','https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80'],
  40, 4.6, 2108, ARRAY['7','7.5','8','8.5','9','9.5','10','10.5','11','12'], true, true
),
(
  'Leather Crossbody Handbag',
  'Genuine full-grain leather. Multiple interior pockets. Adjustable shoulder strap. Gold-tone hardware. RFID-blocking lining.',
  189.99, 139.99,
  (SELECT id FROM categories WHERE slug = 'fashion'),
  ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
  25, 4.5, 876, ARRAY[]::text[], true, false
);

-- Seed products (Home & Kitchen)
INSERT INTO products (name, description, price, discount_price, category_id, images, stock, rating, rating_count, is_featured, is_best_seller) VALUES
(
  'Instant Pot Duo 7-in-1 Electric Pressure Cooker 8 Qt',
  'Pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer. 13 one-touch programs. 8-quart capacity feeds 8+ people.',
  99.99, 79.99,
  (SELECT id FROM categories WHERE slug = 'home-kitchen'),
  ARRAY['https://images.unsplash.com/photo-1585515656973-f1095f7a2f21?w=600&q=80'],
  55, 4.7, 45231, true, true
),
(
  'Dyson V15 Detect Cordless Vacuum Cleaner',
  'Laser Detect technology reveals microscopic dust on hard floors. Acoustic Piezo sensor counts and sizes dust particles. Up to 60 minutes of run time.',
  749.99, 649.99,
  (SELECT id FROM categories WHERE slug = 'home-kitchen'),
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
  22, 4.8, 3421, true, true
),
(
  'Nespresso Vertuo Next Coffee Machine',
  'Makes 5 cup sizes: Espresso, Double Espresso, Gran Lungo, Mug, and Alto. Centrifusion technology for perfect extraction. WiFi enabled.',
  179.99, 149.99,
  (SELECT id FROM categories WHERE slug = 'home-kitchen'),
  ARRAY['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'],
  38, 4.5, 2109, false, true
);

-- Seed products (Sports)
INSERT INTO products (name, description, price, discount_price, category_id, images, stock, rating, rating_count, is_featured, is_best_seller) VALUES
(
  'Peloton Yoga Mat - Non-Slip with Carrying Strap',
  '6mm thick for superior cushioning. Non-slip texture on both sides. Eco-friendly TPE material. 72" x 24" size. Includes carrying strap.',
  89.99, 59.99,
  (SELECT id FROM categories WHERE slug = 'sports-outdoors'),
  ARRAY['https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80'],
  90, 4.4, 3201, false, false
),
(
  'Wilson Pro Staff Tennis Racket',
  'Used by Roger Federer. 97 sq in head size. 11.4 oz strung weight. 16x19 string pattern. Braided graphite + kevlar construction.',
  229.99, 189.99,
  (SELECT id FROM categories WHERE slug = 'sports-outdoors'),
  ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80'],
  15, 4.7, 891, true, false
);

-- Seed products (Beauty)
INSERT INTO products (name, description, price, discount_price, category_id, images, stock, rating, rating_count, is_featured, is_best_seller) VALUES
(
  'CeraVe Moisturizing Cream 19 oz',
  'Developed with dermatologists. 3 essential ceramides (1, 3, 6-II). Hyaluronic acid to retain moisture. MVE technology for 24-hour hydration. Fragrance-free.',
  19.99, 14.99,
  (SELECT id FROM categories WHERE slug = 'beauty'),
  ARRAY['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80'],
  200, 4.8, 78231, false, true
),
(
  'Dyson Airwrap Complete Styler',
  'Uses a high-velocity jet of air to style, curl, wave, and smooth hair. No extreme heat. For multiple hair types. Includes 8 attachments.',
  599.99, 499.99,
  (SELECT id FROM categories WHERE slug = 'beauty'),
  ARRAY['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80'],
  14, 4.6, 5621, true, true
);
