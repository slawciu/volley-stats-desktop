import React from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_IO_URL } from "../../config";
let client: Socket | null = null;

export const getClient = () => {
  if (!client) {
    client = io(SOCKET_IO_URL);
    client.connect();
    client.on("connect", () => console.log("Connected"));
    client.on("disconnect", reason => {
      if (reason === "io server disconnect") {
        client?.connect();
      }
    })
    client.on("connect_error", () => {
      console.log("Reconnecting")
      setTimeout(() => {
        client?.connect();
      }, 1000);
    });
  }

  return client;
}
export const SocketContext = React.createContext(getClient());