import Asset from "../models/Asset.js";
import { getIO } from "./socket.js";

export const startMarket = () => {
  console.log("🚀 Market Simulator Started");

  setInterval(async () => {
    try {
      console.log("⏰ Running Market Update");

      const assets = await Asset.find();

      console.log("Assets Found:", assets.length);

      if (assets.length === 0) {
        console.log("⚠️ No assets found in database.");
        return;
      }

      for (const asset of assets) {
        const change = (Math.random() - 0.5) * 10;

        asset.currentPrice = Number(
          Math.max(asset.currentPrice + change, 1).toFixed(2)
        );

        await asset.save();

        console.log(`${asset.symbol} -> ${asset.currentPrice}`);

        getIO().emit("priceUpdate", {
          assetId: asset._id,
          symbol: asset.symbol,
          price: asset.currentPrice,
        });
      }
    } catch (error) {
      console.error("Market Simulator Error:", error);
    }
  }, 3000);
};