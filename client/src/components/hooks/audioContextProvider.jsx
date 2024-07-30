//audioContextProvider.jsx
import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";

export const AudioContext = createContext(null);

export const AudioContextProvider = ({ children }) => {
  const [audioContext, setAudioContext] = useState(null);

  useEffect(() => {
    const initAudioContext = () => {
      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        const context = new AudioContextClass();
        setAudioContext(context);
      } catch (error) {
        console.error("Failed to create AudioContext:", error);
      }
    };

    if (!audioContext) {
      initAudioContext();
    }

    return () => {
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    };
  }, [audioContext]);

  return (
    <AudioContext.Provider value={{ audioContext, setAudioContext }}>
      {children}
    </AudioContext.Provider>
  );
};

AudioContextProvider.propTypes = {
  children: PropTypes.node,
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === null) {
    throw new Error(
      "useAudioContext must be used within an AudioContextProvider"
    );
  }
  return context;
};

export default AudioContextProvider;
