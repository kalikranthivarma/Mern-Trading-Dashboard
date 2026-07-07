import { useEffect, useState } from "react";
import socket from "../socket/socket";

export default function LiveMarket() {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    socket.on("priceUpdate", (data) => {
      setPrices((prev) => {
        const index = prev.findIndex(
          (item) => item.assetId === data.assetId
        );

        if (index !== -1) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        }

        return [...prev, data];
      });
    });

    return () => socket.off("priceUpdate");
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        📈 Live Market
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {prices.map((asset) => (
          <div
            key={asset.assetId}
            className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-700 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-bold text-white">
              {asset.symbol}
            </h2>

            <p className="text-3xl font-bold text-green-400 mt-4">
              ₹ {asset.price}
            </p>

            <p className="text-sm text-gray-400 mt-3">
              Live Updating...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}