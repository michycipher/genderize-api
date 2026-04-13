const { Router } = require("express");
const { fetchGenderize } = require("../services/genderize");
const { processGenderizeResponse } = require("../utils/processResponse");

const router = Router();

router.get("/classify", async (req, res) => {
  const { name } = req.query;

  if (name === undefined || name === null || name === "") {
    return res.status(400).json({
      status: "error",
      message: "Missing or empty name parameter",
    });
  }

  if (typeof name !== "string") {
    return res.status(422).json({
      status: "error",
      message: "name must be a string",
    });
  }

  let raw;
  try {
    raw = await fetchGenderize(name.trim());
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      status: "error",
      message: err.message || "Server error",
    });
  }

  const result = processGenderizeResponse(raw);

  if (result.edgeCase) {
    return res.status(200).json({
      status: "error",
      message: "No prediction available for the provided name",
    });
  }

  return res.status(200).json({
    status: "success",
    data: result.data,
  });
});

module.exports = router;
