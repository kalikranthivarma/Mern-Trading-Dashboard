import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { CloudUpload, CheckCircle2, FileText, Image as ImageIcon, X, Loader2, Info } from 'lucide-react';
import api from '../services/api';

const ProfilePage = () => {
  const user = useSelector((state) => state.auth.user);
  const [kycData, setKycData] = useState(null);
  const [kycStatus, setKycStatus] = useState(user?.kycStatus || 'unverified');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File states
  const [files, setFiles] = useState({
    identityDocument: null,
  });

  const [previews, setPreviews] = useState({
    identityDocument: null,
  });

  const fileInputRefs = {
    identityDocument: useRef(null),
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      const { data } = await api.get('/kyc/my-status');
      if (data.data) {
        setKycData(data.data);
        setKycStatus(data.data.status || 'unverified');
      }
    } catch (error) {
      console.error('Failed to load KYC status', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return toast.error('File size must be less than 10MB');
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return toast.error('Only JPG, PNG, and PDF files are allowed');
    }

    setFiles((prev) => ({ ...prev, [fieldName]: file }));

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => ({ ...prev, [fieldName]: 'pdf' }));
    }
  };

  const removeFile = (fieldName) => {
    setFiles((prev) => ({ ...prev, [fieldName]: null }));
    setPreviews((prev) => ({ ...prev, [fieldName]: null }));
    if (fileInputRefs[fieldName].current) {
      fileInputRefs[fieldName].current.value = '';
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    
    // Check if required file is present
    if (!files.identityDocument) {
      return toast.error("Please upload an identity document.");
    }

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('identityDocument', files.identityDocument);

    try {
      const { data } = await api.post('/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setKycStatus(data.data.status);
      setKycData(data.data);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit KYC documents');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUploadBox = (title, fieldName, description) => {
    const isUploading = files[fieldName] !== null;
    const preview = previews[fieldName];
    const existingDoc = kycData?.documents?.[fieldName];
    
    const isApprovedOrPending = kycStatus === 'pending' || kycStatus === 'approved' || kycStatus === 'under_review';

    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">{title}</label>
        
        {existingDoc && isApprovedOrPending ? (
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Document Uploaded</p>
              <a href={import.meta.env.VITE_API_URL?.replace('/api', '') + existingDoc} target="_blank" rel="noreferrer" className="text-xs text-sky-400 hover:underline">
                View Document
              </a>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => !isUploading && fileInputRefs[fieldName].current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all ${
              isUploading 
                ? 'border-sky-500/50 bg-sky-500/5' 
                : 'border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-slate-900 cursor-pointer'
            }`}
          >
            <input
              type="file"
              ref={fileInputRefs[fieldName]}
              onChange={(e) => handleFileChange(e, fieldName)}
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
            />
            
            {isUploading ? (
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  {preview === 'pdf' ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                      <FileText size={24} />
                    </div>
                  ) : (
                    <img src={preview} alt="Preview" className="h-12 w-12 rounded-xl object-cover" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white truncate max-w-[150px] sm:max-w-[200px]">
                      {files[fieldName].name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {(files[fieldName].size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(fieldName);
                  }}
                  className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-400">
                  <CloudUpload size={24} />
                </div>
                <p className="text-sm font-medium text-white">Click to upload</p>
                <p className="mt-1 text-xs text-slate-500">JPG, PNG or PDF (Max 10MB)</p>
                {description && <p className="mt-2 text-xs text-sky-400/80">{description}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Profile & KYC</h1>
        <p className="mt-2 text-slate-400">Manage your personal information and verify your identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-6">Personal details</h2>
            <div className="space-y-5">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Full Name</p>
                <p className="text-base font-medium text-white">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Email Address</p>
                <p className="text-base font-medium text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Account Type</p>
                <p className="text-base font-medium capitalize text-white flex items-center gap-2">
                  {user?.role}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={12} />
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-semibold mb-4">KYC Status</h2>
            
            <div className={`rounded-2xl p-4 border ${
              kycStatus === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              kycStatus === 'pending' || kycStatus === 'under_review' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              kycStatus === 'rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
              'bg-slate-500/10 border-slate-500/20 text-slate-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold uppercase tracking-wider text-sm">{kycStatus.replace('_', ' ')}</span>
                {kycStatus === 'approved' && <CheckCircle2 size={18} />}
                {kycStatus === 'rejected' && <X size={18} />}
                {(kycStatus === 'pending' || kycStatus === 'under_review') && <Loader2 size={18} className="animate-spin" />}
              </div>
              <p className="text-xs opacity-80">
                {kycStatus === 'approved' ? 'Your identity has been verified. All trading features are unlocked.' :
                 kycStatus === 'pending' ? 'Your documents are being reviewed by our compliance team.' :
                 kycStatus === 'rejected' ? 'Your KYC request was rejected. Please review the remarks and submit again.' :
                 'Please complete your KYC to unlock deposits and trading features.'}
              </p>
            </div>

            {kycStatus === 'rejected' && kycData?.remarks && (
              <div className="mt-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 p-4">
                <div className="flex items-center gap-2 text-rose-400 mb-2">
                  <Info size={16} />
                  <span className="text-sm font-semibold">Rejection Reason</span>
                </div>
                <p className="text-sm text-slate-300">{kycData.remarks}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: KYC Upload Form */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-3xl p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold">Identity Verification</h2>
              <p className="text-sm text-slate-400 mt-2">
                Upload clear, uncropped photos of your documents. Details must be clearly visible.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
              </div>
            ) : (
              <form onSubmit={handleKycSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 gap-6">
                  {renderUploadBox('Identity Document', 'identityDocument', 'Upload a clear photo of your ID (e.g. PAN, Aadhaar, Passport, or Driving License)')}
                </div>

                {kycStatus !== 'pending' && kycStatus !== 'approved' && kycStatus !== 'under_review' && (
                  <div className="pt-6 border-t border-white/5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-4 font-semibold text-white transition-all hover:bg-sky-400 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Securely Uploading...
                        </>
                      ) : (
                        <>
                          <CloudUpload size={20} />
                          Submit Documents for Verification
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-4">
                      By submitting, you agree to our Terms of Service and Privacy Policy. All files are securely encrypted.
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProfilePage;
