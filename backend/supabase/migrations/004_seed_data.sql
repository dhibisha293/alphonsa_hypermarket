-- ============================================================
-- 004_seed_data.sql
-- Alphonsa Hypermarket — Seed all mock data into Supabase
-- Run AFTER 001, 002, 003
-- ============================================================

-- ============================================================
-- CATEGORIES (19 rows)
-- ============================================================
INSERT INTO categories (slug, name, icon, item_count, image_url, sort_order) VALUES
('grocery',          'Grocery',          '🌾', '450+ items', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80', 1),
('vegetables',       'Vegetables',       '🥦', '120+ items', 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=400&q=80', 2),
('fruits',           'Fruits',           '🍎', '85+ items',  'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80', 3),
('drinks',           'Drinks',           '🥤', '150+ items', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80', 4),
('cosmetics',        'Cosmetics',        '✨', '210+ items', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80', 5),
('makeup',           'Makeup',           '💄', '180+ items', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80', 6),
('toys',             'Toys',             '🧸', '320+ items', 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80', 7),
('watches',          'Watches',          '⌚', '90+ items',  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80', 8),
('teddy-bears',      'Teddy Bears',      '🐻', '75+ items',  'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80', 9),
('cakes',            'Cakes',            '🎂', '60+ items',  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80', 10),
('puffs',            'Puffs',            '🥐', '40+ items',  'https://images.unsplash.com/photo-1621236378699-8597faf6a176?auto=format&fit=crop&w=400&q=80', 11),
('brownies',         'Brownies',         '🍫', '30+ items',  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80', 12),
('customized-gifts', 'Customized Gifts', '🎁', '95+ items',  'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=400&q=80', 13),
('stationery',       'Stationery',       '✏️', '240+ items', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80', 14),
('vessels',          'Vessels',          '🍲', '130+ items', 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80', 15),
('plastics',         'Plastics',         '🪣', '160+ items', 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=400&q=80', 16),
('dresses',          'Dresses',          '👗', '310+ items', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80', 17),
('shoes',            'Shoes',            '👟', '220+ items', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80', 18),
('bags',             'Bags',             '🎒', '190+ items', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80', 19)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCTS (24 rows + 6 customized gifts = 30 products)
-- ============================================================
INSERT INTO products (sku, name, description, category_slug, category_label, price, original_price, discount, rating, reviews_count, image_url, unit, is_bestseller, is_new) VALUES

-- Grocery
('p1',  'Aashirvaad Whole Wheat Atta 5kg',          '100% pure whole wheat flour milled to perfection for soft rotis.',                           'grocery',  'Grocery',        245,  285,  14, 4.8, 142,  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',  '5 kg Pack',         TRUE,  FALSE),
('p2',  'India Gate Premium Basmati Rice 5kg',       'Aromatic long grain basmati rice perfect for special meals.',                                'grocery',  'Grocery',        520,  650,  20, 4.9, 98,   'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',  '5 kg Bag',          TRUE,  FALSE),
('p3',  'Fortune Sunlite Sunflower Oil 1L',          'Refined sunflower oil enriched with Vitamins for healthy cooking.',                          'grocery',  'Grocery',        135,  160,  15, 4.6, 76,   'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',  '1 Litre Pouch',     FALSE, FALSE),

-- Vegetables
('p5',  'Farm Fresh Red Tomato 1kg',                 'Juicy farm fresh vine tomatoes packed with natural flavor.',                                  'vegetables','Vegetables',    32,   45,   28, 4.7, 89,   'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',  '1 kg',              TRUE,  FALSE),

-- Fruits
('p9',  'Crisp Red Fuji Apple 1kg',                  'Sweet, crunchy Fuji apples handpicked from premium orchards.',                               'fruits',   'Fruits',         180,  220,  18, 4.9, 156,  'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',  '1 kg',              TRUE,  FALSE),
('p10', 'Ripe Golden Banana 1 Dozen',                'Naturally ripened sweet bananas packed with energy.',                                        'fruits',   'Fruits',         55,   70,   21, 4.7, 94,   'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',  '1 Dozen',           FALSE, FALSE),

-- Drinks
('p21', 'Coca-Cola Original Taste 1.5L',             'Refreshing sparkling cola beverage best served chilled.',                                    'drinks',   'Drinks',         75,   90,   16, 4.8, 320,  'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',  '1.5 Litre Bottle',  TRUE,  FALSE),
('p23', 'Real Fruit Power Mixed Juice 1L',           '100% natural fruit blend rich in Vitamin C.',                                               'drinks',   'Drinks',         110,  130,  15, 4.6, 95,   'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80',  '1 Litre Tetrapack', FALSE, FALSE),

-- Cosmetics
('p24', 'Himalaya Purifying Neem Face Wash 150ml',   'Herbal formula with Neem and Turmeric to clear skin.',                                      'cosmetics','Cosmetics',      185,  220,  16, 4.7, 175,  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',  '150ml Tube',        TRUE,  FALSE),
('p25', 'Nivea Light Moisturizing Cream 200ml',      'Non-greasy moisture cream for glowing soft skin.',                                           'cosmetics','Cosmetics',      260,  310,  16, 4.8, 140,  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80',  '200ml Tub',         FALSE, FALSE),

-- Makeup
('p26', 'Maybelline Matte Velvet Lipstick (Ruby Red)','Long-lasting matte finish lipstick with intense pigmentation.',                             'makeup',   'Makeup',         399,  499,  20, 4.9, 210,  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80',  '3.8g Stick',        FALSE, TRUE),

-- Toys
('p28', 'High-Speed Rechargeable Remote Control Car','Off-road 4WD stunt car with wireless remote controller.',                                    'toys',     'Toys',           799,  1199, 33, 4.8, 280,  'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80',  'Full Kit',          TRUE,  FALSE),

-- Watches
('p30', 'Classic Leather Chronograph Men Watch',     'Water-resistant quartz watch with genuine leather strap.',                                   'watches',  'Watches',        1499, 2499, 40, 4.9, 145,  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80',  'Gift Box',          TRUE,  FALSE),

-- Bakery
('p13', 'Rich Chocolate Fudge Cake 1kg',             'Moist chocolate sponge smothered in Belgian ganache.',                                       'cakes',    'Bakery',         599,  750,  20, 4.9, 240,  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',  '1 kg Cake',         TRUE,  FALSE),
('p16', 'Hot Crispy Chicken Puff (2 Pcs)',           'Flaky golden puff pastry stuffed with spiced chicken.',                                      'puffs',    'Bakery',         60,   75,   20, 4.7, 310,  'https://images.unsplash.com/photo-1621236378699-8597faf6a176?auto=format&fit=crop&w=400&q=80',  '2 Pcs',             TRUE,  FALSE),
('p19', 'Double Chocolate Fudgy Brownie',            'Gooey melted dark chocolate brownie slab.',                                                  'brownies', 'Bakery',         85,   110,  22, 4.9, 198,  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80',  '1 Piece',           TRUE,  FALSE),

-- Home Essentials
('p31', 'Stainless Steel Cookware Vessel Set (5 Pcs)','Heavy duty induction-bottom food grade stainless steel pots.',                             'vessels',  'Home Essentials', 1299, 1799, 27, 4.8, 110,  'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80',  '5 Pcs Set',         TRUE,  FALSE),
('p32', 'Airtight Plastic Storage Container Box Set','BPA-free stackable food storage container set.',                                             'plastics', 'Home Essentials', 299,  399,  25, 4.7, 155,  'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=400&q=80',  '3 Pcs Box',         FALSE, FALSE),

-- Fashion
('p33', 'Floral Print Summer Casual Dress',          'Breathable 100% cotton floral print summer dress.',                                          'dresses',  'Fashion',        899,  1299, 30, 4.7, 92,   'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',  'Medium',            FALSE, TRUE),
('p34', 'Trendy Urban Sneakers for Unisex',          'Cushioned sports sneakers with durable rubber sole.',                                        'shoes',    'Fashion',        1199, 1799, 33, 4.8, 215,  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',  'Size 8',            TRUE,  FALSE),
('p35', 'Elegant Women Leather Handbag',             'Spacious faux leather tote bag with multi zip pockets.',                                     'bags',     'Fashion',        999,  1499, 33, 4.9, 130,  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',  '1 Pc',              TRUE,  FALSE),

-- Customized Gifts
('g1',  'Customized Teddy Bear with Name Ribbon',    'Adorable soft plush teddy bear customized with embroidered name ribbon.',                    'customized-gifts','Customized Gifts', 499, 699, 28, 4.9, 164, 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80', 'Soft Toy + Name Ribbon', FALSE, FALSE),
('g2',  'Personalized Celebration Gift Box',         'Custom curated luxury gift hamper box with mug, chocolates, candle, and greeting card.',     'customized-gifts','Customized Gifts', 899, 1199, 25, 4.8, 210, 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=400&q=80', 'Full Gift Box Kit', FALSE, FALSE),
('g3',  'Customized Photo Printed Ceramic Mug',      'High gloss microwave-safe ceramic coffee mug with custom photo or quotes.',                  'customized-gifts','Customized Gifts', 249, 350, 28, 4.7, 310, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80', '350ml Ceramic Mug', FALSE, FALSE),
('g4',  'Grand Birthday Surprise Gift Hamper',       'Special hamper with custom frame, gourmet cookies, stuffed teddy, and wish scroll.',         'customized-gifts','Customized Gifts', 1299, 1699, 23, 4.9, 145, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80', 'Basket Hamper',    FALSE, FALSE),
('g5',  'Artisanal Chocolate Gift Box',              'Handcrafted Belgian dark and milk chocolates in a personalized golden gift box.',             'customized-gifts','Customized Gifts', 399, 550, 27, 4.8, 188, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80', '16 Pcs Box',       FALSE, FALSE),
('g6',  'Personalized Wooden Photo Stand',           'Laser engraved premium teak wood table frame with your memorable family photograph.',        'customized-gifts','Customized Gifts', 349, 499, 30, 4.9, 120, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80', 'Engraved Wood',    FALSE, FALSE)

ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- SPECIAL OFFERS (4 rows)
-- ============================================================
INSERT INTO special_offers (title, discount_text, description, code, discount_pct, valid_till_text, badge) VALUES
('Weekend Super Saver',    'Up to 30% OFF',          'Special discounts on bulk grocery staples, rice, oils, and kitchen essentials at Kattathurai.', 'SUPER30',    30, 'Valid till Sunday',  'Limited Time'),
('Fresh Fruits Festival',  'Fresh deals every day',  'Flat 20% cashback on organic apples, berries, citrus fruits & dry fruits.',                     'FRUIT20',    20, 'Daily Specials',     'Farm Fresh'),
('Bakery Treats Delights', 'Buy More, Save More',    'Buy 2 Get 1 Free on all fresh cream cakes, chocolate brownies, and hot puffs.',                  'BAKERYBOGO', 20, 'This Week Only',     'Bestseller'),
('Kids Special Carnival',  'Fun toys at exciting prices', 'Flat 25% discount on remote control cars, teddy bears & building blocks.',                  'KIDSFUN25',  25, 'Weekend Offer',      'Family Favorite')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- TESTIMONIALS (3 rows)
-- ============================================================
INSERT INTO testimonials (name, role, comment, rating, avatar_url, location, sort_order) VALUES
('Priya', 'Local Family Shopper',       'Great place for family shopping. They have almost everything I need!',                                         5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 'Kattathurai', 1),
('Arun',  'Bakery & Dessert Enthusiast','The bakery section is amazing. The cakes and brownies are really good!',                                       5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 'Kattathurai', 2),
('Meena', 'Working Mother',             'Very convenient because groceries, toys, cosmetics and home products are all available in one place.',         5, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', 'Kattathurai', 3)
ON CONFLICT DO NOTHING;
