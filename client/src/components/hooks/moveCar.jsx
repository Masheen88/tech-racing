import { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useSocket } from "../utilities/SocketContext";
import { useEngineSound } from "./useEngineSound";
import { useCarPosition } from "./useCarPosition";
import { useJumpEffect } from "./useJumpEffect";
import useCollisionDetection from "./useCollision";
import CarSpeedDisplay from "./carSpeedDisplay";
import CarStyle from "../vehicles/CarStyle";
import useCarControls from "./useCarControls";
import DriftLine from "./vehicleVisuals/DriftLine";

function MoveCar({
  carId,
  currentSocketId,
  containerWidth,
  containerHeight,
  carPosition,
  carRotation,
  carSpeed,
  isCurrentUserCar,
  obstacles,
  walls,
  ramps,
  tunnels,
  inTunnel,
  setInTunnel,
  IsReverbEnabled,
  setIsReverbEnabled,
  defaultSpawnLocation,
}) {
  const socket = useSocket();
  const defaultSpawnPosition = { top: 100, left: 100 };
  const carWidth = 100;
  const carHeight = 50;
  const max_speed = 15; // Max Speed
  const jumpDuration = 650; // Jump duration in milliseconds
  const maxJumpScale = 2.8; // Maximum scale of the car during jump
  const accelerationRate = 0.02; // Acceleration rate
  const decelerationRate = 0.017; // Deceleration rate
  const brakingRate = 0.02; // Braking rate (reduced for debugging)
  // const toRadians = (angle) => angle * (Math.PI / 180);

  const keyState = useCarControls(carId, currentSocketId);

  const animationFrameId = useRef();
  const { updateEngineSound } = useEngineSound(max_speed, !IsReverbEnabled);
  const { jumpEffect, triggerJump } = useJumpEffect(jumpDuration, maxJumpScale);
  const [isReversing, setIsReversing] = useState(false);
  const { checkCollision, getRotatedBoundingBox } = useCollisionDetection(
    carHeight,
    carWidth,
    obstacles,
    walls,
    ramps,
    tunnels,
    setIsReverbEnabled,
    inTunnel,
    setInTunnel,
    jumpEffect,
    carPosition,
    carRotation,
    isCurrentUserCar
  );

  const handleTunnelState = useCallback(() => {
    if (inTunnel && !IsReverbEnabled) {
      setIsReverbEnabled(true);
    } else if (!inTunnel && IsReverbEnabled) {
      setIsReverbEnabled(false);
    }
  }, [inTunnel, IsReverbEnabled, setIsReverbEnabled]);

  useEffect(() => {
    handleTunnelState();
  }, [handleTunnelState]);

  const {
    position,
    setPosition,
    rotation,
    setRotation,
    // velocity,
    speed,
    currentRotationRef,
    // driftAngle,
    // isDrifting,
    isEbrakeActive,
    driftLine,
  } = useCarPosition({
    isCurrentUserCar,
    carPosition,
    carRotation,
    carSpeed,
    containerWidth,
    containerHeight,
    carHeight,
    carWidth,
    max_speed,
    updateEngineSound,
    triggerJump,
    jumpDuration,
    checkCollision,
    socket,
    carId,
    defaultSpawnLocation,
  });

  const normalizeRotation = (angle) => {
    angle = angle % 360;
    if (angle > 180) {
      angle -= 360;
    } else if (angle <= -180) {
      angle += 360;
    }
    return angle;
  };

  const interpolateRotation = useCallback((from, to) => {
    from = normalizeRotation(from);
    to = normalizeRotation(to);

    let difference = to - from;

    // Adjust for the shortest path
    if (difference > 180) {
      difference -= 360;
    } else if (difference < -180) {
      difference += 360;
    }

    return normalizeRotation(from + difference);
  }, []);

  const updatePosition = useCallback(() => {
    if (!isCurrentUserCar) {
      setPosition(carPosition);
      setRotation((prevRotation) =>
        interpolateRotation(prevRotation, normalizeRotation(carRotation))
      );
      updateEngineSound(carSpeed);
      return;
    }
  }, [
    carPosition,
    carRotation,
    carSpeed,
    isCurrentUserCar,
    setPosition,
    setRotation,
    updateEngineSound,
    interpolateRotation,
  ]);

  useEffect(() => {
    const updateSpeedAndDirection = () => {
      updateRotation();
      updateTargetSpeed();
      applyBrakingLogic();
      updateAcceleration();

      // const collisionResult = checkCollision(
      //   position.top + Math.sin(toRadians(rotation.current)) * speed.current,
      //   position.left + Math.cos(toRadians(rotation.current)) * speed.current
      // );

      // if (collisionResult === "wall") {
      //   speed.current *= 0.999; // Reduce speed to half upon wall collision
      // }
    };

    const updateRotation = () => {
      const turningSpeed = 3.0; // Base turning rate
      const sensitivity = 0.5; // Sensitivity factor for analog sticks

      const updateRotationForKey = (direction, analogKey) => {
        setRotation((prevRotation) => {
          const analogTurnSpeed = keyState.current[analogKey]
            ? turningSpeed * keyState.current[analogKey] * sensitivity
            : 0;
          const newRotation =
            prevRotation +
            (speed.current < 0
              ? direction * turningSpeed
              : -direction * turningSpeed) +
            analogTurnSpeed;
          return interpolateRotation(
            prevRotation,
            normalizeRotation(newRotation)
          );
        });
      };

      if (
        keyState.current["d"] ||
        keyState.current["ArrowRight"] ||
        keyState.current["lsLeft"]
      ) {
        updateRotationForKey(-1, "lsLeft");
      }

      if (
        keyState.current["a"] ||
        keyState.current["ArrowLeft"] ||
        keyState.current["lsRight"]
      ) {
        updateRotationForKey(1, "lsRight");
      }
    };

    const updateTargetSpeed = () => {
      if (keyState.current["w"] || keyState.current["ArrowUp"]) {
        setIsReversing(false);
        targetSpeed = max_speed;
      } else if (keyState.current["r2"] > 0) {
        setIsReversing(false);
        targetSpeed = max_speed * keyState.current["r2"];
      } else if (keyState.current["l2"] > 0) {
        setIsReversing(true);
        targetSpeed = -max_speed * keyState.current["l2"];
      } else if (keyState.current["s"] || keyState.current["ArrowDown"]) {
        // Handle braking while in reverse
        if (isReversing && speed.current <= 0) {
          targetSpeed = Math.min(speed.current - accelerationRate, -max_speed);
        }
      } else {
        // Ensure we maintain reversing state if no other forward input is pressed
        if (isReversing) {
          targetSpeed = Math.max(speed.current - decelerationRate, -max_speed);
        } else {
          targetSpeed = Math.max(speed.current - decelerationRate, 0);
        }
      }
    };

    const applyBrakingLogic = () => {
      if (keyState.current["s"] || keyState.current["ArrowDown"]) {
        if (isReversing) {
          targetSpeed = speed.current + brakingRate;
          if (targetSpeed > 0) {
            targetSpeed = 0;
            setIsReversing(false);
          }
        } else {
          targetSpeed = speed.current - brakingRate;
          if (targetSpeed < 0) {
            targetSpeed = Math.max(targetSpeed, -max_speed / 4);
            setIsReversing(true);
          } else if (targetSpeed === 0) {
            setIsReversing(false);
          }
        }
      }
    };

    const updateAcceleration = () => {
      let speedDifference = targetSpeed - speed.current;
      let accelerationIncrement =
        speedDifference > 0
          ? Math.min(speedDifference, accelerationRate)
          : Math.max(speedDifference, -decelerationRate);

      if (
        !keyState.current["w"] &&
        !keyState.current["ArrowUp"] &&
        keyState.current["r2"] === 0 && // Ensure this check includes R2 trigger
        speed.current > 0
      ) {
        accelerationIncrement = -decelerationRate;
      }

      if (
        (keyState.current["s"] || keyState.current["ArrowDown"]) &&
        speed.current > 0
      ) {
        accelerationIncrement = -brakingRate;
      }

      if (
        (keyState.current["s"] || keyState.current["ArrowDown"]) &&
        speed.current < 0
      ) {
        accelerationIncrement = brakingRate; // Adjust to handle reverse braking
      }

      speed.current += accelerationIncrement;
    };

    let targetSpeed = 0;

    const intervalId = setInterval(updateSpeedAndDirection, 10);

    return () => clearInterval(intervalId);
  }, [
    keyState,
    interpolateRotation,
    isReversing,
    setIsReversing,
    checkCollision,
    setRotation,
    speed,
    rotation,
  ]);

  useEffect(() => {
    currentRotationRef.current = rotation;
  }, [rotation, currentRotationRef]);

  useEffect(() => {
    console.log("Ebrake", isEbrakeActive);
    isEbrakeActive.current = !!isEbrakeActive;
  }, [isEbrakeActive]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [updatePosition]);

  // if position left is NaN set it to position.x
  if (isNaN(position.left)) {
    console.log("Position left is NaN: ", position);
    position.left = position.x;
  }

  // if position top is NaN set it to position.y
  if (isNaN(position.top)) {
    console.log("Position top is NaN: ", position);
    position.top = position.y;
  }

  return (
    <>
      <DriftLine
        carWidth={carWidth}
        carHeight={carHeight}
        position={{
          top: position.top,
          left: position.left,
        }}
        rotation={rotation}
        driftLine={driftLine}
      />
      <CarSpeedDisplay {...{ currentSocketId, carId, speed, position }} />
      <div>
        <CarStyle
          {...{
            carId,
            position,
            rotation,
            jumpEffect,
            isCurrentUserCar,
            defaultSpawnPosition,
            getRotatedBoundingBox,
          }}
        />
      </div>
    </>
  );
}

MoveCar.propTypes = {
  carId: PropTypes.string.isRequired,
  currentSocketId: PropTypes.string.isRequired,
  containerWidth: PropTypes.number.isRequired,
  containerHeight: PropTypes.number.isRequired,
  carPosition: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
  }).isRequired,
  carRotation: PropTypes.number,
  carSpeed: PropTypes.number,
  isCurrentUserCar: PropTypes.bool.isRequired,
  obstacles: PropTypes.array,
  walls: PropTypes.array,
  ramps: PropTypes.array,
  IsReverbEnabled: PropTypes.bool,
  setIsReverbEnabled: PropTypes.func,
  tunnels: PropTypes.array,
  defaultSpawnLocation: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
    rotation: PropTypes.number,
  }),
  inTunnel: PropTypes.bool,
  setInTunnel: PropTypes.func,
};

export default MoveCar;
