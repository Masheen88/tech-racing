import { useRef, useEffect, useState } from "react";

export const useMusicPlayer = (isReverbEnabled) => {
  const audioContextRef = useRef(null);
  const audioElementRef = useRef(null);
  const gainNodeRef = useRef(null);
  const convolverRef = useRef(null);
  const reverbGainNodeRef = useRef(null);

  const [volume, setVolume] = useState(0.19); // Default volume

  useEffect(() => {
    // Initialize audio context and related nodes
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;

    const convolver = audioContext.createConvolver();
    const reverbGainNode = audioContext.createGain();
    reverbGainNode.gain.value = 0;

    // Load the reverb impulse response
    fetch("/reverb/ncVerb.wav")
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        convolver.buffer = audioBuffer;
        console.log("Reverb buffer loaded successfully.");
      })
      .catch((error) =>
        console.error("Failed to load reverb impulse response:", error)
      );

    // Create and configure the audio element
    const audioElement = document.createElement("audio");
    audioElement.setAttribute("crossorigin", "anonymous"); // Ensure CORS
    document.body.appendChild(audioElement); // Attach to the DOM

    const track = audioContext.createMediaElementSource(audioElement);

    // Connect nodes to the audio context
    track.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.connect(convolver);
    convolver.connect(reverbGainNode);
    reverbGainNode.connect(audioContext.destination);

    // Store references to audio context and nodes
    audioContextRef.current = audioContext;
    audioElementRef.current = audioElement;
    gainNodeRef.current = gainNode;
    convolverRef.current = convolver;
    reverbGainNodeRef.current = reverbGainNode;

    console.log("Audio context and elements initialized.");
    console.log("Audio Element:", audioElement);

    // Cleanup function to disconnect nodes and remove audio element from the DOM
    return () => {
      audioElement.pause();
      track.disconnect();
      gainNode.disconnect();
      convolver.disconnect();
      reverbGainNode.disconnect();
      document.body.removeChild(audioElement); // Remove from the DOM
      console.log("Audio context and elements cleaned up.");
    };
  }, [volume]);

  useEffect(() => {
    // Toggle reverb effect based on isReverbEnabled
    if (reverbGainNodeRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      reverbGainNodeRef.current.gain.cancelScheduledValues(currentTime);
      reverbGainNodeRef.current.gain.setValueAtTime(
        reverbGainNodeRef.current.gain.value,
        currentTime
      );
      reverbGainNodeRef.current.gain.linearRampToValueAtTime(
        isReverbEnabled ? 1 : 0,
        currentTime + 0.5
      );
    }
  }, [isReverbEnabled]);

  const playMusic = (url) => {
    // Function to play music from the given URL
    console.log("Playing music:", url);
    if (audioElementRef.current) {
      console.log("Audio element before play:", audioElementRef.current);
      if (audioContextRef.current.state === "suspended") {
        // Resume audio context if suspended
        audioContextRef.current.resume().then(() => {
          audioElementRef.current.src = url;
          console.log("Audio element source set to:", url);
          console.log("Audio element properties:", audioElementRef.current);
          audioElementRef.current
            .play()
            .then(() => console.log("Playback started successfully"))
            .catch((error) => {
              console.error("Error playing audio:", error);
              // Fallback: Try to reload the audio element and play again
              audioElementRef.current.load();
              audioElementRef.current
                .play()
                .then(() =>
                  console.log("Fallback playback started successfully")
                )
                .catch((err) =>
                  console.error("Fallback error playing audio:", err)
                );
            });
        });
      } else {
        audioElementRef.current.src = url;
        console.log("Audio element source set to:", url);
        console.log("Audio element properties:", audioElementRef.current);
        audioElementRef.current
          .play()
          .then(() => console.log("Playback started successfully"))
          .catch((error) => {
            console.error("Error playing audio:", error);
            // Fallback: Try to reload the audio element and play again
            audioElementRef.current.load();
            audioElementRef.current
              .play()
              .then(() => console.log("Fallback playback started successfully"))
              .catch((err) =>
                console.error("Fallback error playing audio:", err)
              );
          });
      }
    } else {
      console.error("Audio element is not initialized.");
    }
  };

  const setMusicVolume = (value) => {
    // Function to set the volume of the music
    setVolume(value);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        value,
        audioContextRef.current.currentTime
      );
    }
  };

  //check if the music has ended and replay it
  if (audioElementRef.current) {
    audioElementRef.current.onended = () => {
      console.log("Music ended, replaying...");
      audioElementRef.current.play();
    };
  }

  // console.log("useMusic audio element:", { audioElement: audioElementRef });
  return {
    playMusic,
    setMusicVolume,
    audioElement: audioElementRef,
  };
};
