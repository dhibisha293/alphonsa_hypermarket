import React, { useState, useEffect } from 'react';
import { getOrders, getDeliveryAssignments, getDeliveryStaff, assignDelivery, updateDelivery, unassignDelivery } from '../../services/adminApi';
import { Truck, Package, Search, MapPin, User, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DeliveryManager() {
  const [activeTab, setActiveTab] = useState('unassigned'); // 'unassigned' | 'assigned'
  const [loading, setLoading] = useState(true);
  
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [assignForm, setAssignForm] = useState({ staff_user_id: '', notes: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, assignRes] = await Promise.all([
        getDeliveryStaff(),
        getDeliveryAssignments()
      ]);
      setStaffList(staffRes.data || []);
      const assignedList = assignRes.data || [];
      setAssignments(assignedList);

      if (activeTab === 'unassigned') {
        // Fetch recent orders
        const ordersRes = await getOrders(1, 50); // Fetch up to 50 for admin assigning
        const allOrders = ordersRes.data?.items || [];
        
        // Filter out orders that already have an assignment
        const assignedOrderIds = assignedList.map(a => a.order_id);
        const unassigned = allOrders.filter(o => 
          !assignedOrderIds.includes(o.id) && 
          ['confirmed', 'packing', 'dispatched'].includes(o.status)
        );
        setUnassignedOrders(unassigned);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (order) => {
    setSelectedOrder(order);
    setAssignForm({ staff_user_id: '', notes: '' });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.staff_user_id) return toast.error("Select a staff member");
    
    try {
      await assignDelivery({
        order_id: selectedOrder.id,
        staff_user_id: assignForm.staff_user_id,
        notes: assignForm.notes
      });
      toast.success("Delivery assigned successfully!");
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to assign delivery");
    }
  };

  const handleStatusUpdate = async (assignmentId, newStatus) => {
    try {
      await updateDelivery(assignmentId, { status: newStatus });
      toast.success("Delivery status updated!");
      setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status: newStatus } : a));
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED': return 'bg-purple-100 text-purple-800';
      case 'PICKED_UP': return 'bg-amber-100 text-amber-800';
      case 'OUT_FOR_DELIVERY': return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[500px]">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" /> Delivery Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">Assign orders to delivery staff and track progress.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('unassigned')}
            className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'unassigned' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Package className="w-4 h-4" /> Unassigned Orders
            {unassignedOrders.length > 0 && activeTab === 'unassigned' && (
              <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px]">{unassignedOrders.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'assigned' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Truck className="w-4 h-4" /> Active Deliveries
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="p-6 overflow-x-auto">
          {activeTab === 'unassigned' ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Order No</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unassignedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <CheckCircle2 className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                      <p className="text-slate-500 font-bold">All caught up!</p>
                      <p className="text-xs text-slate-400 mt-1">No unassigned orders waiting for delivery.</p>
                    </td>
                  </tr>
                ) : unassignedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-mono font-bold text-slate-800">{order.order_number}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{order.profiles?.full_name || 'Guest'}</div>
                      <div className="text-xs text-slate-500">{order.profiles?.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2 max-w-xs whitespace-normal">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-600 line-clamp-2">{order.delivery_address || 'No address provided'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button 
                        onClick={() => handleAssignClick(order)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                      >
                        Assign Driver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Order No</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Assigned On</th>
                  <th className="px-4 py-3">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-500">
                      <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="font-bold text-slate-600">No active deliveries</p>
                    </td>
                  </tr>
                ) : assignments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-mono font-bold text-slate-800">
                      {a.orders?.order_number || 'Unknown'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 font-semibold text-slate-700">
                        <User className="w-4 h-4 text-slate-400" />
                        {a.profiles?.full_name || 'Unknown Staff'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs">
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <select 
                        className={`text-xs font-bold rounded-lg px-2 py-1.5 border-0 ring-1 ring-inset cursor-pointer focus:ring-2 focus:ring-emerald-500 ${getStatusBadge(a.status)}`}
                        value={a.status}
                        onChange={(e) => handleStatusUpdate(a.id, e.target.value)}
                      >
                        <option value="ASSIGNED">Assigned</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="PICKED_UP">Picked Up</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="FAILED">Failed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Assign Delivery</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <div className="p-5">
              <div className="bg-slate-50 p-3 rounded-lg mb-4 border border-slate-100 text-sm">
                <p><span className="text-slate-500">Order:</span> <span className="font-mono font-bold">{selectedOrder.order_number}</span></p>
                <p className="mt-1"><span className="text-slate-500">Customer:</span> <span className="font-semibold">{selectedOrder.profiles?.full_name}</span></p>
                <p className="mt-2 text-xs text-slate-600 line-clamp-2"><MapPin className="w-3 h-3 inline mr-1"/>{selectedOrder.delivery_address}</p>
              </div>

              <form id="assignForm" onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Driver *</label>
                  <select 
                    required
                    value={assignForm.staff_user_id}
                    onChange={(e) => setAssignForm({ ...assignForm, staff_user_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">-- Choose Staff Member --</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.full_name || staff.id}</option>
                    ))}
                  </select>
                  {staffList.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No delivery staff found. Ensure staff have DELIVERY_STAFF role.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Internal Notes</label>
                  <textarea 
                    rows="2"
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="Instructions for the driver..."
                  />
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button form="assignForm" type="submit" disabled={!assignForm.staff_user_id} className="px-4 py-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50 transition-colors">Assign Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
