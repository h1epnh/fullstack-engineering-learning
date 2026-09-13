const { Kafka } = require('kafkajs');

// Kafka configuration
const kafka = new Kafka({
    clientId: 'my-consumer',
    brokers: ['localhost:9094'],
});

const consumer = kafka.consumer({ groupId: 'my-group' });

const run = async () => {
    // Connect to Kafka
    await consumer.connect();
    console.log('✅ Consumer connected to Kafka');

    // Subscribe to topic
    await consumer.subscribe({
        topic: 'my-first-topic',
        fromBeginning: true // Set to false to only consume new messages
    });

    console.log('📥 Subscribed to topic: my-first-topic');
    console.log('Waiting for messages...\\n');

    // Consume messages
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const key = message.key?.toString();
            const value = message.value.toString();
            const offset = message.offset;

            console.log({
                topic,
                partition,
                offset,
                key,
                value,
                timestamp: new Date(parseInt(message.timestamp)).toISOString(),
            });
        },
    });
};

// Handle graceful shutdown
const shutdown = async () => {
    console.log('\\n🛑 Shutting down consumer...');
    await consumer.disconnect();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

run().catch(console.error);
