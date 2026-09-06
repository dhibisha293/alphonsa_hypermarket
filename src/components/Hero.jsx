import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight, MapPin, Truck, Gift, CheckCircle2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85',
    tile: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=85',
    label: 'FRESH MARKET PICKS',
    title: 'Fresh choices for every kind of day.',
    tileLabel: 'Farm fresh'
  },
  {
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85',
    tile: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=85',
    label: 'BAKED FRESH TODAY',
    title: 'Little moments taste better here.',
    tileLabel: 'Sweet treats'
  },
  {
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1000&q=85',
    tile: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=500&q=85',
    label: 'GIFTS WITH HEART',
    title: 'Make every celebration special.',
    tileLabel: 'Made for you'
  }
];

export default function Hero({ onShopNow, onExploreCategories }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = heroSlides[activeSlide];

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide(current => (current + 1) % heroSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const changeSlide = (direction) => {
    setActiveSlide(current => (current + direction + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="hero-stage py-8 md:py-12 bg-[#FFF8F5]">
      <div className="container-custom">
        {/* Soft Green Gradient Container with Rounded Corners */}
        <div className="hero-panel relative overflow-hidden border border-[#8E1B1B] rounded-3xl p-6 sm:p-10 md:p-14 shadow-sm">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-fade-in">
              
              {/* Three Promotional Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <span className="badge-light-green flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0B3D20] fill-[#39FF14]" />
                  <span>WELCOME TO ALPHONSA HYPERMARKET</span>
                </span>
                <span className="badge-light-green flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#0B3D20]" />
                  <span>🚚 FREE DELIVERY UP TO 3 KM</span>
                </span>
                <span className="badge-light-green flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-[#0B3D20]" />
                  <span>🎁 CUSTOMIZED GIFTS AVAILABLE</span>
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-[#111111]">
                Everything Your Family Needs.{' '}
                <span className="text-[#0B3D20] block sm:inline">
                  All Under One Roof.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                From everyday groceries and fresh produce to bakery treats, fashion, beauty, toys and gifts — discover more at Alphonsa Hypermarket, Kattathurai.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button 
                  onClick={onShopNow}
                  className="w-full sm:w-auto btn-neon text-sm py-3.5 px-8 font-bold flex items-center justify-center gap-2.5 shadow-md shadow-[#39FF14]/30"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button 
                  onClick={onExploreCategories}
                  className="w-full sm:w-auto btn-secondary-white text-sm py-3.5 px-7 font-bold flex items-center justify-center gap-2"
                >
                  <span>Explore Categories</span>
                </button>
              </div>

              {/* Bullet Features */}
              <div className="pt-6 border-t border-[#E5E7E5] grid grid-cols-3 gap-3 text-left max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0B3D20] shrink-0" />
                  <span className="text-xs font-bold text-[#111111]">100% Organic Fresh</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0B3D20] shrink-0" />
                  <span className="text-xs font-bold text-[#111111]">Daily Low Prices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0B3D20] shrink-0" />
                  <span className="text-xs font-bold text-[#111111]">Express 3KM Delivery</span>
                </div>
              </div>

            </div>

            {/* Right Column: Fresh-market collage */}
            <div className="lg:col-span-5 relative flex justify-center hero-collage-wrap">
              <div className="hero-collage w-full max-w-md">
                <div className="hero-collage-main group">
                  <img
                        key={slide.image}
                        src={slide.image}
                        alt={slide.title}
                  />
                      <div className="hero-collage-wash"></div>
                  <div className="hero-collage-copy">
                        <span>{slide.label}</span>
                        <strong>{slide.title}</strong>
                  </div>
                </div>
                <div className="hero-tile hero-tile-fruit">
                      <img key={slide.tile} src={slide.tile} alt={slide.tileLabel} />
                      <span>{slide.tileLabel}</span>
                </div>
                    <div className="hero-carousel-controls">
                      <button onClick={() => changeSlide(-1)} aria-label="Previous highlight"><ChevronLeft className="w-4 h-4" /></button>
                      <div className="hero-carousel-dots">
                        {heroSlides.map((item, index) => <button key={item.label} onClick={() => setActiveSlide(index)} className={index === activeSlide ? 'active' : ''} aria-label={`Show ${item.label.toLowerCase()}`} />)}
                      </div>
                      <button onClick={() => changeSlide(1)} aria-label="Next highlight"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                <div className="hero-float-note">
                  <Sparkles className="w-4 h-4" />
                  <div><strong>22 departments</strong><small>one happy stop</small></div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
