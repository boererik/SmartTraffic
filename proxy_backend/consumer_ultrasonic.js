import kafka from 'kafka-node';

const user = new kafka.KafkaClient({
  kafkaHost: '192.168.219.97:9092'
});

const consumer = new kafka.Consumer(
  user,
  [{ topic: 'carnumber' }],
  { autoCommit: false } 
);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function startConsumerUltrasonic(saveMessageReceived) {
  console.log("Consumer_ultrasonic is started");
  consumer.on('message', (message) => {

    console.log('Received message from the ultrasonic sensors: ', message.value)
    saveMessageReceived(message.value);
  });
  
  consumer.on('error', (error) => {
    console.error('Error with Kafka consumer:', error);
  });

}

