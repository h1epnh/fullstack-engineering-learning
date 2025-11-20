# Kafka Message Loss Prevention Guide

## 🚨 When Can Kafka Lose Messages?

### 1. **Producer Side Loss**
- Producer crashes before message is sent
- Network failure during transmission
- Producer doesn't wait for acknowledgment

### 2. **Broker Side Loss**
- Broker crashes before replicating data
- Disk failure without replication
- Leader election during write

### 3. **Consumer Side Loss**
- Consumer commits offset before processing
- Consumer crashes after reading but before processing
- Processing fails but offset is already committed

---

## ✅ How to Prevent Message Loss

### 1. Producer-Side Guarantees

#### A. Use `acks=all` (Most Important!)

```python
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=['localhost:9094'],
    acks='all',  # Wait for all replicas to acknowledge
    retries=3,   # Retry on failure
    max_in_flight_requests_per_connection=1,  # Maintain order
    enable_idempotence=True  # Prevent duplicates during retries
)
```

**`acks` Options:**
- `acks=0`: Fire and forget (FAST, but can lose messages)
- `acks=1`: Wait for leader only (MEDIUM safety)
- `acks='all'`: Wait for all replicas (SAFEST, slower)

#### B. Enable Idempotence

```python
enable_idempotence=True  # Prevents duplicate messages on retry
```

#### C. Handle Send Failures

```python
def send_with_callback(producer, topic, message):
    def on_send_success(record_metadata):
        print(f"✅ Message sent to {record_metadata.topic}:{record_metadata.partition}:{record_metadata.offset}")
    
    def on_send_error(excp):
        print(f"❌ Message failed: {excp}")
        # Log to dead letter queue or retry logic here
    
    producer.send(topic, value=message).add_callback(on_send_success).add_errback(on_send_error)
```

---

### 2. Broker-Side Guarantees

#### A. Use Replication

```bash
# Create topic with replication factor > 1
docker exec kafka kafka-topics --create \
  --topic critical-topic \
  --partitions 3 \
  --replication-factor 3 \  # At least 2 or 3
  --bootstrap-server kafka:9092
```

#### B. Configure Min In-Sync Replicas

```bash
# Require at least 2 replicas to acknowledge writes
docker exec kafka kafka-configs --alter \
  --entity-type topics \
  --entity-name critical-topic \
  --add-config min.insync.replicas=2 \
  --bootstrap-server kafka:9092
```

#### C. Disable Unclean Leader Election

```bash
# Prevent out-of-sync replicas from becoming leaders
docker exec kafka kafka-configs --alter \
  --entity-type brokers \
  --entity-default \
  --add-config unclean.leader.election.enable=false \
  --bootstrap-server kafka:9092
```

---

### 3. Consumer-Side Guarantees

#### A. Manual Offset Commit (Recommended for Critical Data)

```python
from kafka import KafkaConsumer

consumer = KafkaConsumer(
    'my-topic',
    bootstrap_servers=['localhost:9094'],
    enable_auto_commit=False,  # Disable auto-commit
    group_id='my-group'
)

for message in consumer:
    try:
        # Process message
        process_message(message.value)
        
        # Only commit after successful processing
        consumer.commit()
        print(f"✅ Processed and committed offset {message.offset}")
        
    except Exception as e:
        print(f"❌ Processing failed: {e}")
        # Don't commit - message will be re-read on restart
        break
```

#### B. At-Least-Once Delivery Pattern

```python
def consume_with_retry(consumer, max_retries=3):
    for message in consumer:
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                # Process message
                result = process_message(message.value)
                
                # Commit only after success
                consumer.commit()
                print(f"✅ Success on attempt {retry_count + 1}")
                break
                
            except Exception as e:
                retry_count += 1
                print(f"⚠️  Attempt {retry_count} failed: {e}")
                
                if retry_count >= max_retries:
                    # Send to dead letter queue
                    send_to_dlq(message)
                    consumer.commit()  # Commit to skip this message
                    print(f"❌ Sent to DLQ after {max_retries} attempts")
```

#### C. Idempotent Processing

```python
# Use unique message IDs to prevent duplicate processing
processed_ids = set()

for message in consumer:
    message_id = message.value.get('id')
    
    if message_id in processed_ids:
        print(f"⏭️  Skipping duplicate message {message_id}")
        consumer.commit()
        continue
    
    # Process message
    process_message(message.value)
    
    # Track processed IDs
    processed_ids.add(message_id)
    consumer.commit()
```

---

## 🔧 Complete Example: Production-Ready Producer

