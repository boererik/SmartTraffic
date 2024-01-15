import kafka from 'kafka-node';

const user = new kafka.KafkaClient({
  kafkaHost: '192.168.0.171:9092'
});

const consumer = new kafka.Consumer(
  user,
  [{ topic: 'carnumber' }],
  { autoCommit: false } 
);

export default function startConsumerUltrasonic(saveMessageReceived) {
  console.log("Consumer_ultrasonic is started");

  consumer.on('message', (message) => {
    console.log('Received message from producer_ultrasonic: ', message.value)
    //onMessageReceived(message.value)
    saveMessageReceived(message.value)
  });
  
  consumer.on('error', (error) => {
    console.error('Error with Kafka consumer:', error);
  });

}

