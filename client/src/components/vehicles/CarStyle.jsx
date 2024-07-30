import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import raceCarImg from "../../assets/racecar.png";
import BoundingBox from "../hooks/BoundingBox";

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const CarStyle = ({
  carId,
  position,
  rotation,
  jumpEffect,
  isCurrentUserCar,
  getRotatedBoundingBox,
}) => {
  const prevRotation = usePrevious(rotation);
  const carHeight = 50;
  const carWidth = 100;
  const [displayRotation, setDisplayRotation] = useState(rotation);

  useEffect(() => {
    if (prevRotation !== undefined) {
      let adjustedRotation = rotation;

      // Detect crossing the 0/360-degree boundary and adjust rotation to prevent full rotation
      if (prevRotation > 270 && rotation < 90) {
        adjustedRotation = rotation + 360;
      } else if (prevRotation < 90 && rotation > 270) {
        adjustedRotation = rotation - 360;
      }

      // Only update displayRotation if it has actually changed
      if (adjustedRotation !== displayRotation) {
        setDisplayRotation(adjustedRotation);
      }
    } else {
      setDisplayRotation(rotation);
    }
  }, [rotation, prevRotation, displayRotation]);

  // Normalize the display rotation to ensure it remains within the range of 0 to 360 degrees
  const normalizedDisplayRotation = (displayRotation + 360) % 360;

  // Get the rotated bounding box points
  const carRect = getRotatedBoundingBox(
    position.top,
    position.left,
    carWidth,
    carHeight,
    normalizedDisplayRotation
  );

  let carStyle = {
    zIndex: isCurrentUserCar ? 7 : 6,
    // border: "1px solid black",
    height: `${carHeight}px`,
    width: `${carWidth}px`,
    textAlign: "center",
    position: "absolute",
    top: `${position.top}px`,
    left: `${position.left}px`,
    transform: `rotate(${normalizedDisplayRotation}deg) scale(${jumpEffect.scale})`,
  };

  // let hitboxStyle = {
  //   zIndex: 10,
  //   border: "1px dashed red",
  //   height: `${carHeight}px`,
  //   width: `${carWidth}px`,
  //   textAlign: "center",
  //   position: "absolute",
  //   top: `${position.top}px`,
  //   left: `${position.left}px`,
  //   transform: `rotate(${normalizedDisplayRotation}deg) scale(${jumpEffect.scale})`,
  // };

  let shadowStyle = {
    position: "absolute",
    top: "5px",
    left: "5px",
    right: "5px",
    bottom: "5px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    opacity: jumpEffect.shadowOpacity,
    transition: "opacity 0.3s ease-out",
  };

  return (
    <>
      <div className="car" id={`car-id-${carId}`} style={carStyle}>
        <div style={shadowStyle}></div>
        <img
          alt="race car"
          src={raceCarImg}
          style={{
            position: "absolute",
            width: "50px",
            top: "-21px",
            left: "18px",
            transform: `rotate(90deg)`,
          }}
        />
      </div>
      {/* <div style={hitboxStyle}></div> */}
      <BoundingBox points={carRect} />
    </>
  );
};

CarStyle.propTypes = {
  carId: PropTypes.string.isRequired,
  position: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
  }).isRequired,
  rotation: PropTypes.number.isRequired,
  jumpEffect: PropTypes.shape({
    scale: PropTypes.number,
    shadowOpacity: PropTypes.number,
  }).isRequired,
  isCurrentUserCar: PropTypes.bool.isRequired,
  getRotatedBoundingBox: PropTypes.func.isRequired,
};

export default CarStyle;
