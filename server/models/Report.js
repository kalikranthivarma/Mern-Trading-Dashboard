import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['Trading', 'Portfolio', 'Monthly', 'Yearly', 'Audit'], required: true },
  format: { type: String, enum: ['CSV', 'PDF', 'Excel'], required: true },
  generatedAt: { type: Date, default: Date.now },
  fileId: { type: String },
  status: { type: String, enum: ['pending', 'ready', 'failed'], default: 'pending' }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
export default Report;
