// Tunnel.jsx
import PropTypes from "prop-types";

const Tunnel = ({ id, position, size, isVisible }) => {
  const tunnelStyle = {
    zIndex: 7,
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    transform: `rotate(${position.rotation}deg)`,
    backgroundColor: "#2b7dc2", // Change color as needed
    opacity: isVisible ? 1 : 0.5,
    transition: "opacity 2.5s",
  };

  return <div id={id} style={tunnelStyle} />;
};

Tunnel.propTypes = {
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
  isVisible: PropTypes.bool.isRequired,
};

export default Tunnel;
