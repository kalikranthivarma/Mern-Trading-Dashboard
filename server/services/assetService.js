import Asset from '../models/Asset.js';

export const listAssets = async (query = {}) => {
  const filters = {};
  if (query.category) filters.category = query.category;
  if (query.symbol) filters.symbol = query.symbol.toUpperCase();
  if (query.search) filters.$or = [
    { name: { $regex: query.search, $options: 'i' } },
    { symbol: { $regex: query.search, $options: 'i' } }
  ];
  return Asset.find(filters).sort({ marketCap: -1 }).limit(Number(query.limit || 100));
};

export const getAssetById = async (id) => Asset.findById(id);

export const updateAssetPrice = async (assetId, price) =>
  Asset.findByIdAndUpdate(assetId, { currentPrice: price }, { new: true });