```python
#!/usr/bin/env python3
"""
Production-ready Kafka Producer with message loss prevention
"""

from kafka import KafkaProducer
from kafka.errors import KafkaError
import json
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SafeKafkaProducer:
    def __init__(self, bootstrap_servers):
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            
            # Durability settings
            acks='all',  # Wait for all replicas
            retries=5,   # Retry up to 5 times
            retry_backoff_ms=100,
            
            # Idempotence
            enable_idempotence=True,
            max_in_flight_requests_per_connection=5,
            
            # Serialization
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
            
            # Timeouts
            request_timeout_ms=30000,
            
            # Compression
            compression_type='snappy'
        )
    
    def send_message(self, topic, key, value):
        """Send message with error handling"""
        try:
            # Send asynchronously
            future = self.producer.send(topic, key=key, value=value)
            
            # Wait for result (synchronous for safety)
            record_metadata = future.get(timeout=10)
            
            logger.info(f"✅ Message sent successfully")
            logger.info(f"   Topic: {record_metadata.topic}")
            logger.info(f"   Partition: {record_metadata.partition}")
            logger.info(f"   Offset: {record_metadata.offset}")
            
            return True
            
        except KafkaError as e:
            logger.error(f"❌ Failed to send message: {e}")
            # Implement your retry logic or DLQ here
            return False
    
    def close(self):
        """Flush and close producer"""
        self.producer.flush()  # Ensure all messages are sent
        self.producer.close()
        logger.info("Producer closed")

# Usage
if __name__ == '__main__':
    producer = SafeKafkaProducer(['localhost:9094'])
    
    for i in range(10):
        message = {
            'id': i,
            'data': f'Important message {i}',
            'timestamp': time.time()
        }
        
        success = producer.send_message(
            topic='critical-topic',
            key=f'key-{i}',
            value=message
        )
        
        if not success:
            logger.error(f"Failed to send message {i}")
            # Handle failure (retry, alert, etc.)
    
    producer.close()
```

---

## 🔧 Complete Example: Production-Ready Consumer

```python
#!/usr/bin/env python3
"""
Production-ready Kafka Consumer with message loss prevention
"""

from kafka import KafkaConsumer
import json
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SafeKafkaConsumer:
    def __init__(self, topic, group_id, bootstrap_servers):
        self.consumer = KafkaConsumer(
            topic,
            bootstrap_servers=bootstrap_servers,
            group_id=group_id,
            
            # Manual commit for safety
            enable_auto_commit=False,
            
            # Start from earliest if no offset
            auto_offset_reset='earliest',
            
            # Deserialization
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            key_deserializer=lambda k: k.decode('utf-8') if k else None,
            
            # Session timeout
            session_timeout_ms=30000,
            heartbeat_interval_ms=10000
        )
        
        self.processed_count = 0
        self.failed_count = 0
    
    def process_message(self, message):
        """Override this method with your processing logic"""
        # Simulate processing
        logger.info(f"Processing: {message}")
        time.sleep(0.1)
        return True
    
    def consume(self, max_retries=3):
        """Consume messages with retry logic"""
        try:
            for message in self.consumer:
                retry_count = 0
                success = False
                
                while retry_count < max_retries and not success:
                    try:
                        # Process message
                        self.process_message(message.value)
                        
                        # Commit only after successful processing
                        self.consumer.commit()
                        
                        self.processed_count += 1
                        logger.info(f"✅ Processed message at offset {message.offset}")
                        success = True
                        
                    except Exception as e:
                        retry_count += 1
                        logger.warning(f"⚠️  Retry {retry_count}/{max_retries}: {e}")
                        time.sleep(1)  # Backoff
                
                if not success:
                    # Send to DLQ or log
                    logger.error(f"❌ Failed after {max_retries} retries")
                    self.failed_count += 1
                    # Commit to skip this message
                    self.consumer.commit()
                    
        except KeyboardInterrupt:
            logger.info("Shutting down...")
        finally:
            self.close()
    
    def close(self):
        """Close consumer"""
        self.consumer.close()
        logger.info(f"Consumer closed. Processed: {self.processed_count}, Failed: {self.failed_count}")

# Usage
if __name__ == '__main__':
    consumer = SafeKafkaConsumer(
        topic='critical-topic',
        group_id='safe-consumer-group',
        bootstrap_servers=['localhost:9094']
    )
    
    consumer.consume()
```

---

## 📊 Delivery Guarantees Summary

| Guarantee | Configuration | Trade-off |
|-----------|--------------|-----------|
| **At-most-once** | `acks=0`, auto-commit | Fast, may lose messages |
| **At-least-once** | `acks=all`, manual commit | Safe, may duplicate |
| **Exactly-once** | Idempotence + Transactions | Safest, most complex |

---

## 🎯 Best Practices Checklist

### Producer
- [ ] Set `acks='all'`
- [ ] Enable `idempotence=True`
- [ ] Configure retries (3-5)
- [ ] Handle send failures
- [ ] Use callbacks for async sends

### Broker
- [ ] Replication factor ≥ 2
- [ ] `min.insync.replicas` ≥ 2
- [ ] Disable unclean leader election
- [ ] Monitor disk space
- [ ] Regular backups

### Consumer
- [ ] Disable auto-commit for critical data
- [ ] Commit only after processing
- [ ] Implement retry logic
- [ ] Use dead letter queue for failures
- [ ] Make processing idempotent

---

## 🧪 Testing Message Loss Prevention

```bash
# Test 1: Kill broker during write
docker kill kafka
# Producer should retry and succeed when broker restarts

# Test 2: Consumer crash before commit
# Kill consumer after reading but before processing
# Message should be re-read on restart

# Test 3: Network partition
# Simulate network issues
# Messages should be retried and delivered
```

---

## 📚 Further Reading

- [Kafka Delivery Semantics](https://kafka.apache.org/documentation/#semantics)
- [Producer Configurations](https://kafka.apache.org/documentation/#producerconfigs)
- [Consumer Configurations](https://kafka.apache.org/documentation/#consumerconfigs)
