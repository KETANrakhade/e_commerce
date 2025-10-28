const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the current directory
app.use(express.static('.'));

// Handle SPA routing - serve index.html for any route that doesn't match a file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
});