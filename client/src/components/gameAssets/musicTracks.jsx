import { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";

const MusicPlayer = ({
  audioContext,
  shouldPlay = false,
  tracks = [],
  isReverbEnabled = false,
  setIsReverbEnabled,
}) => {
  const [currentTrack, setCurrentTrack] = useState(tracks[0] || null);
  const [volume, setVolume] = useState(0.05); // Default volume level (0.0 to 1.0)
  const audioRef = useRef(new Audio());
  const sourceRef = useRef(null);
  const gainNodeRef = useRef(null);
  const convolverRef = useRef(null); // Convolver node reference
  const reverbGainNodeRef = useRef(null); // Gain node for reverb

  const loadAndPlayAudio = useCallback(() => {
    if (!currentTrack || !currentTrack.src) {
      console.error("Current track is not set or has no src");
      return;
    }
    console.log("Audio Ref:", audioRef.current);
    audioRef.current.src = currentTrack.src;
    audioRef.current.load();
    audioRef.current
      .play()
      .catch((error) => console.error("Playback failed:", error));
  }, [currentTrack]);

  useEffect(() => {
    if (shouldPlay && currentTrack) {
      loadAndPlayAudio();
    }

    const audioRefCurrent = audioRef.current; // Create a variable to store the value of audioRef.current

    return () => {
      audioRefCurrent.pause(); // Use the variable in the cleanup function
    };
  }, [shouldPlay, currentTrack, loadAndPlayAudio]);

  useEffect(() => {
    if (shouldPlay && audioContext && audioRef.current.src) {
      if (!sourceRef.current) {
        sourceRef.current = audioContext.createMediaElementSource(
          audioRef.current
        );
        gainNodeRef.current = audioContext.createGain();
        gainNodeRef.current.gain.value = volume; // Set the initial volume

        sourceRef.current.connect(gainNodeRef.current);

        // Create convolver and reverb gain node
        convolverRef.current = audioContext.createConvolver();
        reverbGainNodeRef.current = audioContext.createGain();
        reverbGainNodeRef.current.gain.value = 0; // Start with reverb gain at 0

        fetch("/reverb/ncVerb.wav")
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                "Network response was not ok " + response.statusText
              );
            }
            return response.arrayBuffer();
          })
          .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
          .then((audioBuffer) => {
            convolverRef.current.buffer = audioBuffer;
            console.log("Reverb buffer loaded successfully.");
          })
          .catch((error) => {
            console.error(
              "Failed to fetch and decode reverb impulse response:",
              error
            );
          });

        gainNodeRef.current.connect(convolverRef.current);
        convolverRef.current.connect(reverbGainNodeRef.current);
        reverbGainNodeRef.current.connect(audioContext.destination);
        gainNodeRef.current.connect(audioContext.destination);
      }
    }

    return () => {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (convolverRef.current) {
        convolverRef.current.disconnect();
      }
      if (reverbGainNodeRef.current) {
        reverbGainNodeRef.current.disconnect();
      }
    };
  }, [shouldPlay, audioContext, volume]);

  useEffect(() => {
    if (reverbGainNodeRef.current) {
      const targetValue = isReverbEnabled ? 1 : 0;
      reverbGainNodeRef.current.gain.setTargetAtTime(
        targetValue,
        audioContext.currentTime,
        0.5
      ); // Smooth transition
      console.log(isReverbEnabled ? "Reverb enabled" : "Reverb disabled");
    }
  }, [isReverbEnabled, audioContext]);

  const handleTrackChange = useCallback(
    (event) => {
      const selectedTrack = tracks.find(
        (track) => track.id === parseInt(event.target.value, 10)
      );
      if (selectedTrack) {
        setCurrentTrack(selectedTrack);
      }
    },
    [tracks]
  );

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  if (!tracks.length) {
    return <div>No tracks available</div>;
  }

  return (
    <div>
      <select
        onChange={handleTrackChange}
        value={currentTrack ? currentTrack.id : ""}
      >
        {tracks.map((track) => (
          <option key={track.id} value={track.id}>
            {track.name}
          </option>
        ))}
      </select>
      <button onClick={() => setIsReverbEnabled(!isReverbEnabled)}>
        {isReverbEnabled ? "Disable" : "Enable"} Reverb
      </button>
      <div>
        <label htmlFor="volume">Volume:</label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>
      <audio ref={audioRef} />
    </div>
  );
};

MusicPlayer.propTypes = {
  audioContext: PropTypes.object.isRequired,
  shouldPlay: PropTypes.bool,
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      src: PropTypes.string.isRequired,
    })
  ).isRequired,
  isReverbEnabled: PropTypes.bool,
  setIsReverbEnabled: PropTypes.func.isRequired,
};

export default MusicPlayer;
