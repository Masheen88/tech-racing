//App.jsx
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
import useSocket from "./components/utilities/useSocket";
import "./App.module.css";
import { compressImage } from "./components/utilities/compressImage";
import { useMusicPlayer } from "./components/hooks/useMusicPlayer";

import Track_1 from "./assets/track_1.jpg";

import useAudioContext from "./components/hooks/useAudioContext";

const MoveCar = lazy(() => import("./components/hooks/moveCar"));
const Obstacle = lazy(() => import("./components/gameAssets/Obstacle"));
const Wall = lazy(() => import("./components/gameAssets/Wall"));
const Ramp = lazy(() => import("./components/gameAssets/Ramp"));
const Tunnel = lazy(() => import("./components/gameAssets/Tunnel"));

const defaultSpawnLocation = { x: 2762, y: 675, rotation: 328 };

import {
  obstacles,
  ramps,
  tunnels,
  walls,
} from "./components/gameAssets/object_locations/index";

function App() {
  const socket = useSocket();
  const [users, setUsers] = useState([]);
  const [currentSocketId, setCurrentSocketId] = useState(null);
  const [inTunnel, setInTunnel] = useState(false);
  const [isReverbEnabled, setIsReverbEnabled] = useState(false);
  const { playMusic, setMusicVolume, audioElement } =
    useMusicPlayer(isReverbEnabled);

  const [volume, setVolume] = useState(0.05);

  const { audioContext, setAudioContext } = useAudioContext();
  const [startRace, setStartRace] = useState(false);
  const viewportRef = useRef(null);
  const boardRef = useRef(null);
  const targetScrollRef = useRef({ x: 0, y: 0 });
  const currentScrollRef = useRef({ x: 0, y: 0 });

  const [compressedImage, setCompressedImage] = useState(null);

  const lerp = (start, end, factor) => start + (end - start) * factor;

  const smoothScroll = useCallback(() => {
    if (!viewportRef.current) return;

    const smoothFactor = 0.1;
    currentScrollRef.current.x = lerp(
      currentScrollRef.current.x,
      targetScrollRef.current.x,
      smoothFactor
    );
    currentScrollRef.current.y = lerp(
      currentScrollRef.current.y,
      targetScrollRef.current.y,
      smoothFactor
    );
    viewportRef.current.scrollLeft = currentScrollRef.current.x;
    viewportRef.current.scrollTop = currentScrollRef.current.y;
    requestAnimationFrame(smoothScroll);
  }, []);

  useEffect(() => {
    requestAnimationFrame(smoothScroll);
  }, [smoothScroll]);

  useEffect(() => {
    const loadAndCompressImage = async () => {
      try {
        const response = await fetch(Track_1);
        const blob = await response.blob();
        const file = new File([blob], "track_1.jpg", { type: blob.type });
        const compressedFile = await compressImage(file);
        const compressedUrl = URL.createObjectURL(compressedFile);
        setCompressedImage(compressedUrl);
      } catch (error) {
        console.error("Error loading and compressing image:", error);
      }
    };

    loadAndCompressImage();
  }, []);

  useEffect(() => {
    // Initialize the audio context
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);
  }, [setAudioContext]);

  const handleStart = () => {
    // Start the race and ensure audio context is resumed
    if (audioContext && audioContext.state === "suspended") {
      console.log("AudioContext is suspended. Resuming...");
      audioContext.resume().then(() => {
        console.log("AudioContext resumed");
        setStartRace(true);
      });
    } else {
      setStartRace(true);
    }
  };

  const handleCarPosition = useCallback(
    (position, socketId) => {
      const viewport = viewportRef.current;
      const board = boardRef.current;

      if (socketId === currentSocketId && viewport && board && position) {
        const { left, top } = position;

        if (typeof left !== "number" || typeof top !== "number") {
          console.error("Invalid position values:", position);
          return;
        }

        const zoomLevel = 1;
        const viewportCenterX = viewport.clientWidth / 2;
        const viewportCenterY = viewport.clientHeight / 2;

        let targetScrollX = left * zoomLevel - viewportCenterX;
        let targetScrollY = top * zoomLevel - viewportCenterY;

        const maxScrollX = board.scrollWidth * zoomLevel - viewport.clientWidth;
        const maxScrollY =
          board.scrollHeight * zoomLevel - viewport.clientHeight;

        targetScrollX = Math.max(0, Math.min(targetScrollX, maxScrollX));
        targetScrollY = Math.max(0, Math.min(targetScrollY, maxScrollY));

        viewport.scrollLeft = targetScrollX;
        viewport.scrollTop = targetScrollY;

        targetScrollRef.current = { x: targetScrollX, y: targetScrollY };
      }
    },
    [currentSocketId]
  );

  useEffect(() => {
    const handleTouch = (event) => {
      if (event.target.id === "track-1") {
        event.preventDefault();
      }
    };

    const trackImage = document.getElementById("track-1");

    if (trackImage) {
      ["touchstart", "touchend", "contextmenu"].forEach((eventType) =>
        trackImage.addEventListener(eventType, handleTouch, { passive: false })
      );
    }

    socket.on("connect", () => {
      console.log("Connected to server");
      setCurrentSocketId(socket.id);
    });

    socket.on("users", setUsers);

    socket.on("carPositionUpdate", (update) => {
      setUsers((currentUsers) => {
        const updatedUsers = currentUsers.map((user) => {
          if (user.socketId === update.carId) {
            if (update.carId === currentSocketId) {
              handleCarPosition(update.position, update.carId);
            }
            return {
              ...user,
              carPosition: update.position,
              carRotation: update.rotation,
              speed: update.speed,
              timestamp: update.timestamp,
            };
          }
          return user;
        });
        return updatedUsers;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("users");
      socket.off("carPositionUpdate");

      if (trackImage) {
        ["touchstart", "touchend", "contextmenu"].forEach((eventType) =>
          trackImage.removeEventListener(eventType, handleTouch)
        );
      }
    };
  }, [socket, currentSocketId, handleCarPosition]);

  const boardArea = { width: 3200, height: 1000 };

  const viewportStyle = {
    width: "50dvw",
    height: "100dvh",
    overflow: "hidden",
    position: "absolute",
  };

  const boardStyle = {
    width: `${boardArea.width}px`,
    height: `${boardArea.height}px`,
    position: "relative",
    transform: `scale(1)`,
  };

  const handleVolumeChange = (event) => {
    // Handle volume change for the music
    const value = parseFloat(event.target.value);
    setVolume(value);
    setMusicVolume(value);
  };

  // const respawnButton = () => {
  //   //if the currentSocketId equals the user.socketId
  //   if (currentSocketId) {
  //     console.log("Current Socket ID:", currentSocketId);
  //     console.log("Socket:", socket);

  //     // user.carPosition = position;
  //     // user.carRotation = rotation;
  //     // user.speed = speed;
  //     // user.timestamp = Date.now();

  //     socket.emit(
  //       "updateCarPosition",
  //       currentSocketId,
  //       { top: defaultSpawnLocation.y, left: defaultSpawnLocation.x },
  //       0,
  //       0
  //     );
  //   }
  // };

  // console.log(`
  //   Play Music: ${playMusic}
  //   Set Music Volume: ${setMusicVolume}
  //   Audio Element: ${audioElement}`);
  return (
    <>
      <button
        onClick={() => {
          handleStart();
          playMusic(
            `http://${import.meta.env.VITE_APP_IP}:5173/music/tech_racing_3.mp3`
          );
        }}
      >
        Start Race
      </button>

      {startRace ? (
        <Suspense fallback={<div>Loading...</div>}>
          <div>
            {/* <button
              onClick={() =>
                playMusic("http://66.128.253.47:5173/music/tech_racing_1.mp3")
              }
            >
              Play Music
            </button> */}
            <button
              style={{ marginRight: "10px" }}
              onClick={() => setIsReverbEnabled(!isReverbEnabled)}
            >
              Toggle Reverb
            </button>
            <label>🔊</label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.001"
              value={volume}
              onChange={handleVolumeChange}
            />{" "}
            {/* <button
              style={{ marginLeft: "10px" }}
              id={`spawnBtn-${currentSocketId}`}
              onClick={respawnButton}
            >
              Respawn
            </button> */}
          </div>
        </Suspense>
      ) : null}

      <div id="gameBoardContainer" ref={viewportRef} style={viewportStyle}>
        <div ref={boardRef} style={boardStyle}>
          {compressedImage && (
            <img
              id="track-1"
              src={compressedImage}
              alt="Track 1"
              style={boardStyle}
            />
          )}
          <Suspense fallback={<div>Loading...</div>}>
            {startRace &&
              users.map((user) => {
                const isCurrentUserCar = user.socketId === currentSocketId;
                if (isCurrentUserCar) {
                  // console.log("User:", user);
                }
                return (
                  <MoveCar
                    className="car"
                    id={`car-id-${user.socketId}`}
                    key={user.socketId}
                    carId={user.socketId}
                    currentSocketId={currentSocketId}
                    carPosition={user.carPosition}
                    carRotation={user.carRotation}
                    carSpeed={user.speed}
                    containerWidth={boardArea.width}
                    containerHeight={boardArea.height}
                    audioContext={audioContext}
                    isCurrentUserCar={isCurrentUserCar}
                    obstacles={obstacles}
                    walls={walls}
                    ramps={ramps}
                    tunnels={tunnels}
                    inTunnel={inTunnel}
                    setInTunnel={setInTunnel}
                    IsReverbEnabled={!isReverbEnabled}
                    setIsReverbEnabled={setIsReverbEnabled}
                    defaultSpawnLocation={defaultSpawnLocation}
                  />
                );
              })}
            {obstacles.map((obstacle) => (
              <Obstacle
                key={obstacle.id}
                id={obstacle.id}
                position={obstacle.position}
                size={obstacle.size}
                rotation={obstacle.rotation}
              />
            ))}
            {walls.map((wall) => (
              <Wall
                key={wall.id}
                id={wall.id}
                position={wall.position}
                size={wall.size}
              />
            ))}
            {ramps.map((ramp) => (
              <Ramp
                key={ramp.id}
                id={ramp.id}
                position={ramp.position}
                size={ramp.size}
                direction={ramp.direction}
              />
            ))}
            {tunnels.map((tunnel) => (
              <Tunnel
                key={tunnel.id}
                id={tunnel.id}
                position={tunnel.position}
                size={tunnel.size}
                isVisible={!isReverbEnabled}
              />
            ))}
          </Suspense>
        </div>
      </div>
      {audioElement && <audio ref={audioElement} />}
    </>
  );
}

export default App;
