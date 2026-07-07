import { useEffect, useState } from 'react';
import api from '../services/api';
import { FileText, Download, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/reports');
        setReports(response.data.reports || response.data || []);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleGenerate = (type, format) => {
    const fakeId = Math.random().toString(36).substring(7);
    setGeneratingId(fakeId);
    toast.success(`Requesting ${type} report (${format})...`);

    // Add temporary pending report to list
    const newReport = {
      _id: fakeId,
      type,
      format,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setReports((prev) => [newReport, ...prev]);

    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r._id === fakeId ? { ...r, status: 'ready', fileId: 'mock-file-id' } : r
        )
      );
      setGeneratingId(null);
      toast.success(`${type} report is ready for download!`);
    }, 2500);
  };

  const downloadReport = (report) => {
    toast.success(`Downloading ${report.type} report (${report.format})...`);
    // Create a dummy download link
    const blob = new Blob([`Mock ${report.type} Report File Contents`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.type.toLowerCase()}_report_${Date.now()}.${report.format.toLowerCase() === 'excel' ? 'xlsx' : report.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportCategories = [
    { type: 'Trading', desc: 'Detailed log of executed market & limit orders', formats: ['PDF', 'CSV'] },
    { type: 'Portfolio', desc: 'Holding allocations, cost basis, and P/L metrics', formats: ['Excel', 'PDF'] },
    { type: 'Monthly', desc: 'Summarized monthly ROI, drawdown, and volume', formats: ['PDF'] },
    { type: 'Yearly', desc: 'Compliance audit summary for tax reporting', formats: ['Excel', 'PDF'] }
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Reports & Compliance</h1>
        <p className="mt-2 text-slate-400">Generate and export tax sheets, audit trails, and portfolio performance statements.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Available Templates */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Report Templates</h2>
          <div className="divide-y divide-white/5 space-y-4">
            {reportCategories.map((cat, idx) => (
              <div key={idx} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-white">{cat.type} Report</p>
                  <p className="text-sm text-slate-400 mt-1">{cat.desc}</p>
                </div>
                <div className="flex gap-2">
                  {cat.formats.map((fmt) => (
                    <button
                      key={fmt}
                      disabled={generatingId !== null}
                      onClick={() => handleGenerate(cat.type, fmt)}
                      className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 border border-sky-500/25 px-4 py-2 text-xs font-semibold text-sky-400 hover:bg-sky-500 hover:text-white transition disabled:opacity-50"
                    >
                      <Play className="h-3 w-3" />
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History / Downloads */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Generated Reports Archive</h2>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-400 border-t-transparent"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center p-6 bg-slate-900/30 rounded-2xl">
              <FileText className="h-10 w-10 text-slate-600 mb-2" />
              <p className="text-slate-400">No reports generated yet.</p>
              <p className="text-xs text-slate-500 mt-1">Use the template panel to generate a new report.</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="flex items-center justify-between rounded-2xl bg-slate-900/50 p-4 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-950 p-2">
                      <FileText className="h-5 w-5 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {report.type} ({report.format})
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(report.createdAt || report.generatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    {report.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 animate-pulse">
                        Generating...
                      </span>
                    ) : report.status === 'failed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
                        <AlertCircle className="h-3.5 w-3.5" /> Failed
                      </span>
                    ) : (
                      <button
                        onClick={() => downloadReport(report)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReportsPage;
