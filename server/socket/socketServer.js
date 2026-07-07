import { Server } from 'socket.io';

let io;

const getRandomChange = () => Number((Math.random() * 1.5 - 0.75).toFixed(2));

const getMarketUpdate = (symbol) => ({
  symbol,
  price: Number((100 + Math.random() * 60).toFixed(2)),
  change: getRandomChange()
});

const startMarketTicker = () => {
  const symbols = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN', 'BTC', 'ETH'];

  setInterval(() => {
    if (!io) return;
    const updates = symbols.map((symbol) => getMarketUpdate(symbol));
    io.emit('marketData', updates);
  }, 1500);
};

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribeToMarket', (market) => {
      socket.join(`market-${market}`);
    });

    socket.on('unsubscribeFromMarket', (market) => {
      socket.leave(`market-${market}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  startMarketTicker();
};

export const getIo = () => io;
