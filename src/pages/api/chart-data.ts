import { NextRequest } from "next/server";
import { Server } from "socket.io";

export default function ioHandler(req: NextRequest, res: any) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      console.log("connected");

      // Emit 'data-update' event every 3 seconds
      const intervalId = setInterval(() => {
        const data = generateRandomData();
        socket.emit("data-update", data);
      }, 4000);

      // Clear interval on 'disconnect' event
      socket.on("disconnect", () => {
        clearInterval(intervalId);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}

function generateRandomData() {
  return {
    timestamp: new Date().toISOString(),
    value: Math.random() * 100,
  };
}
