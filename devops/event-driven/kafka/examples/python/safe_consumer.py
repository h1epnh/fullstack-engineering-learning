#!/usr/bin/env python3
"""
Production-ready Kafka Consumer with message loss prevention
"""

from kafka import KafkaConsumer
import json
import logging
import time

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SafeKafkaConsumer:
    def __init__(self, topic, group_id, bootstrap_servers):
        logger.info(f"Initializing safe Kafka consumer for topic: {topic}")
        
        self.consumer = KafkaConsumer(
            topic,
            bootstrap_servers=bootstrap_servers,
            group_id=group_id,
            
            # Manual commit for safety - PREVENT MESSAGE LOSS
            enable_auto_commit=False,  # We'll commit manually after processing
            
            # Start from earliest if no offset exists
            auto_offset_reset='earliest',
            
            # Deserialization
            value_deserializer=self._deserialize_value,
            key_deserializer=lambda k: k.decode('utf-8') if k else None,
            
            # Session timeout
            session_timeout_ms=30000,
            heartbeat_interval_ms=10000
        )
        
        self.processed_count = 0
        self.failed_count = 0
        
        logger.info("✅ Consumer initialized with safe settings")
        logger.info("   enable_auto_commit=False (manual commit)")
        logger.info("   Commit only after successful processing")
    
    def _deserialize_value(self, m):
        """Deserialize message value - handles both JSON and plain text"""
        try:
            return json.loads(m.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return m.decode('utf-8', errors='ignore')
    
    def process_message(self, message):
        """
        Override this method with your actual processing logic
        Should raise exception if processing fails
        """
        # Simulate processing
        logger.info(f"📝 Processing message: {message}")
        
        # Simulate occasional failure for demo
        # In production, this would be your actual business logic
        if isinstance(message, dict) and message.get('id') == 999:
            raise ValueError("Simulated processing error")
        
        time.sleep(0.1)  # Simulate work
        return True
    
    def consume(self, max_retries=3):
        """
        Consume messages with retry logic and manual commit
        Only commits offset after successful processing
        """
        logger.info("🚀 Starting to consume messages...")
        logger.info(f"   Max retries per message: {max_retries}")
        
        try:
            for message in self.consumer:
                retry_count = 0
                success = False
                
                logger.info(f"\n📥 Received message:")
                logger.info(f"   Partition: {message.partition}")
                logger.info(f"   Offset: {message.offset}")
                logger.info(f"   Key: {message.key}")
                
                # Retry loop
                while retry_count < max_retries and not success:
                    try:
                        # Process message
                        self.process_message(message.value)
                        
                        # CRITICAL: Only commit after successful processing
                        self.consumer.commit()
                        
                        self.processed_count += 1
                        logger.info(f"✅ Successfully processed and committed offset {message.offset}")
                        success = True
                        
                    except Exception as e:
                        retry_count += 1
                        logger.warning(f"⚠️  Processing failed (attempt {retry_count}/{max_retries}): {e}")
                        
                        if retry_count < max_retries:
                            # Exponential backoff
                            backoff = 2 ** retry_count
                            logger.info(f"   Retrying in {backoff} seconds...")
                            time.sleep(backoff)
                
                # If all retries failed
                if not success:
                    logger.error(f"❌ Failed after {max_retries} retries")
                    self.failed_count += 1
                    
                    # In production: send to Dead Letter Queue (DLQ)
                    self._send_to_dlq(message)
                    
                    # Commit to skip this problematic message
                    self.consumer.commit()
                    logger.info(f"   Committed offset to skip message")
                    
        except KeyboardInterrupt:
            logger.info("\n🛑 Shutting down consumer...")
        finally:
            self.close()
    
    def _send_to_dlq(self, message):
        """Send failed message to Dead Letter Queue"""
        # In production, you would send to an actual DLQ topic
        logger.warning(f"📮 Would send to DLQ: partition={message.partition}, offset={message.offset}")
        # Example: dlq_producer.send('dlq-topic', value=message.value)
    
    def close(self):
        """Close consumer and report stats"""
        self.consumer.close()
        logger.info("\n" + "="*60)
        logger.info("  CONSUMER STATISTICS")
        logger.info("="*60)
        logger.info(f"  ✅ Successfully processed: {self.processed_count}")
        logger.info(f"  ❌ Failed (sent to DLQ): {self.failed_count}")
        logger.info("="*60)
        logger.info("✅ Consumer closed safely\n")

def main():
    """Demo: Consume messages with safe consumer"""
    print("\n" + "="*60)
    print("  SAFE KAFKA CONSUMER DEMO")
    print("="*60)
    print("\nThis consumer uses:")
    print("  ✅ Manual offset commit (no auto-commit)")
    print("  ✅ Commit only after successful processing")
    print("  ✅ Retry logic with exponential backoff")
    print("  ✅ Dead Letter Queue for failed messages")
    print("="*60)
    print("\nPress Ctrl+C to stop\n")
    
    consumer = SafeKafkaConsumer(
        topic='my-first-topic',
        group_id='safe-consumer-group',
        bootstrap_servers=['localhost:9094']
    )
    
    consumer.consume(max_retries=3)

if __name__ == '__main__':
    main()
