const express = require("express");
const classifyRouter = require("./routes/classify");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Routes 
app.use("/api", classifyRouter);

app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ status: "error", message: "Internal server error" });
});

module.exports = app;
