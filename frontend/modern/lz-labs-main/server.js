// Health check endpoint for the frontend
const express = require('express');
const path = require('path');
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
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🌐 Gateway frontend running on port ${port}`);
});

module.exports = app;