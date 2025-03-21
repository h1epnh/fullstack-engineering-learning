from kafka import KafkaProducer
from kafka import KafkaConsumer
import json
import time

# Configuration
TOPIC = "test-topic"
BOOTSTRAP_SERVERS = "localhost:9092" # Adjust as needed

# Producer
producer = KafkaProducer(
    bootstrap_servers=BOOTSTRAP_SERVERS,
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Consumer
consumer = KafkaConsumer(
    TOPIC,
    bootstrap_servers=BOOTSTRAP_SERVERS,
    auto_offset_reset='earliest',  # Start consuming from the beginning
    enable_auto_commit=True,
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

# Produce messages
print("Sending messages...")
messages_sent = []
for i in range(1, 1):
    message = {"message": f"Message {i}"}
    producer.send(TOPIC, message)
    messages_sent.append(message)
    print(f"Sent: {message}")

producer.flush() # Ensure all messages are sent

time.sleep(2)  # Give messages time to propagate

# Consume messages and verify
print("Consuming messages...")
messages_received = []
for message in consumer:
    messages_received.append(message.value)
    print(f"Received: {message.value}")
    if len(messages_received) == len(messages_sent):  # Stop when all messages are received
        break

# Assertions (optional)
print("Verifying...")
if messages_sent == messages_received:
    print("Test passed!  All messages match.")
else:
    print("Test failed!  Messages do not match.")
    print("Sent: ", messages_sent)
    print("Received: ", messages_received)

consumer.close()
producer.close()