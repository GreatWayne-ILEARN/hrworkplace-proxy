const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Allow your frontend origin to call this proxy
app.use(cors({
  origin: 'https://hrworkplace-revamp.onrender.com', // lock this down to your frontend
  credentials: true,
}));

// Health check endpoint (useful for Render + for you to verify it's alive)
app.get('/healthz', (req, res) => res.status(200).send('ok'));

// Proxy everything else to the real backend
app.use('/', createProxyMiddleware({
  target: 'http://52.150.234.195:7268',
  changeOrigin: true,
  logger: console,
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}, forwarding to http://52.150.234.195:7268`);
});