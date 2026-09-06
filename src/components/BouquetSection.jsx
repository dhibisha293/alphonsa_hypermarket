import React, { useState } from 'react';
import { Flower2, Gift, Heart, MessageCircle, Sparkles } from 'lucide-react';

const bouquetStyles = [
  { name: 'Rose Romance', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=700&q=85', price: 799 },
  { name: 'Sunshine Mix', image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=700&q=85', price: 699 },
  { name: 'Elegant Lily', image: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=700&q=85', price: 899 }
];

const bouquetColors = [
  { name: 'Ruby Red', value: '#c62828' },
  { name: 'Golden Yellow', value: '#d4a017' },
  { name: 'Blush Pink', value: '#e9a2a2' },
  { name: 'Classic White', value: '#f4eee7' }
];

export default function BouquetSection({ onAddToCart, onTriggerToast }) {
  const [styleIndex, setStyleIndex] = useState(0);
  const [color, setColor] = useState(bouquetColors[0]);
  const [size, setSize] = useState('Standard');
  const [message, setMessage] = useState('');
  const style = bouquetStyles[styleIndex];
  const price = style.price + (size === 'Grand' ? 300 : size === 'Deluxe' ? 150 : 0);

  const addBouquet = () => {
    onAddToCart({
      id: `bouquet-${styleIndex}-${size}-${color.name}`,
      name: `${style.name} Bouquet - ${size}`,
      category: 'customized-gifts',
      categoryLabel: 'Custom Bouquet',
      price,
      originalPrice: price,
      discount: 0,
      rating: 5,
      reviews: 0,
      image: style.image,
      unit: `${size} bouquet`,
      description: `${color.name} bouquet${message ? ` with message: ${message}` : ''}`
    });
    onTriggerToast('Customized bouquet added to your cart!');
  };

  return (
    <section id="bouquet-customization" className="bouquet-section py-14">
      <div className="container-custom">
        <div className="bouquet-layout">
          <div className="bouquet-gallery">
            <div className="bouquet-image-wrap">
              <img src={style.image} alt={style.name} />
              <span className="bouquet-badge"><Sparkles className="w-3.5 h-3.5" /> Made for your moment</span>
              <div className="bouquet-image-caption"><Flower2 className="w-5 h-5" /><span>Freshly arranged in Kattathurai</span></div>
            </div>
            <div className="bouquet-thumbnails">
              {bouquetStyles.map((item, index) => (
                <button key={item.name} onClick={() => setStyleIndex(index)} className={index === styleIndex ? 'selected' : ''} aria-label={`Choose ${item.name}`}>
                  <img src={item.image} alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className="bouquet-copy">
            <span className="bouquet-eyebrow"><Gift className="w-4 h-4" /> CUSTOM BOUQUETS</span>
            <h2>Say it with<br /><em>something beautiful.</em></h2>
            <p>Choose your flowers, colours and size. Add a personal note and we will prepare a memorable bouquet for birthdays, anniversaries and every little celebration.</p>

            <div className="bouquet-option">
              <div className="bouquet-option-heading"><strong>01 / Pick a style</strong><span>{style.name}</span></div>
              <div className="bouquet-style-buttons">
                {bouquetStyles.map((item, index) => <button key={item.name} onClick={() => setStyleIndex(index)} className={index === styleIndex ? 'active' : ''}>{item.name}</button>)}
              </div>
            </div>

            <div className="bouquet-option">
              <div className="bouquet-option-heading"><strong>02 / Choose a colour</strong><span>{color.name}</span></div>
              <div className="bouquet-colors">
                {bouquetColors.map(item => <button key={item.name} onClick={() => setColor(item)} className={item.name === color.name ? 'active' : ''} style={{ backgroundColor: item.value }} aria-label={item.name} />)}
              </div>
            </div>

            <div className="bouquet-option">
              <div className="bouquet-option-heading"><strong>03 / Select a size</strong><span>{size}</span></div>
              <div className="bouquet-size-buttons">
                {['Standard', 'Deluxe', 'Grand'].map(item => <button key={item} onClick={() => setSize(item)} className={item === size ? 'active' : ''}>{item}</button>)}
              </div>
            </div>

            <label className="bouquet-message"><MessageCircle className="w-4 h-4" /><input value={message} onChange={event => setMessage(event.target.value)} placeholder="Add a short message (optional)" maxLength={42} /></label>
            <div className="bouquet-footer"><div><small>Starting from</small><strong>₹{price}</strong></div><button onClick={addBouquet} className="btn-neon"><Heart className="w-4 h-4" /> Add My Bouquet</button></div>
          </div>
        </div>
      </div>
    </section>
  );
}
