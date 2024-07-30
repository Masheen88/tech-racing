import propTypes from "prop-types";

const BoundingBox = ({ points }) => {
  return (
    <>
      {points.map((point, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: point.x + "px",
            top: point.y + "px",
            width: "5px",
            height: "5px",
            backgroundColor: "red",
            zIndex: 7,
            opacity: 0.1,
          }}
        ></div>
      ))}
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 7,
          opacity: 0.9,
        }}
      >
        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          style={{ fill: "none", stroke: "red", strokeWidth: 1 }}
        />
      </svg>
    </>
  );
};

BoundingBox.propTypes = {
  points: propTypes.arrayOf(
    propTypes.shape({
      x: propTypes.number.isRequired,
      y: propTypes.number.isRequired,
    })
  ).isRequired,
};

export default BoundingBox;
