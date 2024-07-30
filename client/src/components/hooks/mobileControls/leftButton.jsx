import { useEffect } from "react";
import PropTypes from "prop-types";

const LeftButton = (carId) => {
  // console.log("LeftButton", carId);

  useEffect(() => {
    const leftButton = document.getElementById(`left-${carId}`);

    if (!leftButton) {
      // console.error(`Button with id left-${carId} not found`);
      return;
    }

    const handleKeyDown = () => {
      leftButton.style.backgroundColor = "blue";
      const keyDownEvent = new KeyboardEvent("keydown", { key: "a" });
      window.dispatchEvent(keyDownEvent);
    };

    const handleKeyUp = () => {
      leftButton.style.backgroundColor = "";
      const keyUpEvent = new KeyboardEvent("keyup", { key: "a" });
      window.dispatchEvent(keyUpEvent);
    };

    leftButton.addEventListener("touchstart", handleKeyDown);
    leftButton.addEventListener("touchend", handleKeyUp);

    return () => {
      leftButton.removeEventListener("touchstart", handleKeyDown);
      leftButton.removeEventListener("touchend", handleKeyUp);
    };
  }, [carId]);
};

LeftButton.propTypes = {
  carId: PropTypes.string,
};

export default LeftButton;
