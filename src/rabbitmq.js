const amqp = require('amqplib/callback_api');

let channel = null;
const MQ_URI = process.env.MQ_URI || 'amqp://localhost:5672';

const RABBIT_MQ_QUEUES = ['ADDED_TO_PLAYLIST']

// Connect to RabbitMQ
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
        
        // Initiates Queues
        RABBIT_MQ_QUEUES.map((queue) => {
            channel.assertQueue(queue, { durable: true });
            channel.consume(queue, (msg) => {
                if (msg !== null) {
                    channel.ack(msg);
                    console.log('Message consumed from', queue);
                }
            });
        });
    });
});

// Function to publish a message to a queue
const publishToQueue = async (queueName, data) => {
    if (!channel) {
        throw new Error("Channel is not created yet");
    }
    channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
    console.log('Message created for', queueName);
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

module.exports = { publishToQueue, consumeQueue };