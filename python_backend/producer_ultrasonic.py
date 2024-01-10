from confluent_kafka.admin import AdminClient, NewTopic
from confluent_kafka import Producer
import random
import time

def delivery_report(err, msg):
    if err is not None:
        print('Message delivery failed: {}'.format(err))
    else:
        print('Message delivered to {} [{}]'.format(msg.topic(), msg.value()))

def start_producer():
    # Set your Kafka broker address
    broker_address = 'localhost:9092'

    # Set your Kafka topic
    topic = 'carnumber'

    # AdminClient instance; AdminClient will delete the topic if it already existst so we always start fresh
    admin_client = AdminClient({'bootstrap.servers': broker_address})

    # Create Producer instance
    producer = Producer({'bootstrap.servers': broker_address})

    
    # Define topic configurations
    new_topic = NewTopic(topic, num_partitions=1, replication_factor=1)

    # Delete the topic if it exists
    admin_client.delete_topics([topic])
    admin_client.create_topics([new_topic])

    for i in range(5):
        # every two seconds we send the number of cars between the two ultrasonic sensors
        time.sleep(2)
        message_value = str(random.randint(0,4))
        producer.produce(topic, key='some_key', value=message_value, callback=delivery_report)

    # Wait for any outstanding messages to be delivered and delivery reports received
    producer.flush()

if __name__ == '__main__':
    start_producer()