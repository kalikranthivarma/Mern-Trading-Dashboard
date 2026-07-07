import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }]
}, { timestamps: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
export default Watchlist;
