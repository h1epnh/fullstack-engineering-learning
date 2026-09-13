#!/usr/bin/env python3
"""
Demo: Consumer Offset Behavior
This script shows how Kafka tracks offsets per consumer group
"""

from kafka import KafkaConsumer
import json
from datetime import datetime
import sys

def deserialize_value(m):
    """Deserialize message value - handles both JSON and plain text"""
    try:
        return json.loads(m.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return m.decode('utf-8', errors='ignore')

def main():
    # Get group ID from command line or use default
    group_id = sys.argv[1] if len(sys.argv) > 1 else 'demo-group-1'
    
    print(f"🔑 Using Consumer Group: {group_id}")
    print("=" * 50)
    
    # Create Kafka consumer
    consumer = KafkaConsumer(
        'my-first-topic',
        bootstrap_servers=['localhost:9094'],
        auto_offset_reset='earliest',  # Start from beginning if no offset exists
        enable_auto_commit=True,
        group_id=group_id,
        value_deserializer=deserialize_value,
        key_deserializer=lambda k: k.decode('utf-8') if k else None
    )
    
    print(f'✅ Consumer connected to Kafka')
    print(f'📥 Subscribed to topic: my-first-topic')
    print(f'Waiting for messages...\n')
    
    message_count = 0
    
    try:
        for message in consumer:
            message_count += 1
            print(f'📥 Message #{message_count}:')
            print(f'   Partition: {message.partition}')
            print(f'   Offset: {message.offset}')
            print(f'   Key: {message.key}')
            print(f'   Value: {message.value}')
            print()
            
            # Stop after 10 messages for demo
            if message_count >= 10:
                print(f"✅ Read {message_count} messages. Stopping.")
                print(f"💾 Offset committed for group '{group_id}'")
                print(f"\nℹ️  If you run this again with the same group ID,")
                print(f"   it will continue from offset {message.offset + 1}")
                break
                
    except KeyboardInterrupt:
        print(f'\n🛑 Shutting down consumer...')
    finally:
        consumer.close()
        print('✅ Consumer closed')

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("  KAFKA OFFSET DEMO")
    print("=" * 50)
    print("\nUsage:")
    print("  python offset_demo.py              # Uses 'demo-group-1'")
    print("  python offset_demo.py my-group     # Uses 'my-group'")
    print("=" * 50 + "\n")
    main()
