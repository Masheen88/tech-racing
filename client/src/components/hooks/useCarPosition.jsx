import { useState, useRef, useCallback, useEffect } from "react";

export function useCarPosition({
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
}) {
  const [position, setPosition] = useState({
    top: defaultSpawnLocation.y,
    left: defaultSpawnLocation.x,
  });
  const [rotation, setRotation] = useState(defaultSpawnLocation.rotation);
  const [driftLine, setDriftLine] = useState([
    { top: defaultSpawnLocation.y, left: defaultSpawnLocation.x },
  ]);
  const velocity = useRef({ x: 0, y: 0 });
  const speed = useRef(0);
  const currentRotationRef = useRef(rotation);
  const animationFrameId = useRef();
  const lastUpdateTime = useRef(performance.now());
  const driftAngle = useRef(0);
  const isDrifting = useRef(false);
  const isEbrakeActive = useRef(false);
  const friction = 0.994;
  const eBrakeFriction = 0.9;
  const threshold = 0.01;
  const lastEmitTime = useRef(0);

  const applyFriction = (currentVelocity, isEbrake) => {
    const currentFriction = isEbrake ? eBrakeFriction : friction;
    const newVelocity = {
      x: currentVelocity.x * currentFriction,
      y: currentVelocity.y * currentFriction,
    };
    if (Math.abs(newVelocity.x) < threshold) newVelocity.x = 0;
    if (Math.abs(newVelocity.y) < threshold) newVelocity.y = 0;
    return newVelocity;
  };

  const updateDriftLine = useCallback(() => {
    const futurePositions = [];
    const simulationSteps = 25;
    const simulationDeltaTime = 0.1; // seconds

    let futureVelocity = { ...velocity.current };
    let futurePosition = { top: position.top, left: position.left };
    let futureRotation = currentRotationRef.current;
    let futureDriftAngle = driftAngle.current;

    for (let i = 0; i < simulationSteps; i++) {
      futureVelocity = applyFriction(futureVelocity, isEbrakeActive.current);

      const angleInRadians = (futureRotation * Math.PI) / 180;
      const driftInRadians = (futureDriftAngle * Math.PI) / 180;
      const totalAngle = angleInRadians + driftInRadians;

      futureVelocity.x = Math.cos(totalAngle) * Math.abs(speed.current);
      futureVelocity.y = Math.sin(totalAngle) * Math.abs(speed.current);

      if (speed.current < 0) {
        futureVelocity.x = -futureVelocity.x;
        futureVelocity.y = -futureVelocity.y;
      }

      futurePosition.top += futureVelocity.y * simulationDeltaTime * 60;
      futurePosition.left += futureVelocity.x * simulationDeltaTime * 60;

      futurePosition.top = Math.max(
        Math.min(futurePosition.top, containerHeight - carHeight),
        0
      );
      futurePosition.left = Math.max(
        Math.min(futurePosition.left, containerWidth - carWidth),
        0
      );

      futurePositions.push({
        top: futurePosition.top,
        left: futurePosition.left,
      });

      if (
        Math.abs(futureVelocity.x) < threshold &&
        Math.abs(futureVelocity.y) < threshold
      ) {
        break;
      }
    }

    setDriftLine(futurePositions);
  }, [
    velocity,
    position,
    currentRotationRef,
    driftAngle,
    isEbrakeActive,
    carHeight,
    carWidth,
    containerHeight,
    containerWidth,
    speed,
  ]);

  const updatePosition = useCallback(() => {
    if (!isCurrentUserCar) {
      if (
        position.top !== carPosition.top ||
        position.left !== carPosition.left
      ) {
        setPosition(carPosition);
      }
      if (rotation !== carRotation) {
        setRotation(carRotation);
      }
      updateEngineSound(carSpeed);

      if (checkCollision(position.top, position.left) === "ramp") {
        triggerJump();
      }

      return;
    }

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastUpdateTime.current) / 1000;
    lastUpdateTime.current = currentTime;

    velocity.current = applyFriction(velocity.current, isEbrakeActive.current);
    if (Math.abs(velocity.current.x) < 0.01) velocity.current.x = 0;
    if (Math.abs(velocity.current.y) < 0.01) velocity.current.y = 0;

    const currentSpeed = Math.sqrt(
      velocity.current.x ** 2 + velocity.current.y ** 2
    );
    if (currentSpeed > max_speed) {
      const speedRatio = max_speed / currentSpeed;
      velocity.current.x *= speedRatio;
      velocity.current.y *= speedRatio;
    }

    setPosition((prev) => {
      let newTop = prev.top + velocity.current.y * deltaTime * 60;
      let newLeft = prev.left + velocity.current.x * deltaTime * 60;

      const collisionType = checkCollision(newTop, newLeft);

      if (collisionType) {
        const angleOfImpact = Math.atan2(
          velocity.current.y,
          velocity.current.x
        );

        if (collisionType === "obstacle" || collisionType === "wall") {
          const deflectionAngle = angleOfImpact + Math.PI / 2;
          const deflectionVector = {
            x: Math.cos(deflectionAngle),
            y: Math.sin(deflectionAngle),
          };

          const deflectionStrength = collisionType === "obstacle" ? 20 : 5;
          velocity.current.x = deflectionVector.x * deflectionStrength;
          velocity.current.y = deflectionVector.y * deflectionStrength;
          speed.current *= 0.5; // Reduce speed significantly after collision

          newTop = prev.top - velocity.current.y * deltaTime * 60;
          newLeft = prev.left - velocity.current.x * deltaTime * 60;

          newTop = Math.max(Math.min(newTop, containerHeight - carHeight), 0);
          newLeft = Math.max(Math.min(newLeft, containerWidth - carWidth), 0);
        } else if (collisionType === "ramp") {
          let initialJumpSpeed = speed.current;
          speed.current = Math.min(initialJumpSpeed * 1.01, max_speed);
          triggerJump();
          setTimeout(() => {
            speed.current = Math.min(speed.current / 1.001, max_speed);
          }, jumpDuration);
        }
      }

      const emitInterval = 25;
      if (currentTime - lastEmitTime.current > emitInterval) {
        socket.emit(
          "updateCarPosition",
          carId,
          { top: newTop, left: newLeft },
          currentRotationRef.current,
          speed.current
        );
        lastEmitTime.current = currentTime;
      }

      return { top: newTop, left: newLeft };
    });

    const speedValue = Math.sqrt(
      velocity.current.x ** 2 + velocity.current.y ** 2
    );
    updateEngineSound(speedValue);

    updateDriftLine();
    animationFrameId.current = requestAnimationFrame(updatePosition);
  }, [
    socket,
    carId,
    containerHeight,
    containerWidth,
    isCurrentUserCar,
    carHeight,
    carWidth,
    carPosition,
    carRotation,
    carSpeed,
    max_speed,
    updateEngineSound,
    jumpDuration,
    triggerJump,
    checkCollision,
    position,
    rotation,
    updateDriftLine,
  ]);

  const updateVelocity = useCallback(() => {
    let angleInRadians = (currentRotationRef.current * Math.PI) / 180;
    let driftInRadians = isDrifting.current
      ? (driftAngle.current * Math.PI) / 180
      : 0;
    let totalAngle = angleInRadians + driftInRadians;

    velocity.current.x = Math.cos(totalAngle) * Math.abs(speed.current);
    velocity.current.y = Math.sin(totalAngle) * Math.abs(speed.current);

    if (speed.current < 0) {
      velocity.current.x = -velocity.current.x;
      velocity.current.y = -velocity.current.y;
    }
  }, [speed, currentRotationRef, driftAngle]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [updatePosition]);

  useEffect(() => {
    if (isCurrentUserCar) {
      speed.current = carSpeed;
      currentRotationRef.current = carRotation;
      updateVelocity();
    }
  }, [isCurrentUserCar, carSpeed, carRotation, updateVelocity]);

  const calculateDrifting = useCallback(() => {
    const angleInRadians = (currentRotationRef.current * Math.PI) / 180;
    const velocityAngle = Math.atan2(velocity.current.y, velocity.current.x);
    let angleDifference = Math.abs(angleInRadians - velocityAngle);

    if (angleDifference > Math.PI) {
      angleDifference = 2 * Math.PI - angleDifference;
    }

    const driftingThreshold = 0.6;
    const isDriftingDueToAngle = angleDifference > driftingThreshold;
    const isDriftingDueToEbrake = isEbrakeActive.current && speed.current > 0;

    isDrifting.current = isDriftingDueToEbrake || isDriftingDueToAngle;

    if (isDrifting.current) {
      const dramaticDriftFactor = 2;
      currentRotationRef.current +=
        ((angleDifference * 180) / Math.PI) * dramaticDriftFactor;
      setRotation(currentRotationRef.current);
    } else {
      isDrifting.current = false;
    }
  }, []);

  useEffect(() => {
    if (isCurrentUserCar) {
      calculateDrifting();
    }
  }, [carSpeed, carRotation, calculateDrifting, isCurrentUserCar]);

  return {
    position,
    setPosition,
    rotation,
    setRotation,
    velocity,
    speed,
    currentRotationRef,
    driftAngle,
    lastUpdateTime,
    isDrifting,
    isEbrakeActive,
    driftLine,
  };
}

export default useCarPosition;
