require('dotenv').config();
const express = require('express');
const gateway = require('./mcp-gateway/request-gateway');

const app = express();
const port = process.env.GATEWAY_PORT || 3001;

app.use('/api', gateway);

app.listen(port, () => {
  console.log(`MCP Gateway listening on port ${port}`);
});
