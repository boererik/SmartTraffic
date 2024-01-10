from confluent_kafka import Consumer, KafkaException
import sys

def start_consumer():
    conf = {
        'bootstrap.servers': 'localhost:9092',
        'group.id': 'mygroup',
        'auto.offset.reset': 'earliest'
    }

    consumer = Consumer(conf)
    consumer.subscribe(['rgb'])

    print("Consumer consumer_turn_on_rgb is started")

    try:
        while True:
            msg = consumer.poll(1.0)

            if msg is None:
                continue
            if msg.error():
                print(msg.error())
                break
            message = msg.value().decode('utf-8')        
            print('Received message in consumer_turn_on_rgb: {}'.format(message))

    except KeyboardInterrupt:
        pass

    finally:
        consumer.close()

if __name__ == '__main__':
    start_consumer()
