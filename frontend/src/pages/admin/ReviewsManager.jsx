import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, Search, ChevronDown } from 'lucide-react';
import * as adminApi from '../../services/adminApi';
import { toast, Toaster } from 'sonner';

const STATUS_STYLES = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

export default function ReviewsManager() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // reviewId being acted on

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAdminReviews(page, pageSize, statusFilter);
      if (res.success) {
        setReviews(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [page, statusFilter]);

  const handleModerate = async (reviewId, newStatus) => {
    setActionLoading(reviewId);
    try {
      await adminApi.moderateReview(reviewId, newStatus);
      toast.success(`Review ${newStatus}`);
      // Optimistically update UI
      setReviews(prev =>
        prev.map(r => r.id === reviewId ? { ...r, status: newStatus } : r)
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Permanently delete this review?')) return;
    setActionLoading(reviewId);
    try {
      await adminApi.adminDeleteReview(reviewId);
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setTotal(t => Math.max(0, t - 1));
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Toaster position="bottom-right" richColors />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Review Moderation</h1>
        <p className="text-slate-500 text-sm mt-1">Approve or reject customer product reviews before they go live.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-3">
          <select
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="ml-auto text-sm text-slate-500 flex items-center">
            {total} review{total !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Rating</th>
                <th className="p-4 font-semibold">Review</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const product = review.products || {};
                  const isProcessing = actionLoading === review.id;
                  return (
                    <tr key={review.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Product */}
                      <td className="p-4">
                        <div className="flex items-center gap-3 max-w-[180px]">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0" />
                          )}
                          <span className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight">
                            {product.name || 'Unknown Product'}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <p className="text-sm font-medium text-slate-700">
                          {review.profiles?.full_name || 'Customer'}
                        </p>
                      </td>

                      {/* Rating */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-1">{review.rating}</span>
                        </div>
                      </td>

                      {/* Review Content */}
                      <td className="p-4 max-w-[260px]">
                        {review.title && (
                          <p className="text-sm font-bold text-slate-900 mb-0.5">{review.title}</p>
                        )}
                        <p className="text-sm text-slate-500 line-clamp-2">{review.body || '—'}</p>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[review.status] || ''}`}>
                          {review.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4">
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {review.status !== 'approved' && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleModerate(review.id, 'approved')}
                              title="Approve"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {review.status !== 'rejected' && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleModerate(review.id, 'rejected')}
                              title="Reject"
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            disabled={isProcessing}
                            onClick={() => handleDelete(review.id)}
                            title="Delete permanently"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > pageSize && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-600">
              Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-100 transition"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-100 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
