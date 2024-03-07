import express from 'express';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

import detailed from './src/backend/detailed.js';
import summary from './src/backend/summary.js';

// Setting up express
const app = express();

const frontendDir = 'dist';

// Directing express to the front end in the /dist dir
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, frontendDir)));

// Get request to the root directory
app.get('/weaklyPrices/', (req, res) => {
  console.log('Sending', path.join(__dirname, frontendDir, 'index.html'));
  res.sendFile(path.join(__dirname, frontendDir, 'index.html'));
});

// couple of api routes
app.get('/weaklyPrices/detailed', detailed);
app.get('/weaklyPrices/summary', summary);

app.get('*', (req, res) => {
    res.send("Error! No resoruces served at this endpoint");
})

// Setting up port number
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});