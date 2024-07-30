import { useCallback, useRef, useEffect, useState } from "react";

const useCarControls = (carId, currentSocketId) => {
  const keyState = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
    l2: 0,
    r2: 0,
  });
  const [isActive, setIsActive] = useState(true);

  const handleFocus = useCallback(() => {
    setIsActive(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsActive(false);
  }, []);

  const handleKeyEvent = useCallback(
    (event, isKeyDown) => {
      if (!isActive || carId !== currentSocketId) return;

      const key = event.key.toLowerCase();
      const arrowKey = event.key;

      if (["w", "a", "s", "d"].includes(key)) {
        keyState.current[key] = isKeyDown;
      }

      //eBrake Button ie Spacebar
      if (key === " ") {
        keyState.current["ebrake"] = isKeyDown;
      }

      if (
        ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"].includes(arrowKey)
      ) {
        keyState.current[arrowKey] = isKeyDown;
      }
    },
    [carId, currentSocketId, isActive]
  );

  const handleGamepadInput = useCallback(() => {
    if (!isActive) return;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[0]; // Assuming the first gamepad for simplicity

    if (!gamepad) return;

    // Map gamepad buttons to keys
    keyState.current["w"] = gamepad.buttons[12].pressed; // D-pad up
    keyState.current["s"] = gamepad.buttons[13].pressed; // D-pad down
    keyState.current["a"] = gamepad.buttons[14].pressed; // D-pad left
    keyState.current["d"] = gamepad.buttons[15].pressed; // D-pad right

    // Map gamepad triggers to keys
    keyState.current["l2"] = gamepad.buttons[6].value; // Left trigger
    // console.log(keyState.current["l2"]);
    keyState.current["r2"] = gamepad.buttons[7].value; // Right trigger
    // console.log(keyState.current["r2"]);

    // eBrake Button
    keyState.current["ebrake"] = gamepad.buttons[1].pressed;

    // Optionally, map analog sticks
    const threshold = 0.5;
    keyState.current["lsUp"] = gamepad.axes[1] < -threshold; // Left stick up
    keyState.current["lsDown"] = gamepad.axes[1] > threshold; // Left stick down
    keyState.current["lsLeft"] = gamepad.axes[0]; // Left stick left
    // console.log(keyState.current["lsLeft"]);
    keyState.current["lsRight"] = gamepad.axes[0]; // Left stick right
  }, [isActive]);

  useEffect(() => {
    const handleKeyDown = (event) => handleKeyEvent(event, true);
    const handleKeyUp = (event) => handleKeyEvent(event, false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // Gamepad polling
    const gamepadInterval = setInterval(handleGamepadInput, 100); // Poll gamepad state every 100ms

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      clearInterval(gamepadInterval);
    };
  }, [handleKeyEvent, handleGamepadInput, handleFocus, handleBlur]);

  // console.log("keyState", keyState);
  return keyState;
};

export default useCarControls;
