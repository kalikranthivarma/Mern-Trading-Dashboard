import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { CloudUpload, CheckCircle2, FileText, Image as ImageIcon, X, Loader2, Info, Clock, AlertTriangle, XCircle } from 'lucide-react';
import api from '../services/api';
import { updateProfile } from '../redux/slices/authSlice';

const KYCPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
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
        dispatch(updateProfile({ ...user, kycStatus: data.data.status || 'unverified' }));
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
      dispatch(updateProfile({ ...user, kycStatus: data.data.status }));
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

  // Status mapping
  const getStatusDetails = (status) => {
    switch (status) {
      case 'approved':
        return { 
          icon: <CheckCircle2 className="h-12 w-12 text-emerald-400" />, 
          title: "KYC Approved", 
          text: "Your identity has been successfully verified. You now have full access to trading and withdrawals.",
          style: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        };
      case 'pending':
      case 'under_review':
        return { 
          icon: <Clock className="h-12 w-12 text-amber-400" />, 
          title: "Verification Pending", 
          text: "Your documents are currently under review by our administration team. This usually takes 1-2 business days.",
          style: "bg-amber-500/10 border-amber-500/20 text-amber-400"
        };
      case 'rejected':
        return { 
          icon: <XCircle className="h-12 w-12 text-rose-500" />, 
          title: "Verification Rejected", 
          text: "Your previous KYC submission was rejected. Please review the remarks below and submit again.",
          style: "bg-rose-500/10 border-rose-500/20 text-rose-400"
        };
      default:
        return { 
          icon: <AlertTriangle className="h-12 w-12 text-slate-400" />, 
          title: "Unverified Account", 
          text: "You need to submit your KYC documents to enable trading and withdrawals on your account.",
          style: "bg-slate-500/10 border-slate-500/20 text-slate-400"
        };
    }
  };

  const statusInfo = getStatusDetails(kycStatus);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Identity Verification</h1>
        <p className="mt-2 text-slate-400">Complete your KYC to unlock all features.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Status Box */}
        <div className={`rounded-3xl border p-8 flex flex-col items-center justify-center text-center ${statusInfo.style}`}>
          <div className="mb-4">{statusInfo.icon}</div>
          <h2 className="text-2xl font-bold mb-2">{statusInfo.title}</h2>
          <p className="text-sm max-w-md opacity-80">{statusInfo.text}</p>

          {kycStatus === 'rejected' && kycData?.remarks && (
            <div className="mt-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 w-full text-left">
              <div className="flex items-center gap-2 text-rose-400 mb-2">
                <Info size={16} />
                <span className="text-sm font-semibold">Rejection Reason</span>
              </div>
              <p className="text-sm text-slate-300">{kycData.remarks}</p>
            </div>
          )}
        </div>

        {/* Upload Form */}
        {(kycStatus === 'unverified' || kycStatus === 'rejected') && (
          <div className="glass-card rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">Submit Documents</h3>
              <p className="text-sm text-slate-400 mt-2">
                Upload clear, uncropped photos of your documents.
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
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default KYCPage;
