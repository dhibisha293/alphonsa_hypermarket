import React, { useState } from 'react';
import { getPosExportOrders, importPosCsv } from '../../services/adminApi';
import { Download, Upload, Server, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PosSyncManager() {
  const [loading, setLoading] = useState(false);
  
  const handleExportOrders = async () => {
    setLoading(true);
    try {
      const res = await getPosExportOrders();
      const orders = res.data || [];
      if (orders.length === 0) {
        toast.info("No confirmed orders to export.");
        setLoading(false);
        return;
      }
      
      // Convert to CSV
      const headers = ['Order Number', 'Date', 'Customer ID', 'Total', 'Items'];
      const rows = orders.map(o => {
        const itemsStr = o.order_items?.map(i => `${i.products?.barcode}(${i.quantity})`).join('|') || '';
        return [
          o.order_number,
          new Date(o.created_at).toISOString(),
          o.user_id || 'GUEST',
          o.total,
          itemsStr
        ].join(',');
      });
      
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_export_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Orders exported successfully");
    } catch (err) {
      toast.error(err.message || "Failed to export orders");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await importPosCsv(formData);
      toast.success(res.message);
      if (res.data?.not_found_barcodes?.length > 0) {
        toast.warning(`${res.data.not_found_barcodes.length} barcodes not found in system.`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload CSV");
    } finally {
      setLoading(false);
      e.target.value = null; // reset input
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[500px]">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-600" /> POS Integration Hub
        </h2>
        <p className="text-xs text-slate-500 mt-1">Manually sync data between the online store and physical POS system.</p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Orders */}
        <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
          <h3 className="font-bold text-slate-800 mb-2">Export Orders to POS</h3>
          <p className="text-sm text-slate-600 mb-6">Download a CSV of all confirmed online orders to import into your POS system.</p>
          
          <button 
            onClick={handleExportOrders}
            disabled={loading}
            className="w-full bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5" />}
            Download Orders (CSV)
          </button>
        </div>

        {/* Import Inventory */}
        <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
          <h3 className="font-bold text-slate-800 mb-2">Import Inventory from POS</h3>
          <p className="text-sm text-slate-600 mb-6">Upload a CSV containing updated stock quantities from your POS system. Requires columns: <code>barcode, quantity, price</code>.</p>
          
          <label className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Upload className="w-5 h-5" />}
            Upload POS Data (CSV)
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={loading} />
          </label>
        </div>
        
      </div>
      
      <div className="p-6 border-t border-slate-200">
        <h3 className="font-bold text-slate-800 mb-3">API Integration (For Developers)</h3>
        <p className="text-sm text-slate-600 mb-4">You can automate this sync by sending HTTP requests to the following endpoints:</p>
        
        <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-x-auto">
          <div className="mb-3">
            <span className="text-emerald-400 font-bold">POST</span> /admin/pos/sync<br/>
            <span className="text-slate-500">{"// Push JSON inventory updates. Requires SUPER_ADMIN token."}</span><br/>
            {"{"}<br/>
            &nbsp;&nbsp;"items": [<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;{"{"} "barcode": "123456789", "quantity": 50, "price": 10.99 {"}"}<br/>
            &nbsp;&nbsp;]<br/>
            {"}"}
          </div>
          <div>
            <span className="text-blue-400 font-bold">GET</span> /admin/pos/export-orders<br/>
            <span className="text-slate-500">{"// Retrieve confirmed orders."}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
