import PropTypes from "prop-types";

const Ramp = ({ id, position, size, direction }) => {
  const obstacleStyle = {
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    transform: `rotate(${position.rotation}deg)`,
    backgroundColor: "green", // Change color as needed
    zIndex: 5,
  };

  const arrowStyle = {
    position: "absolute",
    width: "0",
    height: "0",
    borderLeft: "10px solid transparent",
    borderRight: "10px solid transparent",
    borderBottom: "20px solid white",
  };

  const getArrowPosition = (direction) => {
    switch (direction) {
      case "up":
        return {
          top: "10%",
          left: "50%",
          transform: "translateX(-50%) rotate(180deg)",
        };
      case "down":
        return {
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%) rotate(0deg)",
        };
      case "left":
        return {
          left: "10%",
          top: "50%",
          transform: "translateY(-50%) rotate(-270deg)",
        };
      case "right":
        return {
          right: "10%",
          top: "50%",
          transform: "translateY(-50%) rotate(270deg)",
        };
      default:
        return {};
    }
  };

  return (
    <div id={id} style={obstacleStyle} data-direction={direction}>
      <div style={{ ...arrowStyle, ...getArrowPosition(direction) }} />
    </div>
  );
};

Ramp.propTypes = {
  id: PropTypes.string.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    rotation: PropTypes.number.isRequired,
  }).isRequired,
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  direction: PropTypes.string.isRequired,
};

export default Ramp;
