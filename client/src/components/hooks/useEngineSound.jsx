import { useRef, useEffect } from "react";

export const useEngineSound = (max_speed, isReverbEnabled) => {
  const audioContextRef = useRef();
  const oscillatorRefs = useRef([]);
  const convolverRef = useRef(null); // Convolver node reference
  const reverbGainNodeRef = useRef(null); // Gain node for reverb
  const initialVolume = 0.08;
  const gearsCount = 7;

  const gears = Array.from({ length: gearsCount }, (_, i) => {
    const minSpeed = (i / gearsCount) * max_speed;
    const maxSpeed = ((i + 1) / gearsCount) * max_speed * 1.5;
    const minFrequency = 10 + i * 20;
    const maxFrequency = 50 + i * 30;

    return { minSpeed, maxSpeed, minFrequency, maxFrequency };
  });

  const volumeControl = {
    minVolume: 0.018,
    maxVolume: 0.019,
    minSpeed: 0,
    maxSpeed: 40,
  };

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();

    const createOscillator = (type) => {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = initialVolume;
      oscillator.type = type;
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      oscillator.start();
      oscillator.gainNode = gainNode;
      return oscillator;
    };

    oscillatorRefs.current = [
      createOscillator("sawtooth"), // First oscillator type
      createOscillator("square"), // Second oscillator type
    ];

    // Create convolver and reverb gain node
    const convolver = audioContextRef.current.createConvolver();
    const reverbGainNode = audioContextRef.current.createGain();
    reverbGainNode.gain.value = 0; // Start with reverb gain at 0

    fetch("/reverb/ncVerb.wav")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.arrayBuffer();
      })
      .then((arrayBuffer) =>
        audioContextRef.current.decodeAudioData(arrayBuffer)
      )
      .then((audioBuffer) => {
        convolver.buffer = audioBuffer;
        // Connect oscillators to convolver and convolver to reverb gain node
        oscillatorRefs.current.forEach((oscillator) => {
          oscillator.gainNode.connect(convolver);
        });
        convolver.connect(reverbGainNode);
        reverbGainNode.connect(audioContextRef.current.destination);
      })
      .catch((error) => {
        console.error(
          "Failed to fetch and decode reverb impulse response:",
          error
        );
      });

    convolverRef.current = convolver;
    reverbGainNodeRef.current = reverbGainNode;

    return () => {
      oscillatorRefs.current.forEach((oscillator) => {
        oscillator.stop();
        oscillator.disconnect();
        oscillator.gainNode.disconnect();
      });
      if (convolverRef.current) {
        convolverRef.current.disconnect();
      }
      if (reverbGainNodeRef.current) {
        reverbGainNodeRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (reverbGainNodeRef.current) {
      const targetValue = isReverbEnabled ? 1 : 0;
      reverbGainNodeRef.current.gain.setTargetAtTime(
        targetValue,
        audioContextRef.current.currentTime,
        0.5
      ); // Smooth transition
    }
  }, [isReverbEnabled]);

  const updateEngineSound = (speed) => {
    const currentGear =
      gears.find((gear) => speed >= gear.minSpeed && speed < gear.maxSpeed) ||
      gears[gears.length - 1];
    const speedRatioWithinGear =
      (speed - currentGear.minSpeed) /
      (currentGear.maxSpeed - currentGear.minSpeed);
    const frequency =
      currentGear.minFrequency +
      (currentGear.maxFrequency - currentGear.minFrequency) *
        speedRatioWithinGear;

    oscillatorRefs.current.forEach((oscillator, index) => {
      oscillator.frequency.setValueAtTime(
        frequency * (index + 1), // Adjust frequency for each oscillator
        audioContextRef.current.currentTime
      );

      const volume =
        volumeControl.minVolume +
        ((volumeControl.maxVolume - volumeControl.minVolume) *
          (speed - volumeControl.minSpeed)) /
          (volumeControl.maxSpeed - volumeControl.minSpeed);
      oscillator.gainNode.gain.setValueAtTime(
        volume,
        audioContextRef.current.currentTime
      );
    });
  };

  return { updateEngineSound };
};
