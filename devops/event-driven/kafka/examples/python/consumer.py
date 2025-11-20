#!/usr/bin/env python3
"""
Simple Kafka Consumer Example in Python
"""

from kafka import KafkaConsumer
import json
from datetime import datetime

def deserialize_value(m):
    """Deserialize message value - handles both JSON and plain text"""
    try:
        return json.loads(m.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        # If not valid JSON, return as plain string
        return m.decode('utf-8', errors='ignore')

def main():
    # Create Kafka consumer
    consumer = KafkaConsumer(
        'my-first-topic',
        bootstrap_servers=['localhost:9094'],
        auto_offset_reset='earliest',  # Start from beginning
        enable_auto_commit=True,
        group_id='my-python-group',
        value_deserializer=deserialize_value,
        key_deserializer=lambda k: k.decode('utf-8') if k else None
    )
    
    print('✅ Consumer connected to Kafka')
    print('📥 Subscribed to topic: my-first-topic')
    print('Waiting for messages...\\n')
    print('Press Ctrl+C to stop\\n')
    
    try:
        for message in consumer:
            print(f'📥 Received message:')
            print(f'   Topic: {message.topic}')
            print(f'   Partition: {message.partition}')
            print(f'   Offset: {message.offset}')
            print(f'   Key: {message.key}')
            print(f'   Value: {message.value}')
            print(f'   Timestamp: {datetime.fromtimestamp(message.timestamp/1000).isoformat()}')
            print()
            
    except KeyboardInterrupt:
        print('\\n🛑 Shutting down consumer...')
    finally:
        consumer.close()
        print('✅ Consumer closed')

if __name__ == '__main__':
    main()
