import startProducerRGB from './producer_actuate_rgb.js';
import startConsumerUltrasonic from './consumer_ultrasonic.js';
import getTemperatureFromOW from './temperature.js'

async function handleReceivedMessage(numberOfCars) {
    console.log("Return value numberOfCars:", numberOfCars);

    let number = 0
    if (numberOfCars <= 1) {
        number = 1
    } else {
        if (numberOfCars > 1 && numberOfCars < 3) {
            number = 2
        } else {
            number = 3
        }
    }
    
    try {
        await startProducerRGB(number);
        console.log("Message sent to Kafka topic 'rgb'");
      } catch (error) {
        console.error("Error while sending message:", error);
      }
}

async function main() {
    startConsumerUltrasonic(handleReceivedMessage);
    let temp = getTemperatureFromOW();
    console.log(temp)
}

main();



