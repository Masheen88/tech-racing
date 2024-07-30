import { useCallback, useEffect, useState, useRef } from "react";

export const useCollisionDetection = (
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
) => {
  const [tunnelCollisionState, setTunnelCollisionState] = useState(inTunnel);
  const previousPositionRef = useRef({ top: 0, left: 0 });
  const collisionTimeRef = useRef(null);
  const collisionTypeRef = useRef(null);

  const toRadians = (angle) => angle * (Math.PI / 180);

  const rotatePoint = useCallback((cx, cy, x, y, angle) => {
    const radians = toRadians(angle);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nx = cos * (x - cx) - sin * (y - cy) + cx;
    const ny = sin * (x - cx) + cos * (y - cy) + cy;
    return { x: nx, y: ny };
  }, []);

  const getRotatedBoundingBox = useCallback(
    (top, left, width, height, angle) => {
      const cx = left + width / 2;
      const cy = top + height / 2;

      const points = [
        { x: left, y: top },
        { x: left + width, y: top },
        { x: left, y: top + height },
        { x: left + width, y: top + height },
        { x: left + width / 2, y: top },
        { x: left + width / 2, y: top + height },
        { x: left, y: top + height / 2 },
        { x: left + width, y: top + height / 2 },
        { x: left + width / 4, y: top },
        { x: left + (3 * width) / 4, y: top },
        { x: left + width / 4, y: top + height },
        { x: left + (3 * width) / 4, y: top + height },
        { x: left, y: top + height / 4 },
        { x: left, y: top + (3 * height) / 4 },
        { x: left + width, y: top + height / 4 },
        { x: left + width, y: top + (3 * height) / 4 },
        { x: left + width / 2, y: top + height / 2 }, // Center point
        { x: left + width / 4, y: top + height / 4 }, // Top-left quarter
        { x: left + (3 * width) / 4, y: top + height / 4 }, // Top-right quarter
        { x: left + width / 4, y: top + (3 * height) / 4 }, // Bottom-left quarter
        { x: left + (3 * width) / 4, y: top + (3 * height) / 4 }, // Bottom-right quarter
      ];

      return points.map((point) =>
        rotatePoint(cx, cy, point.x, point.y, angle)
      );
    },
    [rotatePoint]
  );

  const isPointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y;
      const xj = polygon[j].x,
        yj = polygon[j].y;

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const isColliding = useCallback(
    (carRect, obstacleRect, obstacleRotation) => {
      const rotatedObstacleRect = getRotatedBoundingBox(
        obstacleRect.top,
        obstacleRect.left,
        obstacleRect.right - obstacleRect.left,
        obstacleRect.bottom - obstacleRect.top,
        obstacleRotation
      );

      return carRect.some((carPoint) =>
        isPointInPolygon(carPoint, rotatedObstacleRect)
      );
    },
    [getRotatedBoundingBox]
  );

  const checkCollision = useCallback(
    (newTop, newLeft) => {
      if (isNaN(newTop) || isNaN(newLeft) || isNaN(carRotation)) {
        return null;
      }

      const carRect = getRotatedBoundingBox(
        newTop,
        newLeft,
        carWidth,
        carHeight,
        carRotation
      );

      const previousPosition = previousPositionRef.current;
      const deltaX = newLeft - previousPosition.left;
      const deltaY = newTop - previousPosition.top;

      let collisionDetected = null;

      for (const obstacle of obstacles) {
        const obstacleRect = {
          top: obstacle.position.y,
          left: obstacle.position.x,
          bottom: obstacle.position.y + obstacle.size.height,
          right: obstacle.position.x + obstacle.size.width,
        };

        if (isColliding(carRect, obstacleRect, obstacle.rotation)) {
          collisionDetected = "obstacle";
          break;
        }
      }

      if (!collisionDetected) {
        for (const wall of walls) {
          const wallRect = {
            top: wall.position.y,
            left: wall.position.x,
            bottom: wall.position.y + wall.size.height,
            right: wall.position.x + wall.size.width,
          };

          if (isColliding(carRect, wallRect, 0)) {
            collisionDetected = "wall";
            break;
          }
        }
      }

      if (!collisionDetected) {
        for (const ramp of ramps) {
          const rampRect = {
            top: ramp.position.y,
            left: ramp.position.x,
            bottom: ramp.position.y + ramp.size.height,
            right: ramp.position.x + ramp.size.width,
          };

          const allowedDirection = ramp.direction;
          const carCenterX =
            (carRect[0].x + carRect[1].x + carRect[2].x + carRect[3].x) / 4;
          const carCenterY =
            (carRect[0].y + carRect[1].y + carRect[2].y + carRect[3].y) / 4;
          const rampCenterX = (rampRect.left + rampRect.right) / 2;
          const rampCenterY = (rampRect.top + rampRect.bottom) / 2;

          const isAllowedDirection =
            (allowedDirection === "up" &&
              deltaY < 0 &&
              carCenterY > rampCenterY) ||
            (allowedDirection === "down" &&
              deltaY > 0 &&
              carCenterY < rampCenterY) ||
            (allowedDirection === "left" &&
              deltaX < 0 &&
              carCenterX > rampCenterX) ||
            (allowedDirection === "right" &&
              deltaX > 0 &&
              carCenterX < rampCenterX);

          if (isAllowedDirection && isColliding(carRect, rampRect, 0)) {
            collisionDetected = "ramp";
            break;
          }
        }
      }

      let tunnelCollision = false;
      for (const tunnel of tunnels) {
        const tunnelRect = {
          top: tunnel.position.y,
          left: tunnel.position.x,
          bottom: tunnel.position.y + tunnel.size.height,
          right: tunnel.position.x + tunnel.size.width,
        };

        if (isColliding(carRect, tunnelRect, 0)) {
          tunnelCollision = true;
          break;
        }
      }

      if (tunnelCollisionState !== tunnelCollision) {
        setTunnelCollisionState(tunnelCollision);
      }
      previousPositionRef.current = { top: newTop, left: newLeft };

      if (collisionDetected) {
        if (
          !collisionTimeRef.current ||
          collisionTypeRef.current !== collisionDetected
        ) {
          collisionTimeRef.current = Date.now();
          collisionTypeRef.current = collisionDetected;
        }
      } else {
        collisionTimeRef.current = null;
        collisionTypeRef.current = null;
      }

      return collisionDetected
        ? collisionDetected
        : tunnelCollision
        ? "tunnel"
        : null;
    },
    [
      carHeight,
      carWidth,
      obstacles,
      walls,
      ramps,
      tunnels,
      carRotation,
      getRotatedBoundingBox,
      isColliding,
      tunnelCollisionState,
    ]
  );

  useEffect(() => {
    if (tunnelCollisionState !== inTunnel) {
      if (isCurrentUserCar) {
        setInTunnel(tunnelCollisionState);
      }
    }
  }, [tunnelCollisionState, setInTunnel, isCurrentUserCar, inTunnel]);

  useEffect(() => {
    if (inTunnel) {
      setIsReverbEnabled(true);
    } else {
      setIsReverbEnabled(false);
    }
  }, [inTunnel, setIsReverbEnabled]);

  useEffect(() => {
    const handleCollisionPushOut = () => {
      if (collisionTimeRef.current && collisionTypeRef.current === "obstacle") {
        const elapsed = Date.now() - collisionTimeRef.current;
        if (elapsed > 2000) {
          // Push the car out of the obstacle
          const moveX =
            Math.sign(carPosition.left - previousPositionRef.current.left) * 10;
          const moveY =
            Math.sign(carPosition.top - previousPositionRef.current.top) * 10;

          carPosition.top -= moveY;
          carPosition.left -= moveX;
          collisionTimeRef.current = null;
          collisionTypeRef.current = null;
        }
      }
    };

    const intervalId = setInterval(handleCollisionPushOut, 20);

    return () => clearInterval(intervalId);
  }, [carPosition]);

  return { checkCollision, getRotatedBoundingBox };
};

export default useCollisionDetection;
