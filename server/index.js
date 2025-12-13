const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => res.send('pong'));
app.get('/api/version', (req, res) => res.json({ version: 'v2.19', type: 'PURE_JS_DEBUG', env: process.env.NODE_ENV }));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DEBUG_JS] Server starting on port ${PORT}`);
});
