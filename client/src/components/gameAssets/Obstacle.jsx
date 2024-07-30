import PropTypes from "prop-types";

const Obstacle = ({ id, position, size, rotation }) => {
  const obstacleStyle = {
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    transform: `rotate(${rotation}deg)`,
    backgroundColor: "blue", // Change color as needed
    border: "1px dashed green",
  };

  return <div id={id} style={obstacleStyle} />;
};

Obstacle.propTypes = {
  id: PropTypes.string.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  rotation: PropTypes.number.isRequired,
};

export default Obstacle;
