#!/usr/bin/env python3
"""
Kafka Performance Testing Script
Requires: pip install kafka-python psutil
"""

import time
import json
import statistics
from datetime import datetime
from kafka import KafkaProducer, KafkaConsumer
from kafka.admin import KafkaAdminClient, NewTopic
import psutil
import threading

class KafkaPerformanceTester:
    def __init__(self, bootstrap_servers='localhost:9094', topic='perf-test'):
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self.results = {}
        
    def print_header(self, text):
        print(f"\n{'='*50}")
        print(f"  {text}")
        print(f"{'='*50}\n")
    
    def create_topic(self, num_partitions=3, replication_factor=1):
        """Create test topic"""
        self.print_header("Creating Topic")
        try:
            admin_client = KafkaAdminClient(
                bootstrap_servers=self.bootstrap_servers,
                client_id='perf-test-admin'
            )
            
            topic_list = [NewTopic(
                name=self.topic,
                num_partitions=num_partitions,
                replication_factor=replication_factor
            )]
            
            admin_client.create_topics(new_topics=topic_list, validate_only=False)
            print(f"✓ Topic '{self.topic}' created successfully")
            print(f"  Partitions: {num_partitions}")
            print(f"  Replication Factor: {replication_factor}")
            
        except Exception as e:
            if "TopicExistsException" in str(e):
                print(f"✓ Topic '{self.topic}' already exists")
            else:
                print(f"✗ Error creating topic: {e}")
    
    def test_producer_throughput(self, num_messages=100000, message_size=1024):
        """Test producer throughput"""
        self.print_header("Producer Throughput Test")
        
        print(f"Messages: {num_messages:,}")
        print(f"Message Size: {message_size:,} bytes")
        print(f"Total Data: {(num_messages * message_size) / (1024*1024):.2f} MB\n")
        
        producer = KafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            compression_type='snappy',
            linger_ms=10,
            batch_size=32768
        )
        
        message = {'data': 'x' * (message_size - 50)}  # Adjust for JSON overhead
        
        start_time = time.time()
        start_cpu = psutil.cpu_percent()
        start_mem = psutil.virtual_memory().percent
        
        for i in range(num_messages):
            producer.send(self.topic, value=message)
            if (i + 1) % 10000 == 0:
                print(f"Sent {i+1:,} messages...", end='\r')
        
        producer.flush()
        end_time = time.time()
        
        duration = end_time - start_time
        throughput = num_messages / duration
        data_throughput = (num_messages * message_size) / duration / (1024*1024)
        
        end_cpu = psutil.cpu_percent()
        end_mem = psutil.virtual_memory().percent
        
        print(f"\n\n{'='*50}")
        print(f"PRODUCER RESULTS:")
        print(f"{'='*50}")
        print(f"Duration: {duration:.2f} seconds")
        print(f"Messages Sent: {num_messages:,}")
        print(f"Throughput: {throughput:,.2f} messages/sec")
        print(f"Data Throughput: {data_throughput:.2f} MB/sec")
        print(f"Avg Latency: {(duration/num_messages)*1000:.3f} ms")
        print(f"CPU Usage: {end_cpu:.1f}%")
        print(f"Memory Usage: {end_mem:.1f}%")
        print(f"{'='*50}\n")
        
        self.results['producer'] = {
            'duration': duration,
            'messages': num_messages,
            'throughput': throughput,
            'data_throughput_mb': data_throughput,
            'avg_latency_ms': (duration/num_messages)*1000
        }
        
        producer.close()
    
    def test_consumer_throughput(self, num_messages=100000):
        """Test consumer throughput"""
        self.print_header("Consumer Throughput Test")
        
        consumer = KafkaConsumer(
            self.topic,
            bootstrap_servers=self.bootstrap_servers,
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id='perf-test-group',
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            fetch_min_bytes=1024,
            fetch_max_wait_ms=500
        )
        
        print(f"Consuming {num_messages:,} messages...\n")
        
        start_time = time.time()
        consumed = 0
        
        for message in consumer:
            consumed += 1
            if consumed % 10000 == 0:
                print(f"Consumed {consumed:,} messages...", end='\r')
            if consumed >= num_messages:
                break
        
        end_time = time.time()
        duration = end_time - start_time
        throughput = consumed / duration
        
        print(f"\n\n{'='*50}")
        print(f"CONSUMER RESULTS:")
        print(f"{'='*50}")
        print(f"Duration: {duration:.2f} seconds")
        print(f"Messages Consumed: {consumed:,}")
        print(f"Throughput: {throughput:,.2f} messages/sec")
        print(f"Avg Latency: {(duration/consumed)*1000:.3f} ms")
        print(f"{'='*50}\n")
        
        self.results['consumer'] = {
            'duration': duration,
            'messages': consumed,
            'throughput': throughput,
            'avg_latency_ms': (duration/consumed)*1000
        }
        
        consumer.close()
    
    def test_latency(self, num_messages=10000, message_size=1024):
        """Test end-to-end latency"""
        self.print_header("End-to-End Latency Test")
        
        latencies = []
        
        producer = KafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        
        consumer = KafkaConsumer(
            self.topic,
            bootstrap_servers=self.bootstrap_servers,
            auto_offset_reset='latest',
            group_id='latency-test-group',
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        
        print(f"Testing latency with {num_messages:,} messages...\n")
        
        for i in range(num_messages):
            send_time = time.time()
            message = {'timestamp': send_time, 'id': i}
            
            producer.send(self.topic, value=message)
            producer.flush()
            
            for msg in consumer:
                receive_time = time.time()
                latency = (receive_time - msg.value['timestamp']) * 1000  # ms
                latencies.append(latency)
                break
            
            if (i + 1) % 1000 == 0:
                print(f"Tested {i+1:,} messages...", end='\r')
        
        avg_latency = statistics.mean(latencies)
        median_latency = statistics.median(latencies)
        p95_latency = sorted(latencies)[int(len(latencies) * 0.95)]
        p99_latency = sorted(latencies)[int(len(latencies) * 0.99)]
        
        print(f"\n\n{'='*50}")
        print(f"LATENCY RESULTS:")
        print(f"{'='*50}")
        print(f"Messages Tested: {num_messages:,}")
        print(f"Average Latency: {avg_latency:.3f} ms")
        print(f"Median Latency: {median_latency:.3f} ms")
        print(f"95th Percentile: {p95_latency:.3f} ms")
        print(f"99th Percentile: {p99_latency:.3f} ms")
        print(f"Min Latency: {min(latencies):.3f} ms")
        print(f"Max Latency: {max(latencies):.3f} ms")
        print(f"{'='*50}\n")
        
        self.results['latency'] = {
            'avg_ms': avg_latency,
            'median_ms': median_latency,
            'p95_ms': p95_latency,
            'p99_ms': p99_latency,
            'min_ms': min(latencies),
            'max_ms': max(latencies)
        }
        
        producer.close()
        consumer.close()
    
    def save_results(self, filename='kafka_perf_results.json'):
        """Save results to JSON file"""
        results_with_metadata = {
            'timestamp': datetime.now().isoformat(),
            'bootstrap_servers': self.bootstrap_servers,
            'topic': self.topic,
            'system_info': {
                'cpu_count': psutil.cpu_count(),
                'memory_total_gb': psutil.virtual_memory().total / (1024**3),
            },
            'results': self.results
        }
        
        with open(filename, 'w') as f:
            json.dump(results_with_metadata, f, indent=2)
        
        print(f"✓ Results saved to {filename}")
    
    def run_all_tests(self):
        """Run all performance tests"""
        print("\n" + "="*50)
        print("  KAFKA PERFORMANCE TEST SUITE")
        print("="*50)
        
        self.create_topic()
        time.sleep(2)
        
        self.test_producer_throughput(num_messages=100000, message_size=1024)
        time.sleep(2)
        
        self.test_consumer_throughput(num_messages=100000)
        time.sleep(2)
        
        self.test_latency(num_messages=1000)
        
        self.save_results()
        
        print("\n✓ All tests completed!")

if __name__ == "__main__":
    tester = KafkaPerformanceTester()
    tester.run_all_tests()