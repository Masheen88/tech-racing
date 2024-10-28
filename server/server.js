const express = require("express");
const path = require("path");
const compression = require("compression");

const app = express();

// Enable compression middleware
app.use(compression());

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, "dist")));

// Handle any requests that don't match the static files
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
