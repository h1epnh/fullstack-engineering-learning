# Kafka Getting Started Guide

This guide will help you start your Kafka learning journey using the existing setup.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 14+ (for Node.js examples)
- Python 3.8+ (for Python examples)
- Java 11+ (for Java examples)

## Quick Start

### 1. Start Kafka Cluster

```bash
cd /Users/mac/Engineering/GitHub/fullstack-engineering-learning/devops/event-driven/kafka
./run-docker.sh up
```

This will start:
- **Zookeeper** on port 2181
- **Kafka** on ports 9092 (internal) and 9094 (external)
- **Kafka UI** on port 8080 (http://localhost:8080)

### 2. Verify Setup

Open Kafka UI in your browser:
```
http://localhost:8080
```

You should see your Kafka cluster with topics, brokers, and consumer groups.

### 3. Run Your First Example

Choose your preferred language and navigate to the examples directory:

#### Node.js Example
```bash
cd examples/nodejs
npm install
npm run producer  # In one terminal
npm run consumer  # In another terminal
```

#### Python Example
```bash
cd examples/python
pip install -r requirements.txt
python producer.py  # In one terminal
python consumer.py  # In another terminal
```

#### Java Example
```bash
cd examples/java
mvn clean install
mvn exec:java -Dexec.mainClass="com.example.kafka.Producer"  # Terminal 1
mvn exec:java -Dexec.mainClass="com.example.kafka.Consumer"  # Terminal 2
```

## Learning Path

### Phase 1: Fundamentals (Start Here!)

1. **Understand Topics and Partitions**
   - Create a topic via Kafka UI
   - Observe partition distribution
   - Send messages and see them in different partitions

2. **Producer Basics**
   - Run the simple producer example
   - Modify message content
   - Observe in Kafka UI

3. **Consumer Basics**
   - Run the simple consumer example
   - See consumer group in Kafka UI
   - Understand offset management

### Phase 2: Hands-on Exercises

1. **Exercise 1: Message Ordering**
   - Send messages with keys
   - Observe how messages with same key go to same partition
   - Understand ordering guarantees

2. **Exercise 2: Consumer Groups**
   - Start multiple consumers in same group
   - Observe partition assignment
   - See load balancing in action

3. **Exercise 3: Serialization**
   - Implement JSON serialization
   - Try Avro (with Schema Registry)
   - Compare performance

## Performance Testing

Run the included performance tests:

```bash
# Python performance test
python kafka_performance_test.py

# Bash performance test
./kafka-perf-test.sh
```

## Useful Commands

### Topic Management
```bash
# List topics
docker exec kafka kafka-topics --list --bootstrap-server kafka:9092

# Describe topic
docker exec kafka kafka-topics --describe --topic my-topic --bootstrap-server kafka:9092

# Create topic
docker exec kafka kafka-topics --create --topic my-topic --partitions 3 --replication-factor 1 --bootstrap-server kafka:9092

# Delete topic
docker exec kafka kafka-topics --delete --topic my-topic --bootstrap-server kafka:9092
```

### Consumer Groups
```bash
# List consumer groups
docker exec kafka kafka-consumer-groups --list --bootstrap-server kafka:9092

# Describe consumer group
docker exec kafka kafka-consumer-groups --describe --group my-group --bootstrap-server kafka:9092

# Reset offsets
docker exec kafka kafka-consumer-groups --group my-group --reset-offsets --to-earliest --topic my-topic --execute --bootstrap-server kafka:9092
```

### Produce/Consume from CLI
```bash
# Console producer
docker exec -it kafka kafka-console-producer --topic my-topic --bootstrap-server kafka:9092

# Console consumer
docker exec -it kafka kafka-console-consumer --topic my-topic --from-beginning --bootstrap-server kafka:9092
```

## Troubleshooting

### Kafka not starting?
```bash
# Check logs
docker logs kafka

# Restart services
./run-docker.sh restart
```

### Can't connect from host?
- Use `localhost:9094` for connections from your host machine
- Use `kafka:9092` for connections from within Docker network

### Consumer lag?
- Check Kafka UI → Consumer Groups
- Look for lag metrics
- Adjust consumer configuration

## Next Steps

1. Complete the examples in `examples/` directory
2. Read the comprehensive learning plan in `implementation_plan.md`
3. Start Phase 1 projects
4. Join Kafka community forums for questions

## Resources

- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Confluent Developer](https://developer.confluent.io/)
- [Kafka Tutorials](https://kafka-tutorials.confluent.io/)

Happy Learning! 🚀
