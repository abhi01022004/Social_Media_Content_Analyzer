const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');

const app = express();
app.use(cors());
app.use(express.json());

// ensure uploads dir
const UPLOADS = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });

app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
