import express from 'express';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

import detailed from './api/detailed.js';
import summary from './api/summary.js';

// Setting up express
const app = express();

// Directing express to the front end in the /dist dir
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../dist')));

// Get request to the root directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// couple of api routes
app.get('/detailed', detailed);
app.get('/summary', summary);

app.get('*', (req, res) => {
    res.send("Error!");
})

// Setting up port number
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});