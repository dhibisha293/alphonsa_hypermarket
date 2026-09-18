import React, { useEffect, useState } from 'react';
import { getRefunds, processRefund } from '../../services/adminApi';
import { Loader2, RefreshCcw, Search, PackageOpen, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RefundsManager() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('REQUESTED'); // REQUESTED, COMPLETED, REJECTED
  
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRefunds();
  }, [filter]);

  const fetchRefunds = () => {
    setLoading(true);
    getRefunds(filter)
      .then(res => setRefunds(res.data || []))
      .catch(err => toast.error(err.message || "Failed to load refunds"))
      .finally(() => setLoading(false));
  };

  const handleProcessRefund = async (orderId, action) => {
    if (action === 'REJECT' && !rejectReason) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      setProcessing(true);
      await processRefund(orderId, action, action === 'REJECT' ? rejectReason : null);
      toast.success(`Refund ${action.toLowerCase()} successfully`);
      setSelectedRefund(null);
      setRejectReason('');
      fetchRefunds(); // Refresh list
    } catch (err) {
      toast.error(err.message || 'Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Refunds Management</h2>
          <p className="text-xs text-slate-500 mt-1">Review and process customer refund requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium text-slate-700"
          >
            <option value="REQUESTED">Pending Requests</option>
            <option value="COMPLETED">Completed Refunds</option>
            <option value="REJECTED">Rejected Requests</option>
            <option value="PROCESSING">Processing</option>
          </select>
          <button onClick={fetchRefunds} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Order No.</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date Requested</th>
              <th className="px-6 py-4 text-right">Refund Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
                    <p className="text-sm">Loading refunds...</p>
                  </div>
                </td>
              </tr>
            ) : refunds.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <PackageOpen className="w-12 h-12 mb-3 text-slate-300" />
                    <h3 className="text-base font-bold text-slate-700">No refunds found</h3>
                    <p className="text-sm mt-1">There are no {filter.toLowerCase()} refunds at the moment.</p>
                  </div>
                </td>
              </tr>
            ) : (
              refunds.map(refund => (
                <tr key={refund.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{refund.order_number}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {refund.customer_name || 'Guest'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(refund.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">
                    ₹{Number(refund.refund_amount || refund.total).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      refund.refund_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      refund.refund_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {refund.refund_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedRefund(refund)}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedRefund && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Review Refund Request</h3>
              <p className="text-xs text-slate-500 mt-1">Order: {selectedRefund.order_number}</p>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Refund Amount</span>
                <span className="font-bold text-slate-900">₹{Number(selectedRefund.refund_amount || selectedRefund.total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-bold text-slate-900">{selectedRefund.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-slate-900">{selectedRefund.status.toUpperCase()}</span>
              </div>
              {selectedRefund.cancelled_by && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Cancelled By</span>
                  <span className="font-bold text-slate-900">{selectedRefund.cancelled_by}</span>
                </div>
              )}
              {selectedRefund.refund_reason && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-1">Reason:</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedRefund.refund_reason}</p>
                </div>
              )}

              {filter === 'REQUESTED' && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Rejection Reason (Optional, required if rejecting):</label>
                  <input 
                    type="text" 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="E.g., Item was used"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => handleProcessRefund(selectedRefund.id, 'APPROVE')}
                      disabled={processing}
                      className="flex-1 flex justify-center items-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve Refund
                    </button>
                    <button 
                      onClick={() => handleProcessRefund(selectedRefund.id, 'REJECT')}
                      disabled={processing}
                      className="flex-1 flex justify-center items-center gap-2 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg text-sm font-bold"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
              <button 
                onClick={() => setSelectedRefund(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg"
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
