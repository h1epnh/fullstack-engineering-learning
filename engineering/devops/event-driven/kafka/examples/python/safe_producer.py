#!/usr/bin/env python3
"""
Production-ready Kafka Producer with message loss prevention
"""

from kafka import KafkaProducer
from kafka.errors import KafkaError
import json
import logging
import time

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SafeKafkaProducer:
    def __init__(self, bootstrap_servers):
        logger.info("Initializing safe Kafka producer...")
        
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            
            # Durability settings - PREVENT MESSAGE LOSS
            acks='all',  # Wait for all in-sync replicas to acknowledge
            retries=5,   # Retry up to 5 times on failure
            retry_backoff_ms=100,  # Wait 100ms between retries
            
            # Idempotence - PREVENT DUPLICATES
            enable_idempotence=True,  # Exactly-once semantics
            max_in_flight_requests_per_connection=5,
            
            # Serialization
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
            
            # Timeouts
            request_timeout_ms=30000,  # 30 seconds
            
            # Compression (optional, improves throughput)
            compression_type='snappy'
        )
        
        logger.info("✅ Producer initialized with safe settings")
        logger.info("   acks=all (wait for all replicas)")
        logger.info("   retries=5 (retry on failure)")
        logger.info("   idempotence=True (prevent duplicates)")
    
    def send_message(self, topic, key, value):
        """
        Send message with error handling and confirmation
        Returns: True if successful, False otherwise
        """
        try:
            # Send asynchronously
            future = self.producer.send(topic, key=key, value=value)
            
            # Wait for result (makes it synchronous for safety)
            record_metadata = future.get(timeout=10)
            
            logger.info(f"✅ Message sent successfully")
            logger.info(f"   Topic: {record_metadata.topic}")
            logger.info(f"   Partition: {record_metadata.partition}")
            logger.info(f"   Offset: {record_metadata.offset}")
            
            return True
            
        except KafkaError as e:
            logger.error(f"❌ Failed to send message: {e}")
            # In production: send to DLQ, alert monitoring system, etc.
            return False
        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
            return False
    
    def send_batch(self, topic, messages):
        """Send multiple messages and track success rate"""
        success_count = 0
        failed_count = 0
        
        for key, value in messages:
            if self.send_message(topic, key, value):
                success_count += 1
            else:
                failed_count += 1
        
        logger.info(f"📊 Batch complete: {success_count} success, {failed_count} failed")
        return success_count, failed_count
    
    def close(self):
        """Flush and close producer safely"""
        logger.info("Flushing remaining messages...")
        self.producer.flush()  # Ensure all buffered messages are sent
        self.producer.close()
        logger.info("✅ Producer closed safely")

def main():
    """Demo: Send messages with safe producer"""
    producer = SafeKafkaProducer(['localhost:9094'])
    
    print("\n" + "="*60)
    print("  SAFE KAFKA PRODUCER DEMO")
    print("="*60)
    print("\nThis producer uses:")
    print("  ✅ acks='all' - Wait for all replicas")
    print("  ✅ retries=5 - Retry on failure")
    print("  ✅ idempotence=True - Prevent duplicates")
    print("="*60 + "\n")
    
    # Send individual messages
    for i in range(5):
        message = {
            'id': i,
            'data': f'Important message {i}',
            'timestamp': time.time()
        }
        
        success = producer.send_message(
            topic='my-first-topic',
            key=f'key-{i}',
            value=message
        )
        
        if not success:
            logger.error(f"Failed to send message {i}")
            # In production: implement retry logic, send to DLQ, etc.
        
        time.sleep(1)  # Slow down for demo
    
    producer.close()
    print("\n✅ Demo complete!\n")

if __name__ == '__main__':
    main()
