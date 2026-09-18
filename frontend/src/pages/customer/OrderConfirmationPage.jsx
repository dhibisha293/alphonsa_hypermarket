import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../../services/api';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrder(id);
        setOrder(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-600">Loading order details...</div>;
  if (error || !order) return <div className="p-10 text-center text-red-600">Failed to load order: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">Thank you for shopping with Alphonsa Hypermarket.</p>
        
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="font-semibold text-gray-900">{order.order?.order_number || order.order_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-semibold text-gray-900">₹{(order.order?.total || order.total).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Method</p>
            <p className="font-semibold text-gray-900">{order.order?.payment_method || order.payment_method}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Delivery Method</p>
            <p className="font-semibold text-gray-900">{order.order?.delivery_method || order.delivery_method}</p>
          </div>
          {((order.order?.delivery_date || order.delivery_date) || (order.order?.delivery_time_slot || order.delivery_time_slot)) && (
            <div className="col-span-2 mt-2 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Scheduled Delivery</p>
              <p className="font-semibold text-gray-900">
                {order.order?.delivery_date || order.delivery_date || 'Any Date'} 
                {' | '} 
                {order.order?.delivery_time_slot || order.delivery_time_slot || 'Any Time'}
              </p>
            </div>
          )}
        </div>

        {(order.order?.payment_method === 'UPI' || order.payment_method === 'UPI') && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 text-left text-emerald-800">
            <h3 className="font-bold text-lg mb-2">Action Required: Complete Your UPI Payment</h3>
            <p className="mb-4">Your order is placed, but we need to verify your payment. Please scan the QR code below or pay to our UPI ID: <strong>alphonsa@upi</strong></p>
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-emerald-100 w-48 mx-auto mb-4">
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-400 font-medium mb-2">
                [ QR CODE ]
              </div>
              <p className="text-xs font-mono">alphonsa@upi</p>
            </div>
            <p className="text-sm text-center">Once paid, your order status will be updated to Confirmed. If payment is not received within 1 hour, your order may be cancelled.</p>
          </div>
        )}

        <div className="flex space-x-4 justify-center">
          <Link to="/" className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200">
            Continue Shopping
          </Link>
          <Link
            to={`/account/orders/${id}`}
            className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
