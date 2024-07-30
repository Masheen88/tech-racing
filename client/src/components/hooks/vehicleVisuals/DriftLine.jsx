import PropTypes from "prop-types";

// eslint-disable-next-line no-unused-vars
const DriftLine = ({ position, rotation, driftLine, carWidth, carHeight }) => {
  if (
    !position ||
    typeof position.top !== "number" ||
    typeof position.left !== "number"
  ) {
    return null;
  }

  // Generate the SVG path data from driftLine points
  const pathData = driftLine.reduce((acc, point, index) => {
    return acc + `${index === 0 ? "M" : "L"}${point.left},${point.top} `;
  }, "");

  return (
    <div>
      {/* <div
        style={{
          position: "absolute",
          top: position.top,
          left: position.left,
          transform: `rotate(${rotation}deg)`,
          width: carWidth,
          height: carHeight,
          backgroundColor: "red", // example car style
        }}
      /> */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // ensure the SVG does not block other interactions
        }}
      >
        <path d={pathData} stroke="blue" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
};

DriftLine.propTypes = {
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,

  rotation: PropTypes.number.isRequired,
  driftLine: PropTypes.arrayOf(
    PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    })
  ).isRequired,
  carWidth: PropTypes.number.isRequired,
  carHeight: PropTypes.number.isRequired,
};

export default DriftLine;
