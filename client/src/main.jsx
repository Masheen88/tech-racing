// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { SocketProvider } from "./components/utilities/SocketContext";
import { AudioContextProvider } from "./components/hooks/audioContextProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <AudioContextProvider>
      <App />
    </AudioContextProvider>
  </SocketProvider>
);
