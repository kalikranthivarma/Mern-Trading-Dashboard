import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resource: { type: String },
  metadata: { type: Map, of: String },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

const Log = mongoose.model('Log', logSchema);
export default Log;
