import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag, Sparkles, CheckCircle2, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../services/api';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem,
  onClearCart,
  currentUser,
  onOrderPlaced,
  triggerToast
}) {
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [pointsRedeemed, setPointsRedeemed] = useState(0);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const freeShippingThreshold = 499;
  const shippingFee = subtotal >= freeShippingThreshold || cartItems.length === 0 ? 0 : 40;
  const discountAmount = Math.round((subtotal * discount) / 100);
  const total = Math.max(0, subtotal - discountAmount - pointsRedeemed + shippingFee);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await api.validatePromo(promoCode);
      if (res.success && res.data?.valid) {
        setDiscount(res.data.discount_pct);
        setAppliedCode(promoCode.toUpperCase());
        if (triggerToast) triggerToast(res.data.message);
      } else {
        if (triggerToast) triggerToast('Invalid promo code. Try: SUPER30 or FRUIT20');
      }
    } catch (_) {
      if (triggerToast) triggerToast('Could not validate code. Try again.');
    }
  };
  const handleCheckout = async () => {
    if (!currentUser) {
      if (triggerToast) triggerToast('Please sign in to place an order');
      return;
    }
    setIsCheckingOut(true);
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity
        })),
        promo_code: appliedCode || null,
        points_redeemed: pointsRedeemed || 0,
      };
      const res = await api.placeOrder(orderPayload);
      if (res.success) {
        setPlacedOrderNumber(res.data?.order_number || 'ALPH-' + Math.floor(100000 + Math.random() * 900000));
        setOrderPlaced(true);
        if (onOrderPlaced) onOrderPlaced();
      }
    } catch (err) {
      if (triggerToast) triggerToast(err.message || 'Order failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden relative z-10"
          >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-heading text-white">Your Shopping Cart</h3>
              <p className="text-[11px] text-emerald-400 font-semibold">{cartItems.length} unique items in cart</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderPlaced ? (
          /* Order Confirmation Screen */
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-heading">Order Placed Successfully!</h3>
            <p className="text-slate-600 text-xs leading-relaxed max-w-xs">
              Thank you for shopping at Alphonsa Hypermarket! Order #{placedOrderNumber} has been processed.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs w-full text-left font-mono space-y-1">
              <div>Items Total: ₹{total}</div>
              <div>Estimated Delivery: Today in 45 Mins</div>
              <div className="text-emerald-600 font-bold">Status: Packing & Dispatching</div>
            </div>
            <button 
              onClick={() => {
                onClearCart();
                setOrderPlaced(false);
                onClose();
              }}
              className="btn-neon w-full py-3 text-xs font-bold"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Free Delivery Meter */}
            <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-200 text-xs">
              {subtotal >= freeShippingThreshold ? (
                <div className="text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>🎉 Congratulations! You unlocked FREE Home Delivery!</span>
                </div>
              ) : (
                <div className="text-slate-700 font-medium text-center">
                  Add <span className="font-bold text-emerald-700">₹{freeShippingThreshold - subtotal}</span> more for FREE Delivery!
                  <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-20 px-6 space-y-4">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <ShoppingCart className="w-10 h-10 text-slate-300" />
                  </motion.div>
                  <h3 className="font-heading font-extrabold text-xl text-slate-800">Your cart is feeling a bit light!</h3>
                  <p className="text-sm text-slate-500 pb-6">Explore our fresh groceries, delicious cakes, and exclusive customized gifts to fill it up.</p>
                  <button onClick={onClose} className="btn-neon w-full py-3.5 text-sm font-bold shadow-lg shadow-emerald-500/20">
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 items-center justify-between">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 block mb-1">{item.unit}</span>
                      <div className="font-extrabold text-sm text-slate-900 font-heading">
                        ₹{item.price} <span className="text-[10px] text-slate-400 font-normal">x {item.quantity}</span>
                      </div>
                    </div>

                    {/* Quantity Adjustment Controls */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full p-1">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
                
                {/* Promo Code Box */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter Code (e.g. SUPER30)"
                    className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono uppercase"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    className="btn-outline text-xs py-2 px-4 shrink-0"
                  >
                    Apply
                  </button>
                </div>

                {appliedCode && (
                  <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-lg flex justify-between">
                    <span>Code '{appliedCode}' Applied ({discount}% OFF)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                {/* Loyalty Points Redeem */}
                {currentUser && currentUser.loyalty_points > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-orange-700">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-bold">You have {currentUser.loyalty_points} points</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="0"
                        max={Math.min(currentUser.loyalty_points, subtotal - discountAmount)}
                        value={pointsRedeemed}
                        onChange={(e) => setPointsRedeemed(Math.max(0, Math.min(Number(e.target.value) || 0, currentUser.loyalty_points, subtotal - discountAmount)))}
                        className="w-16 text-xs py-1 px-2 border border-orange-200 rounded-md text-center focus:outline-none focus:border-orange-500"
                        placeholder="0"
                      />
                      <button 
                        onClick={() => {
                          // Simple max out
                          setPointsRedeemed(Math.min(currentUser.loyalty_points, subtotal - discountAmount));
                        }}
                        className="text-[10px] bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded font-bold transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                )}
                {pointsRedeemed > 0 && (
                  <div className="text-[11px] text-orange-700 font-bold px-1 flex justify-between">
                    <span>Points Redeemed ({pointsRedeemed})</span>
                    <span>-₹{pointsRedeemed}</span>
                  </div>
                )}

                {/* Subtotal Calculations */}
                <div className="space-y-1 text-xs text-slate-600 font-medium pt-1">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                     <div className="flex justify-between text-emerald-600">
                      <span>Promo Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  {pointsRedeemed > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Loyalty Discount</span>
                      <span>-₹{pointsRedeemed}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span>{shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900 font-heading">
                    <span>Grand Total</span>
                    <span className="text-emerald-600 text-base">₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full btn-neon py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                >
                  {isCheckingOut ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </div>
            )}
          </>
        )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
