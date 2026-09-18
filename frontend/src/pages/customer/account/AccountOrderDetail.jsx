import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { Package, ArrowLeft, CheckCircle2, Truck, Clock, MapPin, Receipt } from 'lucide-react';
import * as api from '../../../services/api';

export default function AccountOrderDetail() {
  const { id } = useParams();
  const { triggerToast } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await api.getOrder(id);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        triggerToast("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, triggerToast]);

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading order details...</div>;
  }

  if (!data || !data.order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-slate-500 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/account/orders" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90">
          Back to Orders
        </Link>
      </div>
    );
  }

  const { order, items } = data;

  // Timeline logic
  const statuses = ['pending', 'confirmed', 'packing', 'dispatched', 'delivered'];
  const currentIndex = statuses.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div>
      <div className="mb-6">
        <Link to="/account/orders" className="text-sm font-medium text-slate-500 hover:text-primary flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-slate-500 mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider self-start md:self-auto
            ${isCancelled ? 'bg-red-100 text-red-700' : 
              order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
          `}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 overflow-x-auto">
        {isCancelled ? (
          <div className="text-center text-red-600 font-bold py-4">
            This order has been cancelled.
          </div>
        ) : (
          <div className="relative flex justify-between items-center min-w-[600px] py-4">
            {/* Connecting Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500" 
              style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
            />
            
            {/* Steps */}
            {[
              { id: 'pending', label: 'Order Placed', icon: Receipt },
              { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
              { id: 'packing', label: 'Packing', icon: Package },
              { id: 'dispatched', label: 'Dispatched', icon: Truck },
              { id: 'delivered', label: 'Delivered', icon: MapPin },
            ].map((step, idx) => {
              const isActive = currentIndex >= idx;
              return (
                <div key={step.id} className="relative flex flex-col items-center gap-3 z-10 w-24">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors
                    ${isActive ? 'bg-primary text-primary-foreground' : 'bg-slate-200 text-slate-400'}
                  `}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold text-center ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-400" /> Items ordered
            </h3>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 py-4 border-b border-slate-200 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0">
                    {/* Placeholder since image isn't saved in order_items yet */}
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <Package className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{item.product_name}</h4>
                    <p className="text-sm text-slate-500 mt-1">Qty: {item.quantity} × ₹{item.unit_price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">₹{(item.quantity * item.unit_price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Info */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.promo_code && `(${order.promo_code})`}</span>
                  <span>-₹{order.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span>₹{order.shipping_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span>₹{order.tax_amount.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-lg text-slate-900">
                <span>Total</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 mt-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> Delivery Address
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {order.delivery_address || 'Address not provided'}
              </p>
            </div>
            
            <div className="pt-6 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Scheduled Delivery
              </h3>
              <p className="text-sm text-slate-600">
                {order.delivery_method === 'home_delivery' || order.delivery_method === 'DELIVERY'
                  ? (
                      <>
                        {order.delivery_date || 'Any Date'} 
                        {' | '} 
                        {order.delivery_time_slot || 'Any Time'}
                      </>
                    )
                  : 'Store Pickup'}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-400" /> Payment & Refund
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  Method: <span className="font-semibold uppercase">{order.payment_method?.replace('_', ' ') || 'CASH'}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Payment Status: <span className="font-semibold uppercase">{order.payment_status || 'PENDING'}</span>
                </p>
                {order.refund_status && order.refund_status !== 'NONE' && (
                  <p className="text-sm mt-2 p-2 bg-amber-50 text-amber-800 rounded border border-amber-200">
                    Refund Status: <strong>{order.refund_status}</strong>
                  </p>
                )}
                {order.refund_reason && (
                  <p className="text-xs text-slate-500 mt-1">Note: {order.refund_reason}</p>
                )}
              </div>
            </div>
            
            {(order.status === 'pending' || order.status === 'confirmed') && (
              <div className="pt-6 border-t border-slate-200">
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to cancel this order?')) {
                      try {
                        await api.cancelOrder(order.id);
                        triggerToast("Order cancelled successfully");
                        window.location.reload(); // Refresh the page to show cancelled state
                      } catch (err) {
                        triggerToast(err.message || 'Failed to cancel order');
                      }
                    }
                  }}
                  className="w-full py-2 bg-red-50 text-red-600 font-bold rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                >
                  Cancel Order
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Cancellation is only available before the order is packed.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
