const express = require('express');
const mongoose = require('mongoose');
const musicRoutes = require('./routes/musicRoutes');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_URI = process.env.DB_URI || 'mongodb://mongo:27017/sonata';

app.use(express.json());
app.use('/api', musicRoutes);

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://user:password@localhost:5672');
        const channel = await connection.createChannel();
        await channel.assertQueue('songs_queue');
        channel.consume('songs_queue', async (msg) => {
        if (msg !== null) {
            const { songId } = JSON.parse(msg.content.toString());
            // Validate song existence
            const song = await Song.findById(songId);
            if (song) {
            console.log(`Song ${songId} exists`);
            } else {
            console.log(`Song ${songId} does not exist`);
            }
            channel.ack(msg);
        }
        });
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
    }
}

mongoose.connect(DB_URI)
    .then(() => {
        console.log("Connected to MongoDB");

        connectRabbitMQ()

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });

