import kafka from 'kafka-node';

const user = new kafka.KafkaClient({
    kafkaHost: 'localhost:9092'
});

const producer = new kafka.Producer(user);

let isProducerReady = false;

producer.on('ready', () => {
    console.log('Kafka Producer actuate rgb is ready');
    isProducerReady = true;
});

producer.on('error', (error) => {
    console.error('Error connecting to Kafka:', error);
});

export default async function startProducerRGB(message) {
    console.log("Producer actuate_rgb is started");

    return new Promise((resolve, reject) => {
        const sendPayload = () => {
            const payload = [{
                topic: 'rgb',
                messages: message.toString()
            }];

            producer.send(payload, (error, data) => {
                if (error) {
                    console.error('Error in publishing message:', error);
                    reject(error);
                } else {
                    console.log('Message successfully published for turning on rgb:', data);
                    resolve();
                }
            });
        };

        if (isProducerReady) {
            sendPayload();
        } else {
            producer.on('ready', () => {
                console.log('Kafka Producer actuate_rgb is ready');
                isProducerReady = true;
                sendPayload();
            });
        }
    });
}
