import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Client Connected:", socket.id);

    socket.emit("connected", {
      message: "Connected Successfully",
    });

    socket.on("disconnect", () => {
      console.log("❌ Client Disconnected:", socket.id);
    });
  });
};

export const getIO = () => io;