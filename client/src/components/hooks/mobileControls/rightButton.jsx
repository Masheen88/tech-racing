import { useEffect } from "react";
import PropTypes from "prop-types";

const RightButton = (carId) => {
  //   console.log("RightButton", carId);

  useEffect(() => {
    const rightButton = document.getElementById(`right-${carId}`);

    if (!rightButton) {
      // console.error(`Button with id right-${carId} not found`);
      return;
    }

    const handleKeyDown = () => {
      rightButton.style.backgroundColor = "blue";
      const keyDownEvent = new KeyboardEvent("keydown", { key: "d" });
      window.dispatchEvent(keyDownEvent);
    };

    const handleKeyUp = () => {
      rightButton.style.backgroundColor = "";
      const keyUpEvent = new KeyboardEvent("keyup", { key: "d" });
      window.dispatchEvent(keyUpEvent);
    };

    rightButton.addEventListener("touchstart", handleKeyDown);
    rightButton.addEventListener("touchend", handleKeyUp);

    return () => {
      rightButton.removeEventListener("touchstart", handleKeyDown);
      rightButton.removeEventListener("touchend", handleKeyUp);
    };
  }, [carId]);
};

RightButton.propTypes = {
  carId: PropTypes.string,
};

export default RightButton;
