export const CATEGORIES = [
  { id: 'grocery', name: 'Grocery', icon: '🌾', count: '450+ items', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥦', count: '120+ items', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=400&q=80' },
  { id: 'fruits', name: 'Fruits', icon: '🍎', count: '85+ items', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80' },
  { id: 'drinks', name: 'Drinks', icon: '🥤', count: '150+ items', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80' },
  { id: 'cosmetics', name: 'Cosmetics', icon: '✨', count: '210+ items', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80' },
  { id: 'makeup', name: 'Makeup', icon: '💄', count: '180+ items', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80' },
  { id: 'toys', name: 'Toys', icon: '🧸', count: '320+ items', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80' },
  { id: 'watches', name: 'Watches', icon: '⌚', count: '90+ items', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80' },
  { id: 'teddy-bears', name: 'Teddy Bears', icon: '🐻', count: '75+ items', image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 'cakes', name: 'Cakes', icon: '🎂', count: '60+ items', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80' },
  { id: 'puffs', name: 'Puffs', icon: '🥐', count: '40+ items', image: 'https://images.unsplash.com/photo-1621236378699-8597faf6a176?auto=format&fit=crop&w=400&q=80' },
  { id: 'brownies', name: 'Brownies', icon: '🍫', count: '30+ items', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80' },
  { id: 'customized-gifts', name: 'Customized Gifts', icon: '🎁', count: '95+ items', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=400&q=80' },
  { id: 'stationery', name: 'Stationery', icon: '✏️', count: '240+ items', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80' },
  { id: 'vessels', name: 'Vessels', icon: '🍲', count: '130+ items', image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80' },
  { id: 'plastics', name: 'Plastics', icon: '🪣', count: '160+ items', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=400&q=80' },
  { id: 'dresses', name: 'Dresses', icon: '👗', count: '310+ items', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80' },
  { id: 'shoes', name: 'Shoes', icon: '👟', count: '220+ items', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
  { id: 'bags', name: 'Bags', icon: '🎒', count: '190+ items', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80' }
];

export const FEATURED_CLUSTERS = [
  {
    id: 'fresh-healthy',
    title: 'Fresh & Healthy',
    subtitle: 'Farm fresh fruits, crisp vegetables and organic staples',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    tags: ['Vegetables', 'Fruits', 'Grocery'],
    badge: '100% Organic Fresh'
  },
  {
    id: 'sweet-treats',
    title: 'Sweet Treats',
    subtitle: 'Freshly baked artisanal cakes, brownies & warm puffs',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80',
    tags: ['Cakes', 'Brownies', 'Puffs'],
    badge: 'Baked Daily'
  },
  {
    id: 'customized-gifts-cluster',
    title: 'Customized Gifts 🎁',
    subtitle: 'Personalized teddy bears, photo mugs & celebration hampers',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80',
    tags: ['Customized Gifts', 'Teddy Bears'],
    badge: 'Special Occasions'
  },
  {
    id: 'style-beauty',
    title: 'Style & Beauty',
    subtitle: 'Premium cosmetics, makeup, designer dresses & shoes',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    tags: ['Cosmetics', 'Makeup', 'Dresses', 'Shoes', 'Bags'],
    badge: 'Trending Beauty'
  },
  {
    id: 'home-essentials',
    title: 'Home Essentials',
    subtitle: 'Stainless steel cookware, storage containers & stationery',
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
    tags: ['Vessels', 'Plastics', 'Stationery'],
    badge: 'Super Savers'
  }
];

export const CUSTOMIZED_GIFTS = [
  {
    id: 'g1',
    name: 'Customized Teddy Bear with Name Ribbon',
    category: 'customized-gifts',
    categoryLabel: 'Customized Gifts',
    price: 499,
    originalPrice: 699,
    discount: 28,
    rating: 4.9,
    reviews: 164,
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80',
    unit: 'Soft Toy + Name Ribbon',
    description: 'Adorable soft plush teddy bear customized with embroidered recipient name or custom romantic message ribbon.'
  },
  {
    id: 'g2',
    name: 'Personalized Celebration Gift Box',
    category: 'customized-gifts',
    categoryLabel: 'Customized Gifts',
    price: 899,
    originalPrice: 1199,
    discount: 25,
    rating: 4.8,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=400&q=80',
    unit: 'Full Gift Box Kit',
    description: 'Custom curated luxury gift hamper box with custom mug, gourmet chocolates, scented candle, and custom greeting card.'
  },
  {
    id: 'g3',
    name: 'Customized Photo Printed Ceramic Mug',
    category: 'customized-gifts',
    categoryLabel: 'Customized Gifts',
    price: 249,
    originalPrice: 350,
    discount: 28,
    rating: 4.7,
    reviews: 310,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    unit: '350ml Ceramic Mug',
    description: 'High gloss microwave-safe ceramic coffee mug printed with high-resolution family photos or customized quotes.'
  },
  {
    id: 'g4',
    name: 'Grand Birthday Surprise Gift Hamper',
    category: 'customized-gifts',
    categoryLabel: 'Customized Gifts',
    price: 1299,
    originalPrice: 1699,
    discount: 23,
    rating: 4.9,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
    unit: 'Basket Hamper',
    description: 'Special hamper containing custom printed frame, gourmet cookies, stuffed teddy, and custom birthday wish scroll.'
  },
  {
    id: 'g5',
    name: 'Artisanal Chocolate Gift Box',
    category: 'customized-gifts',
    categoryLabel: 'Customized Gifts',
    price: 399,
    originalPrice: 550,
    discount: 27,
    rating: 4.8,
    reviews: 188,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80',
    unit: '16 Pcs Box',
    description: 'Handcrafted Belgian dark and milk chocolates packaged in a personalized golden gift box.'
  },
  {
    id: 'g6',
    name: 'Personalized Wooden Photo Stand',
    category: 'customized-gifts',
    categoryLabel: 'Customized Gifts',
    price: 349,
    originalPrice: 499,
    discount: 30,
    rating: 4.9,
    reviews: 120,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
    unit: 'Engraved Wood',
    description: 'Laser engraved premium teak wood table frame with your memorable family photograph.'
  }
];

export const PRODUCTS = [
  // Grocery
  {
    id: 'p1',
    name: 'Aashirvaad Whole Wheat Atta 5kg',
    category: 'grocery',
    categoryLabel: 'Grocery',
    price: 245,
    originalPrice: 285,
    discount: 14,
    rating: 4.8,
    reviews: 142,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: '5 kg Pack',
    description: '100% pure whole wheat flour milled to perfection for soft rotis.'
  },
  {
    id: 'p2',
    name: 'India Gate Premium Basmati Rice 5kg',
    category: 'grocery',
    categoryLabel: 'Grocery',
    price: 520,
    originalPrice: 650,
    discount: 20,
    rating: 4.9,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: '5 kg Bag',
    description: 'Aromatic long grain basmati rice perfect for special meals.'
  },
  {
    id: 'p3',
    name: 'Fortune Sunlite Sunflower Oil 1L',
    category: 'grocery',
    categoryLabel: 'Grocery',
    price: 135,
    originalPrice: 160,
    discount: 15,
    rating: 4.6,
    reviews: 76,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    unit: '1 Litre Pouch',
    description: 'Refined sunflower oil enriched with Vitamins for healthy cooking.'
  },

  // Vegetables
  {
    id: 'p5',
    name: 'Farm Fresh Red Tomato 1kg',
    category: 'vegetables',
    categoryLabel: 'Vegetables',
    price: 32,
    originalPrice: 45,
    discount: 28,
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: '1 kg',
    description: 'Juicy farm fresh vine tomatoes packed with natural flavor.'
  },

  // Fruits
  {
    id: 'p9',
    name: 'Crisp Red Fuji Apple 1kg',
    category: 'fruits',
    categoryLabel: 'Fruits',
    price: 180,
    originalPrice: 220,
    discount: 18,
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: '1 kg',
    description: 'Sweet, crunchy Fuji apples handpicked from premium orchards.'
  },
  {
    id: 'p10',
    name: 'Ripe Golden Banana 1 Dozen',
    category: 'fruits',
    categoryLabel: 'Fruits',
    price: 55,
    originalPrice: 70,
    discount: 21,
    rating: 4.7,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
    unit: '1 Dozen',
    description: 'Naturally ripened sweet bananas packed with energy.'
  },

  // Drinks
  {
    id: 'p21',
    name: 'Coca-Cola Original Taste 1.5L',
    category: 'drinks',
    categoryLabel: 'Drinks',
    price: 75,
    originalPrice: 90,
    discount: 16,
    rating: 4.8,
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: '1.5 Litre Bottle',
    description: 'Refreshing sparkling cola beverage best served chilled.'
  },
  {
    id: 'p23',
    name: 'Real Fruit Power Mixed Juice 1L',
    category: 'drinks',
    categoryLabel: 'Drinks',
    price: 110,
    originalPrice: 130,
    discount: 15,
    rating: 4.6,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80',
    unit: '1 Litre Tetrapack',
    description: '100% natural fruit blend rich in Vitamin C.'
  },

  // Cosmetics & Makeup
  {
    id: 'p24',
    name: 'Himalaya Purifying Neem Face Wash 150ml',
    category: 'cosmetics',
    categoryLabel: 'Cosmetics',
    price: 185,
    originalPrice: 220,
    discount: 16,
    rating: 4.7,
    reviews: 175,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: '150ml Tube',
    description: 'Herbal formula with Neem and Turmeric to clear skin.'
  },
  {
    id: 'p25',
    name: 'Nivea Light Moisturizing Cream 200ml',
    category: 'cosmetics',
    categoryLabel: 'Cosmetics',
    price: 260,
    originalPrice: 310,
    discount: 16,
    rating: 4.8,
    reviews: 140,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80',
    unit: '200ml Tub',
    description: 'Non-greasy moisture cream for glowing soft skin.'
  },
  {
    id: 'p26',
    name: 'Maybelline Matte Velvet Lipstick (Ruby Red)',
    category: 'makeup',
    categoryLabel: 'Makeup',
    price: 399,
    originalPrice: 499,
    discount: 20,
    rating: 4.9,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80',
    isNew: true,
    unit: '3.8g Stick',
    description: 'Long-lasting matte finish lipstick with intense pigmentation.'
  },

  // Toys
  {
    id: 'p28',
    name: 'High-Speed Rechargeable Remote Control Car',
    category: 'toys',
    categoryLabel: 'Toys',
    price: 799,
    originalPrice: 1199,
    discount: 33,
    rating: 4.8,
    reviews: 280,
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: 'Full Kit',
    description: 'Off-road 4WD stunt car with wireless remote controller.'
  },

  // Watches
  {
    id: 'p30',
    name: 'Classic Leather Chronograph Men Watch',
    category: 'watches',
    categoryLabel: 'Watches',
    price: 1499,
    originalPrice: 2499,
    discount: 40,
    rating: 4.9,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: 'Gift Box',
    description: 'Water-resistant quartz watch with genuine leather strap.'
  },

  // Bakery
  {
    id: 'p13',
    name: 'Rich Chocolate Fudge Cake 1kg',
    category: 'cakes',
    categoryLabel: 'Bakery',
    price: 599,
    originalPrice: 750,
    discount: 20,
    rating: 4.9,
    reviews: 240,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: '1 kg Cake',
    description: 'Moist chocolate sponge smothered in Belgian ganache.'
  },
  {
    id: 'p16',
    name: 'Hot Crispy Chicken Puff (2 Pcs)',
    category: 'puffs',
    categoryLabel: 'Bakery',
    price: 60,
    originalPrice: 75,
    discount: 20,
    rating: 4.7,
    reviews: 310,
    image: 'https://images.unsplash.com/photo-1621236378699-8597faf6a176?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: '2 Pcs',
    description: 'Flaky golden puff pastry stuffed with spiced chicken.'
  },
  {
    id: 'p19',
    name: 'Double Chocolate Fudgy Brownie',
    category: 'brownies',
    categoryLabel: 'Bakery',
    price: 85,
    originalPrice: 110,
    discount: 22,
    rating: 4.9,
    reviews: 198,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: '1 Piece',
    description: 'Gooey melted dark chocolate brownie slab.'
  },

  // Home Essentials
  {
    id: 'p31',
    name: 'Stainless Steel Cookware Vessel Set (5 Pcs)',
    category: 'vessels',
    categoryLabel: 'Home Essentials',
    price: 1299,
    originalPrice: 1799,
    discount: 27,
    rating: 4.8,
    reviews: 110,
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: '5 Pcs Set',
    description: 'Heavy duty induction-bottom food grade stainless steel pots.'
  },
  {
    id: 'p32',
    name: 'Airtight Plastic Storage Container Box Set',
    category: 'plastics',
    categoryLabel: 'Home Essentials',
    price: 299,
    originalPrice: 399,
    discount: 25,
    rating: 4.7,
    reviews: 155,
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=400&q=80',
    unit: '3 Pcs Box',
    description: 'BPA-free stackable food storage container set.'
  },

  // Fashion & Accessories
  {
    id: 'p33',
    name: 'Floral Print Summer Casual Dress',
    category: 'dresses',
    categoryLabel: 'Fashion',
    price: 899,
    originalPrice: 1299,
    discount: 30,
    rating: 4.7,
    reviews: 92,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
    isNew: true,
    unit: 'Medium',
    description: 'Breathable 100% cotton floral print summer dress.'
  },
  {
    id: 'p34',
    name: 'Trendy Urban Sneakers for Unisex',
    category: 'shoes',
    categoryLabel: 'Fashion',
    price: 1199,
    originalPrice: 1799,
    discount: 33,
    rating: 4.8,
    reviews: 215,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: 'Size 8',
    description: 'Cushioned sports sneakers with durable rubber sole.'
  },
  {
    id: 'p35',
    name: 'Elegant Women Leather Handbag',
    category: 'bags',
    categoryLabel: 'Fashion',
    price: 999,
    originalPrice: 1499,
    discount: 33,
    rating: 4.9,
    reviews: 130,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
    isBestseller: true,
    unit: '1 Pc',
    description: 'Spacious faux leather tote bag with multi zip pockets.'
  }
];

export const SPECIAL_OFFERS = [
  {
    id: 'offer-1',
    title: 'Weekend Super Saver',
    discountText: 'Up to 30% OFF',
    description: 'Special discounts on bulk grocery staples, rice, oils, and kitchen essentials at Kattathurai.',
    code: 'SUPER30',
    validTill: 'Valid till Sunday',
    badge: 'Limited Time'
  },
  {
    id: 'offer-2',
    title: 'Fresh Fruits Festival',
    discountText: 'Fresh deals every day',
    description: 'Flat 20% cashback on organic apples, berries, citrus fruits & dry fruits.',
    code: 'FRUIT20',
    validTill: 'Daily Specials',
    badge: 'Farm Fresh'
  },
  {
    id: 'offer-3',
    title: 'Bakery Treats Delights',
    discountText: 'Buy More, Save More',
    description: 'Buy 2 Get 1 Free on all fresh cream cakes, chocolate brownies, and hot puffs.',
    code: 'BAKERYBOGO',
    validTill: 'This Week Only',
    badge: 'Bestseller'
  },
  {
    id: 'offer-4',
    title: 'Kids Special Carnival',
    discountText: 'Fun toys at exciting prices',
    description: 'Flat 25% discount on remote control cars, teddy bears & building blocks.',
    code: 'KIDSFUN25',
    validTill: 'Weekend Offer',
    badge: 'Family Favorite'
  }
];

export const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Priya',
    role: 'Local Family Shopper',
    comment: 'Great place for family shopping. They have almost everything I need!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    location: 'Kattathurai'
  },
  {
    id: 't2',
    name: 'Arun',
    role: 'Bakery & Dessert Enthusiast',
    comment: 'The bakery section is amazing. The cakes and brownies are really good!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    location: 'Kattathurai'
  },
  {
    id: 't3',
    name: 'Meena',
    role: 'Working Mother',
    comment: 'Very convenient because groceries, toys, cosmetics and home products are all available in one place.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    location: 'Kattathurai'
  }
];

export const WHY_CHOOSE_ALPHONSA = [
  {
    id: 'w1',
    title: 'Fresh & Quality Products',
    description: 'Handpicked organic fruits, crisp veggies, and 100% quality checked groceries straight from farms.'
  },
  {
    id: 'w2',
    title: 'Affordable Prices',
    description: 'Wholesale-style daily low prices with extra weekend savings and loyalty rewards.'
  },
  {
    id: 'w3',
    title: 'Wide Range of Products',
    description: 'Over 20,000+ items across groceries, fresh bakery, toys, fashion, cosmetics, and household vessels.'
  },
  {
    id: 'w4',
    title: 'Free Delivery up to 3 KM',
    description: 'Convenient zero-cost home delivery within 3 km of our hypermarket in Kattathurai.'
  },
  {
    id: 'w5',
    title: 'Customized Gifts Available',
    description: 'Custom photo mugs, gift hampers, teddy bears with names, and personalized celebration boxes.'
  }
];

export const LOCATIONS = [
  { id: 'loc-1', name: 'Alphonsa Hypermarket Main Store', city: 'Kattathurai', status: 'Open Now • Closes 10:00 PM' }
];
