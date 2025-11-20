# Kafka Examples

This directory contains simple producer and consumer examples in multiple languages.

## Available Examples

### Node.js
- `nodejs/producer.js` - Simple producer
- `nodejs/consumer.js` - Simple consumer

### Python
- `python/producer.py` - Simple producer
- `python/consumer.py` - Simple consumer

### Java
- `java/src/main/java/com/example/kafka/SimpleProducer.java` - Simple producer
- `java/src/main/java/com/example/kafka/SimpleConsumer.java` - Simple consumer

## Quick Start

### Prerequisites
Make sure Kafka is running:
```bash
cd ..
./run-docker.sh up
```

### Node.js Example
```bash
cd nodejs
npm install
npm run producer  # Terminal 1
npm run consumer  # Terminal 2
```

### Python Example
```bash
cd python
pip install -r requirements.txt
python producer.py  # Terminal 1
python consumer.py  # Terminal 2
```

### Java Example
```bash
cd java
mvn clean install
mvn exec:java -Dexec.mainClass="com.example.kafka.SimpleProducer"  # Terminal 1
mvn exec:java -Dexec.mainClass="com.example.kafka.SimpleConsumer"  # Terminal 2
```

## What These Examples Demonstrate

1. **Connection to Kafka** - How to connect to Kafka from different languages
2. **Producer Basics** - Sending messages with keys and values
3. **Consumer Basics** - Consuming messages from a topic
4. **Consumer Groups** - Multiple consumers in the same group
5. **Offset Management** - How Kafka tracks message consumption

## Next Steps

After running these examples:
1. Open Kafka UI (http://localhost:8080) to see topics and consumer groups
2. Try modifying the code to send different message formats
3. Experiment with multiple consumers in the same group
4. Move on to more advanced examples in the learning plan

## Troubleshooting

**Connection refused?**
- Make sure Kafka is running: `docker ps | grep kafka`
- Use `localhost:9094` for external connections
- Use `kafka:9092` for connections from within Docker

**Topic not found?**
- Topics are auto-created by default
- Or create manually: `docker exec kafka kafka-topics --create --topic my-first-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1`
