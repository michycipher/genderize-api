require("dotenv").config();
const https = require("https");

const GENDERIZE_BASE = process.env.GENDERIZE_BASE_URL || "https://api.genderize.io";

function fetchGenderize(name) {
  return new Promise((resolve, reject) => {
    const url = `${GENDERIZE_BASE}/?name=${encodeURIComponent(name)}`;

    const options = {
      headers: {
        "User-Agent": "Node.js/https",
        "Accept": "application/json",
      },
    };

    function onError() {
      reject(
        Object.assign(new Error("Could not reach upstream API"), {
          type: "UPSTREAM_ERROR",
          statusCode: 502,
        })
      );
    }

    function handleResponse(res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return https.get(res.headers.location, options, handleResponse).on("error", onError);
      }

      if (res.statusCode >= 500) {
        res.resume();
        return reject(
          Object.assign(new Error("Upstream API error"), {
            type: "UPSTREAM_ERROR",
            statusCode: 502,
          })
        );
      }

      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(raw));
        } catch {
          reject(
            Object.assign(new Error("Invalid response from upstream API"), {
              type: "UPSTREAM_ERROR",
              statusCode: 502,
            })
          );
        }
      });
    }

    const req = https.get(url, options, handleResponse);

    req.on("error", onError);

    req.setTimeout(4000, () => {
      req.destroy();
      reject(
        Object.assign(new Error("Upstream API timed out"), {
          type: "UPSTREAM_ERROR",
          statusCode: 502,
        })
      );
    });
  });
}

module.exports = { fetchGenderize };