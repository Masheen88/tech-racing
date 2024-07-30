// carSpeedDisplay.jsx
import PropTypes from "prop-types";
import ThrottleButton from "./mobileControls/throttleButton";
import LeftButton from "./mobileControls/leftButton";
import RightButton from "./mobileControls/rightButton";
import { useEffect } from "react";

const CarSpeedDisplay = ({ currentSocketId, carId, speed, position }) => {
  const getControls = () => {
    if (carId) {
      // console.log("CarSpeedDisplay", carId);
      ThrottleButton(carId);
      LeftButton(carId);
      RightButton(carId);
    }
  };

  getControls();

  let isMobile = false;

  const speedStyle = {
    position: "absolute",
    top: `${position.top - 25}px`,
    left: `${position.left - 100}px`,
    fontSize: "2.5rem",
    fontWeight: "bold",
  };

  const throttleStyle = {
    display: isMobile ? "none" : "block",
    zIndex: 1000,
    position: "absolute",
    top: `${position.top - 100}px`,
    left: `${position.left - -100}px`,
    fontSize: "2.5rem",
    fontWeight: "bold",
  };

  const brakeStyle = {
    zIndex: 1000,
    position: "absolute",
    top: `${position.top - 100}px`,
    left: `${position.left - 100}px`,
    fontSize: "2.5rem",
    fontWeight: "bold",
  };

  const steeringStyle = {
    zIndex: 1000,
    position: "absolute",
    top: `${position.top - -50}px`,
    left: `${position.left - 100}px`,
    fontSize: "2.5rem",
    fontWeight: "bold",
  };

  useEffect(() => {
    const preventDefaultBehavior = (event) => {
      event.preventDefault();
    };

    const buttons = document.querySelectorAll(
      `#throttle-${carId}, #brake-${carId}, #left-${carId}, #right-${carId}`
    );

    buttons.forEach((button) => {
      button.addEventListener("contextmenu", preventDefaultBehavior); // Prevent right-click context menu
      button.addEventListener("touchstart", preventDefaultBehavior); // Prevent long-press default behavior on touch devices
      button.addEventListener("touchmove", preventDefaultBehavior); // Prevent default behavior while moving touch
      button.addEventListener("touchend", preventDefaultBehavior); // Prevent default behavior on touch end
    });

    // Cleanup event listeners on unmount
    return () => {
      buttons.forEach((button) => {
        button.removeEventListener("contextmenu", preventDefaultBehavior);
        button.removeEventListener("touchstart", preventDefaultBehavior);
        button.removeEventListener("touchmove", preventDefaultBehavior);
        button.removeEventListener("touchend", preventDefaultBehavior);
      });
    };
  }, [carId]);

  return (
    currentSocketId === carId && (
      <>
        {/* if the device is mobile show controls */}
        {(isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) && (
          <>
            <button id={`throttle-${carId}`} style={throttleStyle}>
              Go
            </button>
            <button id={`brake-${carId}`} style={brakeStyle}>
              Stop
            </button>
            <button
              id={`left-${carId}`}
              style={{ ...steeringStyle, left: `${position.left - 60}px` }}
            >
              L
            </button>
            <button
              id={`right-${carId}`}
              style={{ ...steeringStyle, left: `${position.left - -120}px` }}
            >
              R
            </button>
          </>
        )}

        <div style={speedStyle}>
          {Math.round((speed.current * 16.23694) / 2)} mph
        </div>
      </>
    )
  );
};

CarSpeedDisplay.propTypes = {
  currentSocketId: PropTypes.string.isRequired,
  carId: PropTypes.string.isRequired,
  speed: PropTypes.object.isRequired,
  position: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
  }).isRequired,
};

export default CarSpeedDisplay;
