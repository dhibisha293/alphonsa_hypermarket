import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCart, 
  getAddresses, 
  addAddress, 
  placeOrder, 
  validatePromo 
} from '../../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Checkout State
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('DELIVERY');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Coupon State
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    delivery_instructions: '',
    is_default: false
  });

  const [orderPlacing, setOrderPlacing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cartRes, addressRes] = await Promise.all([
        getCart(),
        getAddresses()
      ]);
      
      if (!cartRes.data?.items?.length) {
        navigate('/cart');
        return;
      }
      
      setCart(cartRes.data);
      setAddresses(addressRes.data || []);
      
      const defaultAddr = addressRes.data?.find(a => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (addressRes.data?.length > 0) setSelectedAddressId(addressRes.data[0].id);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    try {
      setPromoError('');
      const res = await validatePromo(promoCode);
      if (res.data?.valid) {
        setAppliedPromo(res.data);
      } else {
        setPromoError(res.data?.message || 'Invalid coupon');
        setAppliedPromo(null);
      }
    } catch (err) {
      setPromoError(err.message);
      setAppliedPromo(null);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await addAddress(addressForm);
      setAddresses([res.data, ...addresses]);
      setSelectedAddressId(res.data.id);
      setShowAddressForm(false);
      setAddressForm({
        full_name: '', phone: '', address_line: '', area: '', 
        city: '', state: '', pincode: '', delivery_instructions: '', is_default: false
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (deliveryMethod === 'DELIVERY' && !selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }

    try {
      setOrderPlacing(true);
      setError('');
      
      const orderPayload = {
        items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        promo_code: appliedPromo ? promoCode : null,
        address_id: deliveryMethod === 'DELIVERY' ? selectedAddressId : null,
        delivery_address: deliveryMethod === 'PICKUP' ? 'Store Pickup' : null,
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
        delivery_date: deliveryDate || null,
        delivery_time_slot: deliveryTimeSlot || null
      };

      const res = await placeOrder(orderPayload);
      if (res.data) {
        navigate(`/order-confirmation/${res.data.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setOrderPlacing(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-600">Loading checkout...</div>;

  // Calculate optimistic totals (backend is source of truth)
  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'PERCENTAGE') {
      discount = (subtotal * appliedPromo.discount_pct) / 100;
      if (appliedPromo.max_discount && discount > appliedPromo.max_discount) {
        discount = appliedPromo.max_discount;
      }
    } else {
      discount = appliedPromo.discount_value;
    }
  }
  const shipping = (subtotal >= 499 || deliveryMethod === 'PICKUP') ? 0 : 40;
  const tax = (subtotal - discount) * 0.05;
  const total = Math.max(0, subtotal - discount + shipping + tax);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
      
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Delivery Method */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">1. Delivery Method</h2>
            <div className="flex space-x-4">
              <label className={`flex-1 flex items-center p-4 border rounded-lg cursor-pointer ${deliveryMethod === 'DELIVERY' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" name="deliveryMethod" value="DELIVERY" checked={deliveryMethod === 'DELIVERY'} onChange={(e) => setDeliveryMethod(e.target.value)} className="mr-3" />
                <span className="font-medium">Home Delivery</span>
              </label>
              <label className={`flex-1 flex items-center p-4 border rounded-lg cursor-pointer ${deliveryMethod === 'PICKUP' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" name="deliveryMethod" value="PICKUP" checked={deliveryMethod === 'PICKUP'} onChange={(e) => setDeliveryMethod(e.target.value)} className="mr-3" />
                <span className="font-medium">Store Pickup</span>
              </label>
            </div>
          </section>

          {/* Delivery Address */}
          {deliveryMethod === 'DELIVERY' && (
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">2. Delivery Address</h2>
                <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-sm font-medium text-green-600 hover:text-green-700">
                  + Add New Address
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 grid grid-cols-2 gap-4">
                  <input required placeholder="Full Name" className="p-2 border rounded" value={addressForm.full_name} onChange={e => setAddressForm({...addressForm, full_name: e.target.value})} />
                  <input required placeholder="Phone Number" className="p-2 border rounded" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
                  <input required placeholder="Address Line 1" className="col-span-2 p-2 border rounded" value={addressForm.address_line} onChange={e => setAddressForm({...addressForm, address_line: e.target.value})} />
                  <input required placeholder="Area / Landmark" className="p-2 border rounded" value={addressForm.area} onChange={e => setAddressForm({...addressForm, area: e.target.value})} />
                  <input required placeholder="City" className="p-2 border rounded" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                  <input required placeholder="State" className="p-2 border rounded" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                  <input required placeholder="PIN Code" className="p-2 border rounded" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} />
                  <input placeholder="Delivery Instructions (Optional)" className="col-span-2 p-2 border rounded" value={addressForm.delivery_instructions} onChange={e => setAddressForm({...addressForm, delivery_instructions: e.target.value})} />
                  <label className="col-span-2 flex items-center space-x-2">
                    <input type="checkbox" checked={addressForm.is_default} onChange={e => setAddressForm({...addressForm, is_default: e.target.checked})} />
                    <span>Set as default address</span>
                  </label>
                  <div className="col-span-2 flex justify-end space-x-2">
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save Address</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <label key={addr.id} className={`p-4 border rounded-lg cursor-pointer flex items-start space-x-3 ${selectedAddressId === addr.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-1" />
                    <div>
                      <p className="font-semibold">{addr.full_name} {addr.is_default && <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">Default</span>}</p>
                      <p className="text-sm text-gray-600 mt-1">{addr.address_line}, {addr.area}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-gray-600 mt-1">📞 {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Delivery Slot */}
          {deliveryMethod === 'DELIVERY' && (
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">3. Delivery Schedule (Optional)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                  <select value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50">
                    <option value="">Any Date</option>
                    <option value={new Date().toISOString().split('T')[0]}>Today ({new Date().toLocaleDateString()})</option>
                    <option value={new Date(Date.now() + 86400000).toISOString().split('T')[0]}>Tomorrow ({new Date(Date.now() + 86400000).toLocaleDateString()})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                  <select value={deliveryTimeSlot} onChange={(e) => setDeliveryTimeSlot(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50">
                    <option value="">Any Time</option>
                    <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM</option>
                    <option value="06:00 PM - 09:00 PM">06:00 PM - 09:00 PM</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Payment Method */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">{deliveryMethod === 'DELIVERY' ? '4' : '2'}. Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'COD' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="mr-3" />
                <span className="font-medium">Cash on Delivery (COD)</span>
              </label>
              
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'UPI' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="mr-3" />
                <div>
                  <span className="font-medium">UPI / GPay / PhonePe</span>
                  {paymentMethod === 'UPI' && (
                    <div className="mt-2 text-sm text-gray-600 bg-white p-3 rounded border border-green-200">
                      <p>1. Place your order below.</p>
                      <p>2. You will be redirected to the UPI payment verification page.</p>
                      <p>3. Pay to our official UPI ID and submit your UTR reference number.</p>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg opacity-50 cursor-not-allowed border-gray-200">
                <input type="radio" disabled className="mr-3" />
                <span className="font-medium">Credit / Debit Card (Coming Soon)</span>
              </label>
            </div>
          </section>

        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex-1 pr-4">
                    <p className="font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Promo Code" 
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 p-2 border rounded-lg text-sm uppercase"
                  disabled={!!appliedPromo}
                />
                {appliedPromo ? (
                  <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium">Remove</button>
                ) : (
                  <button onClick={handleApplyPromo} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Apply</button>
                )}
              </div>
              {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
              {appliedPromo && <p className="text-green-600 text-xs mt-2">Coupon applied! -₹{discount.toFixed(2)}</p>}
            </div>

            {/* Totals */}
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (Est. 5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-6">
              <span className="font-bold text-lg text-gray-900">Total</span>
              <span className="font-bold text-2xl text-green-600">₹{total.toFixed(2)}</span>
            </div>

            <button 
              onClick={handlePlaceOrder} 
              disabled={orderPlacing}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg flex justify-center items-center ${orderPlacing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 shadow-lg'}`}
            >
              {orderPlacing ? 'Placing Order...' : 'Place Order'}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
