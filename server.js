const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const api = axios.create({
  baseURL: process.env.BACKEND_URL,
  timeout: 30000,
});

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "HR Workplace Proxy Running",
  });
});

// Proxy all API requests
app.use("/api", async (req, res) => {
  try {
    const url = req.originalUrl.replace("/api", "");

    const response = await api({
      url,
      method: req.method,
      headers: {
        Authorization: req.headers.authorization,
        "Content-Type": req.headers["content-type"],
      },
      params: req.query,
      data: req.body,
      validateStatus: () => true,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      success: false,
      message: "Unable to connect to backend.",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Proxy running on ${PORT}`);
});