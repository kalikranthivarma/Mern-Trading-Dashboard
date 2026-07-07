import { listAssets } from '../services/assetService.js';

export const getAssets = async (req, res, next) => {
  try {
    const assets = await listAssets(req.query);
    res.json({ assets });
  } catch (error) {
    next(error);
  }
};
