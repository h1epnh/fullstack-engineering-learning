# How to Handle Kafka Message Loss - Quick Reference

## 🎯 TL;DR - The 3 Golden Rules

1. **Producer**: Use `acks='all'` and `enable_idempotence=True`
2. **Broker**: Use replication factor ≥ 2
3. **Consumer**: Disable auto-commit, commit only after processing

---

## 🚀 Quick Start - Run Safe Examples

### Safe Producer (No Message Loss)
```bash
cd examples/python
python safe_producer.py
```

### Safe Consumer (No Message Loss)
```bash
cd examples/python
python safe_consumer.py
```

---

## 📊 Message Loss Scenarios & Solutions

### Scenario 1: Producer Crashes Before Send
**Problem:** Message lost in memory before reaching Kafka

**Solution:**
```python
producer = KafkaProducer(
    acks='all',  # Wait for confirmation
    retries=5    # Retry on failure
)
```

### Scenario 2: Broker Crashes Before Replication
**Problem:** Message on leader broker, not yet replicated

**Solution:**
```bash
# Create topic with replication
--replication-factor 3
--config min.insync.replicas=2
```

### Scenario 3: Consumer Crashes After Reading
**Problem:** Message read but not processed, offset already committed

**Solution:**
```python
consumer = KafkaConsumer(
    enable_auto_commit=False  # Manual commit
)

for message in consumer:
    process(message)
    consumer.commit()  # Commit AFTER processing
```

---

## ⚙️ Configuration Comparison

### Basic Producer (Can Lose Messages)
```python
producer = KafkaProducer(
    bootstrap_servers=['localhost:9094']
    # acks=1 (default) - only leader confirms
    # retries=0 (default) - no retries
)
```

### Safe Producer (No Loss)
```python
producer = KafkaProducer(
    bootstrap_servers=['localhost:9094'],
    acks='all',              # ✅ All replicas confirm
    retries=5,               # ✅ Retry on failure
    enable_idempotence=True  # ✅ No duplicates
)
```

### Basic Consumer (Can Lose Messages)
```python
consumer = KafkaConsumer(
    'my-topic',
    enable_auto_commit=True  # ❌ Commits before processing
)
```

### Safe Consumer (No Loss)
```python
consumer = KafkaConsumer(
    'my-topic',
    enable_auto_commit=False  # ✅ Manual commit
)

for msg in consumer:
    process(msg)
    consumer.commit()  # ✅ Commit after processing
```

---

## 🧪 Test Message Loss Prevention

### Test 1: Producer Retry
```bash
# Terminal 1: Start safe producer
python safe_producer.py

# Terminal 2: Kill Kafka during send
docker kill kafka

# Result: Producer retries until Kafka is back
docker start kafka
```

### Test 2: Consumer Crash Recovery
```bash
# Terminal 1: Start safe consumer
python safe_consumer.py

# Terminal 2: Kill consumer mid-processing
kill <pid>

# Terminal 1: Restart consumer
python safe_consumer.py

# Result: Re-processes uncommitted messages
```

---

## 📈 Delivery Guarantees

| Mode | Producer Config | Consumer Config | Use Case |
|------|----------------|-----------------|----------|
| **At-most-once** | `acks=0` | Auto-commit | Metrics, logs (loss OK) |
| **At-least-once** | `acks=all` | Manual commit | Most applications |
| **Exactly-once** | Idempotence + Transactions | Transactional read | Financial systems |

---

## ✅ Production Checklist

### Before Going to Production

**Producer:**
- [ ] Set `acks='all'`
- [ ] Enable idempotence
- [ ] Configure retries (3-5)
- [ ] Add error callbacks
- [ ] Test failure scenarios

**Broker:**
- [ ] Replication factor ≥ 2
- [ ] `min.insync.replicas` ≥ 2
- [ ] Monitor disk space
- [ ] Set up alerts
- [ ] Test failover

**Consumer:**
- [ ] Disable auto-commit
- [ ] Commit after processing
- [ ] Implement retry logic
- [ ] Add Dead Letter Queue
- [ ] Make processing idempotent

---

## 📚 Learn More

- Full guide: `MESSAGE_LOSS_PREVENTION.md`
- Offset management: `OFFSET_GUIDE.md`
- Code examples: `safe_producer.py`, `safe_consumer.py`

---

## 🆘 Common Issues

### "Message sent but consumer doesn't see it"
- Check consumer group offset
- Verify topic name matches
- Check `auto_offset_reset` setting

### "Consumer processes same message twice"
- Ensure commit happens after processing
- Check for consumer crashes before commit
- Implement idempotent processing

### "Producer timeout errors"
- Increase `request_timeout_ms`
- Check broker health
- Verify network connectivity
