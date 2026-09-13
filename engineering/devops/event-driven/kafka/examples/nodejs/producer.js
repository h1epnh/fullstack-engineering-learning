const { Kafka } = require('kafkajs');

// Kafka configuration
const kafka = new Kafka({
  clientId: 'my-producer',
  brokers: ['localhost:9094'], // Use 9094 for external connections
});

const producer = kafka.producer();

const run = async () => {
  // Connect to Kafka
  await producer.connect();
  console.log('✅ Producer connected to Kafka');

  // Send messages
  let messageCount = 0;
  
  const sendMessage = async () => {
    try {
      const message = {
        key: `key-${messageCount}`,
        value: `Hello Kafka! Message #${messageCount} at ${new Date().toISOString()}`,
      };

      await producer.send({
        topic: 'my-first-topic',
        messages: [message],
      });

      console.log(`📤 Sent: ${message.value}`);
      messageCount++;
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  // Send a message every 2 seconds
  setInterval(sendMessage, 2000);
};

// Handle graceful shutdown
const shutdown = async () => {
  console.log('\\n🛑 Shutting down producer...');
  await producer.disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

run().catch(console.error);
