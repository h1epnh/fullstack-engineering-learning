#!/usr/bin/env python3
"""
Simple Kafka Producer Example in Python
"""

from kafka import KafkaProducer
import json
import time
from datetime import datetime

def main():
    # Create Kafka producer
    producer = KafkaProducer(
        bootstrap_servers=['localhost:9094'],
        value_serializer=lambda v: json.dumps(v).encode('utf-8'),
        key_serializer=lambda k: k.encode('utf-8') if k else None
    )
    
    print('✅ Producer connected to Kafka')
    print('📤 Sending messages to topic: my-first-topic')
    print('Press Ctrl+C to stop\\n')
    
    message_count = 0
    
    try:
        while True:
            # Create message
            message = {
                'message_id': message_count,
                'content': f'Hello Kafka! Message #{message_count}',
                'timestamp': datetime.now().isoformat()
            }
            
            # Send message
            future = producer.send(
                'my-first-topic',
                key=f'key-{message_count}',
                value=message
            )
            
            # Wait for confirmation
            record_metadata = future.get(timeout=10)
            
            print(f'📤 Sent message #{message_count}')
            print(f'   Topic: {record_metadata.topic}')
            print(f'   Partition: {record_metadata.partition}')
            print(f'   Offset: {record_metadata.offset}\\n')
            
            message_count += 1
            time.sleep(2)  # Send a message every 2 seconds
            
    except KeyboardInterrupt:
        print('\\n🛑 Shutting down producer...')
    finally:
        producer.close()
        print('✅ Producer closed')

if __name__ == '__main__':
    main()
