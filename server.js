const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Target backend (can be overridden by environment variable)
const BACKEND_TARGET = process.env.BACKEND_URL || 'http://52.150.234.195:7268';

// Proxy middleware for /api routes
app.use(
  '/api',
  createProxyMiddleware({
    target: BACKEND_TARGET,
    changeOrigin: true,   // required for virtual hosted backends
    // No pathRewrite – we keep `/api` as is
    logLevel: 'debug',    // helpful for debugging; remove in production
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying ${req.method} ${req.url} -> ${BACKEND_TARGET}${req.url}`);
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).send('Proxy encountered an error.');
    }
  })
);

// Health check endpoint (optional)
app.get('/health', (req, res) => {
  res.status(200).send('Proxy is healthy');
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}, forwarding to ${TARGET}`);
});