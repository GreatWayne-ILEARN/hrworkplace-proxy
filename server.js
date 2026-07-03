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
    console.log("Incoming:", req.method, req.originalUrl);
    console.log("Backend:", process.env.BACKEND_URL);

    const response = await api({
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      params: req.query,
      data: req.body,
      validateStatus: () => true,
    });

    console.log("Status:", response.status);

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error(err.response?.status);
    console.error(err.response?.data);
    console.error(err.message);

    res.status(500).json({
      error: err.message,
      backend: err.response?.data,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Proxy running on ${PORT}`);
});