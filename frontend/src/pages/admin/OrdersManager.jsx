import React, { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, updatePaymentStatus } from '../../services/adminApi';
import { Loader2, Search, PackageOpen, Eye, X, MapPin, Receipt, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const pageSize = 20;
  
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchOrders = (currentPage) => {
    setLoading(true);
    getOrders(currentPage, pageSize)
      .then(res => {
        setOrders(res.data?.items || []);
        setTotalOrders(res.data?.total || 0);
      })
      .catch(err => toast.error(err.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated!");
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'packing': return 'bg-purple-100 text-purple-800';
      case 'dispatched': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Orders Management</h2>
          <p className="text-xs text-slate-500 mt-1">Review orders, update statuses, and check shipping details.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Order No.</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <PackageOpen className="w-12 h-12 mb-3 text-slate-300" />
                    <h3 className="text-base font-bold text-slate-700">No orders found</h3>
                    <p className="text-sm mt-1">There are currently no orders matching your criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{order.order_number}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{order.profiles?.full_name || 'Guest'}</div>
                    <div className="text-xs text-slate-500">{order.profiles?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">
                    ₹{Number(order.total).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      {order.refund_status && order.refund_status !== 'NONE' && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200">
                          REFUND: {order.refund_status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-1.5 w-auto max-w-[120px]"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packing">Packing</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col divide-y divide-slate-100">
        {orders.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <PackageOpen className="w-10 h-10 mb-2 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1">Check back later for new customer orders.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono font-bold text-slate-900 text-sm">{order.order_number}</div>
                  <div className="text-[11px] text-slate-500">{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{order.profiles?.full_name || 'Guest'}</div>
                  <div className="text-xs text-slate-500">{order.profiles?.email || 'N/A'}</div>
                </div>
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded"
                >
                  <Eye className="w-3 h-3" /> View
                </button>
              </div>

              <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-100">
                <div className="font-bold text-emerald-600 text-base">
                  ₹{Number(order.total).toLocaleString()}
                </div>
                <select 
                  className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 w-auto min-w-[130px]"
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packing">Packing</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
        <span className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-700">{orders.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-700">{Math.min(page * pageSize, totalOrders)}</span> of <span className="font-bold text-slate-700">{totalOrders}</span> orders
        </span>
        <div className="flex gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Previous
          </button>
          <button 
            disabled={page * pageSize >= totalOrders}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  Order Details
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">{selectedOrder.order_number}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* Customer Info */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Receipt className="w-4 h-4" /> Customer
                  </h4>
                  <p className="text-sm font-semibold text-slate-800">{selectedOrder.profiles?.full_name || 'Guest User'}</p>
                  <p className="text-sm text-slate-600 mt-1">{selectedOrder.profiles?.email || 'No email provided'}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-3">
                    <Clock className="w-3 h-3" /> {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Delivery Info */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4" /> Delivery
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedOrder.delivery_address || 'No shipping address provided.'}
                  </p>
                  {(selectedOrder.delivery_date || selectedOrder.delivery_time_slot) && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-bold text-slate-700 mb-1">Scheduled For:</p>
                      <p className="text-xs text-slate-800 font-semibold">
                        {selectedOrder.delivery_date || 'Any Date'} | {selectedOrder.delivery_time_slot || 'Any Time'}
                      </p>
                    </div>
                  )}
                  {selectedOrder.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-bold text-slate-700 mb-1">Order Notes:</p>
                      <p className="text-xs text-slate-600 italic">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.order_items?.map((item, index) => (
                  <div key={index} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <PackageOpen className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{item.product_name}</p>
                      <p className="text-xs text-slate-500">₹{Number(item.unit_price).toLocaleString()} × {item.quantity}</p>
                    </div>
                    <div className="text-right font-bold text-slate-900 text-sm">
                      ₹{Number(item.line_total).toLocaleString()}
                    </div>
                  </div>
                ))}
                {!selectedOrder.order_items?.length && (
                  <p className="text-sm text-slate-500 italic text-center py-4">No items found for this order.</p>
                )}
              </div>

              {/* Totals */}
              <div className="mt-6 border-t border-slate-200 pt-4 flex flex-col items-end space-y-2">
                <div className="flex justify-between w-full max-w-[250px] text-sm text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">₹{Number(selectedOrder.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-full max-w-[250px] text-sm text-slate-600">
                  <span>Shipping Fee:</span>
                  <span className="font-semibold text-slate-800">₹{Number(selectedOrder.shipping_fee).toLocaleString()}</span>
                </div>
                {Number(selectedOrder.discount_amount) > 0 && (
                  <div className="flex justify-between w-full max-w-[250px] text-sm text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-semibold">-₹{Number(selectedOrder.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between w-full max-w-[250px] text-base pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800">Total:</span>
                  <span className="font-black text-emerald-600">₹{Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700 w-24">Order Status:</label>
                  <select 
                    className="bg-white border border-slate-300 text-slate-800 text-sm font-medium rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block px-3 py-1.5 min-w-[140px]"
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packing">Packing</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700 w-24">Payment Status:</label>
                  <select 
                    className="bg-white border border-slate-300 text-slate-800 text-sm font-medium rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block px-3 py-1.5 min-w-[140px]"
                    value={selectedOrder.payment_status || 'PENDING'}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      try {
                        const res = await updatePaymentStatus(selectedOrder.id, newStatus);
                        if (res.success) {
                          setSelectedOrder(prev => ({ ...prev, payment_status: newStatus }));
                          setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, payment_status: newStatus } : o));
                          toast.success("Payment status updated successfully");
                        }
                      } catch (err) {
                        toast.error(err.message || 'Failed to update payment status');
                      }
                    }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
