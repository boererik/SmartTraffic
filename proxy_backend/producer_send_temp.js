import kafka from 'kafka-node';

const user = new kafka.KafkaClient({
    kafkaHost: '192.168.219.97:9092'
});

const producer = new kafka.Producer(user);

let isProducerReady = false;

producer.on('ready', () => {
    console.log('Kafka Producer for sending temp is ready');
    isProducerReady = true;
});

producer.on('error', (error) => {
    console.error('Error connecting to Kafka:', error);
});

export default async function startProducerSendTemp(message) {
    console.log("Producer send_temp is started");

    return new Promise((resolve, reject) => {
        const sendPayload = () => {
            const payload = [{
                topic: 'temp',
                messages: message.toString()
            }];

            producer.send(payload, (error, data) => {
                if (error) {
                    console.error('Error in publishing message:', error);
                    reject(error);
                } else {
                    console.log('Message successfully published for sending temp:', data);
                    resolve();
                }
            });
        };

        if (isProducerReady) {
            sendPayload();
        } else {
            producer.on('ready', () => {
                console.log('Kafka Producer send_temp is ready');
                isProducerReady = true;
                sendPayload();
            });
        }
    });
}
