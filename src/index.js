const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const fs = require('fs')
const musicRoutes = require('./routes/musicRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/music-sonata';

app.use('/api/track', express.static(path.join(__dirname, '../../storage')));

app.use(express.json());
app.use('/api', musicRoutes);


app.get('/stream/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../storage', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send('File not found');
      return;
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

mongoose.connect(DB_URI)
  .then(() => {
      console.log("Connected to MongoDB");

      app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
      });
  })
  .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
  });

