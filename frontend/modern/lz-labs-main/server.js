// Health check endpoint for the frontend
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const app = express();

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'gateway-frontend',
    version: '1.0.0'
  });
});

// Serve static files
app.use(express.static('dist'));

// Catch all handler for SPA

// Apply rate limiting to the catch-all route to prevent abuse
const spaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.get('*', spaLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🌐 Gateway frontend running on port ${port}`);
});

module.exports = app;