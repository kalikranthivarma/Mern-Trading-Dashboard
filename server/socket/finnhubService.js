import WebSocket from 'ws';
import Asset from '../models/Asset.js';
import { getIO } from './socket.js';

let ws;

const getFinnhubSymbol = (asset) => {
  if (asset.type === 'Crypto') {
    if (asset.symbol === 'BTC') return 'BINANCE:BTCUSDT';
    if (asset.symbol === 'ETH') return 'BINANCE:ETHUSDT';
    return `BINANCE:${asset.symbol}USDT`;
  }
  return asset.symbol;
};

const getLocalSymbol = (finnhubSymbol) => {
  if (finnhubSymbol.startsWith('BINANCE:')) {
    return finnhubSymbol.replace('BINANCE:', '').replace('USDT', '');
  }
  return finnhubSymbol;
};

export const startFinnhubMarket = async () => {
  const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
  
  if (!FINNHUB_API_KEY) {
    console.warn("⚠️ FINNHUB_API_KEY is not defined in .env. Skipping Finnhub WebSocket connection.");
    return;
  }

  console.log("🚀 Initializing Finnhub Market Data Service...");

  try {
    const assets = await Asset.find({ status: 'ACTIVE' });
    if (assets.length === 0) {
      console.log("⚠️ No active assets found in database. Nothing to subscribe to.");
      return;
    }

    const wsUrl = `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`;
    ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log("✅ Connected to Finnhub WebSocket");
      
      assets.forEach(asset => {
        const fhSymbol = getFinnhubSymbol(asset);
        console.log(`Subscribing to ${fhSymbol}`);
        ws.send(JSON.stringify({ type: 'subscribe', symbol: fhSymbol }));
      });
    });

    ws.on('message', async (data) => {
      try {
        const response = JSON.parse(data);
        
        if (response.type === 'trade' && response.data) {
          for (const trade of response.data) {
            const fhSymbol = trade.s;
            const price = trade.p;
            const localSymbol = getLocalSymbol(fhSymbol);

            const asset = assets.find(a => a.symbol === localSymbol);
            if (asset) {
              getIO().emit("priceUpdate", {
                assetId: asset._id,
                symbol: localSymbol,
                price: price,
              });

              await Asset.findOneAndUpdate(
                { symbol: localSymbol }, 
                { currentPrice: price }
              );
            }
          }
        }
      } catch (err) {
        console.error("Error processing Finnhub message:", err);
      }
    });

    ws.on('close', () => {
      console.log("❌ Finnhub WebSocket closed. Reconnecting in 5 seconds...");
      setTimeout(startFinnhubMarket, 5000);
    });

    ws.on('error', (error) => {
      console.error("Finnhub WebSocket error:", error);
    });

  } catch (error) {
    console.error("Error starting Finnhub service:", error);
  }
};
