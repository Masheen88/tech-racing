import { useEffect } from "react";
import PropTypes from "prop-types";

const ThrottleButton = (carId) => {
  useEffect(() => {
    const throttleButton = document.getElementById(`throttle-${carId}`);

    if (!throttleButton) {
      // console.error(`Button with id throttle-${carId} not found`);
      return;
    }

    const handleKeyDown = () => {
      throttleButton.style.backgroundColor = "green";
      const keyDownEvent = new KeyboardEvent("keydown", { key: "w" });
      window.dispatchEvent(keyDownEvent);
    };

    const handleKeyUp = () => {
      throttleButton.style.backgroundColor = "";
      const keyUpEvent = new KeyboardEvent("keyup", { key: "w" });
      window.dispatchEvent(keyUpEvent);
    };

    throttleButton.addEventListener("touchstart", handleKeyDown);
    throttleButton.addEventListener("touchend", handleKeyUp);

    return () => {
      throttleButton.removeEventListener("touchstart", handleKeyDown);
      throttleButton.removeEventListener("touchend", handleKeyUp);
    };
  }, [carId]);
};

ThrottleButton.propTypes = {
  carId: PropTypes.string,
};

export default ThrottleButton;
