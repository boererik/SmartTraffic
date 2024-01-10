import kafka from 'kafka-node';

const user = new kafka.KafkaClient({
  kafkaHost: 'localhost:9092'
});

const consumer = new kafka.Consumer(
  user,
  [{ topic: 'carnumber' }],
  { autoCommit: false } 
);

export default function startConsumerUltrasonic(onMessageReceived) {
  console.log("Consumer_ultrasonic is started");

  consumer.on('message', (message) => {
    console.log('Received message from producer_ultrasonic: ', message.value)
    onMessageReceived(message.value)
  });
  
  consumer.on('error', (error) => {
    console.error('Error with Kafka consumer:', error);
  });

}

