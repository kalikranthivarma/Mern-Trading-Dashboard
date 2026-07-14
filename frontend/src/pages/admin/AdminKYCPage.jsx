import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, FileText, Search, ExternalLink, Filter, Loader2, X, Image as ImageIcon } from 'lucide-react';

const AdminKYCPage = () => {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');

  // Modal State
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchKycs = async () => {
    try {
      const { data } = await api.get('/admin/kyc/pending', {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      setKycs(data.data || []);
    } catch (error) {
      toast.error('Failed to load KYC requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycs();
  }, []);

  const handleReview = async (userId, status) => {
    if (status === 'rejected' && !rejectReason.trim()) {
      return toast.error("Please provide a reason for rejection.");
    }
    
    setIsProcessing(true);
    try {
      await api.patch(`/admin/kyc/${userId}`, { 
        status, 
        remarks: rejectReason 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      toast.success(`KYC successfully ${status}`);
      setSelectedKyc(null);
      setRejectReason('');
      fetchKycs();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status} KYC`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return import.meta.env.VITE_API_URL?.replace('/api', '') + url;
  };

  const filteredKycs = kycs.filter(k => {
    const matchesTab = k.status === activeTab;
    const matchesSearch = k.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          k.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">KYC Approvals</h1>
          <p className="mt-2 text-slate-400">Review and verify user identity documents.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        {['pending', 'under_review', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab 
                ? 'bg-sky-500 text-white' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.replace('_', ' ').toUpperCase()}
            <span className="ml-2 text-xs opacity-70">
              ({kycs.filter(k => k.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-white capitalize">{activeTab.replace('_', ' ')} Requests</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-900 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-sky-500 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500 bg-slate-900/50">
                <th className="p-4 font-medium">User Details</th>
                <th className="p-4 font-medium">Submitted On</th>
                <th className="p-4 font-medium">Documents</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">Loading requests...</td></tr>
              ) : filteredKycs.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">No {activeTab.replace('_', ' ')} requests found.</td></tr>
              ) : (
                filteredKycs.map((kyc) => (
                  <tr key={kyc._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-medium text-white">{kyc.user?.name}</p>
                      <p className="text-xs text-slate-500">{kyc.user?.email}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(kyc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {kyc.documents?.identityDocument && <span className="text-xs px-2 py-1 bg-white/5 rounded text-sky-400">ID Document</span>}
                        {kyc.documents?.panCard && <span className="text-xs px-2 py-1 bg-white/5 rounded text-sky-400">PAN</span>}
                        {kyc.documents?.aadhaarFront && <span className="text-xs px-2 py-1 bg-white/5 rounded text-sky-400">Aadhaar</span>}
                        {kyc.documents?.selfie && <span className="text-xs px-2 py-1 bg-white/5 rounded text-sky-400">Selfie</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedKyc(kyc)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-sm font-medium transition-colors"
                      >
                        <FileText size={16} /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedKyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-semibold text-white">Review KYC: {selectedKyc.user?.name}</h3>
                <p className="text-sm text-slate-400">{selectedKyc.user?.email}</p>
              </div>
              <button onClick={() => setSelectedKyc(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <h4 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Uploaded Documents</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {Object.entries(selectedKyc.documents || {}).map(([key, url]) => {
                  if (!url) return null;
                  const isPdf = url.endsWith('.pdf');
                  return (
                    <div key={key} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                      <span className="text-sm font-medium text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      
                      <div className="relative group overflow-hidden rounded-xl bg-slate-950 aspect-video flex items-center justify-center cursor-pointer border border-white/10"
                           onClick={() => setPreviewDoc({ url: getFullUrl(url), type: isPdf ? 'pdf' : 'image', name: key })}>
                        {isPdf ? (
                          <div className="flex flex-col items-center text-rose-400">
                            <FileText size={32} />
                            <span className="text-xs mt-2 font-medium">PDF Document</span>
                          </div>
                        ) : (
                          <img src={getFullUrl(url)} alt={key} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ExternalLink className="text-white" size={24} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedKyc.status !== 'approved' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Rejection Remarks (Required for rejection)</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="E.g., The PAN card image is blurry. Please upload a clear photo."
                    className="w-full h-24 rounded-2xl bg-slate-950 border border-white/10 p-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-slate-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedKyc(null)}
                className="px-6 py-2.5 rounded-full bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              
              {selectedKyc.status !== 'approved' && (
                <>
                  <button 
                    onClick={() => handleReview(selectedKyc.user._id, 'rejected')}
                    disabled={isProcessing || !rejectReason.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-500/10 text-rose-400 font-medium hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />} Reject
                  </button>
                  <button 
                    onClick={() => handleReview(selectedKyc.user._id, 'approved')}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Size Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4" onClick={() => setPreviewDoc(null)}>
          <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={() => setPreviewDoc(null)}>
            <X size={24} />
          </button>
          
          <div className="w-full max-w-5xl h-[80vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {previewDoc.type === 'pdf' ? (
              <iframe src={previewDoc.url} className="w-full h-full rounded-2xl bg-white" title={previewDoc.name} />
            ) : (
              <img src={previewDoc.url} alt={previewDoc.name} className="max-w-full max-h-full object-contain rounded-2xl" />
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminKYCPage;
