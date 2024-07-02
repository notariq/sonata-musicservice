const amqp = require('amqplib/callback_api');

let channel = null;
const MQ_URI = process.env.MQ_URI || 'amqp://localhost:5672';

amqp.connect(MQ_URI, (error0, connection) => {
    if (error0) {
        throw error0;
    }
    connection.createChannel((error1, ch) => {
        if (error1) {
            throw error1;
        }
        channel = ch;
    });
});

const publishToQueue = async (queueName, data) => {
    if (!channel) {
        throw new Error("Channel is not created yet");
    }
    channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
};

const consumeQueue = async (queueName, callback) => {
    if (!channel) {
        throw new Error("Channel is not created yet");
    }
    channel.assertQueue(queueName, { durable: true });
    channel.consume(queueName, (msg) => {
        if (msg !== null) {
            callback(JSON.parse(msg.content.toString()));
            channel.ack(msg);
        }
    });
};

module.exports = { publishToQueue, consumeQueue };

// Communcation between music service and playlist service
// Using RabbitMQ

const amqp = require('amqplib');
const Music = require('../models/music');

let connection = null;

exports.connectRabbitMQ = async () => {
    try {
        if (!connection) {
            connection = await amqp.connect(process.env.MQ_URI || 'amqp://localhost:5672');
        } 
        if (!channel) {
            channel = await connection.createChannel();
        }
        console.log("Connected to RabbitMQ")
        return channel;

    } catch(err) {
        console.log("Error Connecting to RabbitMQ", err)
    }
}

exports.sendMetaDataResponse = async() => {
    const requestQueue = 'metadata_request_queue';
    const responseQueue = 'metadata_response_queue';
    
    await channel.assertQueue(requestQueue, { durable: true });
    
    console.log(`Waiting for metadata requests in ${requestQueue}. To exit press CTRL+C`);
    
    channel.consume(requestQueue, async (message) => {
        const { musicId, correlationId, replyTo } = JSON.parse(message.content.toString());
        console.log(`Received metadata request for music ID: ${musicId}`);
        
        // Simulate metadata retrieval
        const metadata = await getMusicMetadata(musicId);
        
        // Send metadata back to Playlist Service
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(metadata)), { correlationId });
        
        channel.ack(message);
    }, { noAck: false });
    
    process.on('SIGINT', () => {
        channel.close();
        connection.close();
    });
}

async function getMusicMetadata(musicId) {
    try {
        // Assuming `musicId` is used to find the music document in MongoDB
        const music = await Music.findById(musicId);

        if (!music) {
            throw new Error('Music not found');
        }

        return {
            musicId: music._id,
            title: music.songTitle,
            artist: music.artist,
            album: music.albumTitle,
            duration: music.songDuration,
            filePath: music.songPath,
            picturePath: music.songPicturePath
        };
    } catch (err) {
        console.error(`Error fetching music metadata: ${err.message}`);
        // You can handle the error accordingly, e.g., return a default response or rethrow the error
        throw err;
    }   
}

module.exports = { connectRabbitMQ }
