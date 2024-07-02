const express = require('express');
const mongoose = require('mongoose');
const musicRoutes = require('./routes/musicRoutes');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/music-sonata';

app.use(express.json());
app.use('/api', musicRoutes);

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

