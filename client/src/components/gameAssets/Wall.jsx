// Wall.jsx
import PropTypes from "prop-types";

const Wall = ({ id, position, size }) => {
  const wallStyle = {
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    transform: `rotate(${position.rotation}deg)`,
    backgroundColor: "red", // Change color as needed
  };

  return <div id={id} style={wallStyle} />;
};

Wall.propTypes = {
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
};

export default Wall;
