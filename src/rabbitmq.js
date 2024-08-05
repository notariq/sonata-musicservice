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
        console.log('Connected to RabbitMQ');
        channel = ch;
    });
});

// Function to publish a message to a queue
const publishToQueue = async (queueName, data) => {
    if (!channel) {
        throw new Error("Channel is not created yet");
    }
    channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
};

// Function to consume messages from a queue
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

// Function to subscribe to an exchange
const subscribeToExchange = async (exchangeName, queueName, routingKey, callback) => {
    if (!channel) {
        throw new Error("Channel is not created yet");
    }

    // Declare an exchange
    channel.assertExchange(exchangeName, 'fanout', { durable: false });

    // Declare a queue
    channel.assertQueue(queueName, { exclusive: true }, (error, q) => {
        if (error) {
            throw error;
        }
        
        // Bind the queue to the exchange
        channel.bindQueue(q.queue, exchangeName, routingKey);
        
        // Start consuming messages from the queue
        channel.consume(q.queue, (msg) => {
            if (msg !== null) {
                callback(JSON.parse(msg.content.toString()));
                channel.ack(msg);
            }
        }, { noAck: false });

        console.log(`Subscribed to exchange '${exchangeName}' with queue '${q.queue}' and routing key '${routingKey}'`);
    });
};

module.exports = { publishToQueue, consumeQueue, subscribeToExchange };


// For Controllers
const publishNewSong = async (songData) => {
    try {
        await publishToQueue('song_releases', songData);
        console.log(`Published new song release: ${songData.title}`);
    } catch (error) {
        console.error('Failed to publish message:', error);
    }
};

const publishNewAlbum = async (albumData) => {
    try {
        await publishToQueue('album_releases', albumData);
        console.log(`Published new song release: ${albumData.title}`);
    } catch (error) {
        console.error('Failed to publish message:', error);
    }
};

module.exports = { publishNewSong, publishNewAlbum }