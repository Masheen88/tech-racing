import { createContext, useContext, useMemo } from "react";
import io from "socket.io-client";
import propTypes from "prop-types";

// Create the context
const SocketContext = createContext();

// Create a provider component
export const SocketProvider = ({ children }) => {
  console.log("SocketProvider", "children", children);
  // Dynamically determine the server address
  const serverAddress = useMemo(() => {
    // Check if the app is running on a development environment
    // and adjust the address accordingly
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    // Assuming port 3001 for your Socket.IO server
    const port = "3001";
    return host === "localhost"
      ? `${protocol}//localhost:${port}`
      : `${protocol}//66.128.253.47:${port}`;
  }, []);

  // Initialize socket connection with dynamic server address
  const socket = useMemo(() => io(serverAddress), [serverAddress]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: propTypes.node.isRequired,
};

// Custom hook to use the socket
export const useSocket = () => useContext(SocketContext);
