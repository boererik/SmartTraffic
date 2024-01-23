import startConsumerUltrasonic from '../consumer_ultrasonic.js';
import { getTemperatureFromOW, handleTemperatureFromOW } from './temperature.js'
import startProducerSendTemp from '../producer_send_temp.js';
import { promises as fsPromises } from 'fs';

var carNum = 0;

async function saveToCSV(numberOfCars) {
    carNum = numberOfCars;

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const csvData = `${currentHour},${numberOfCars}\n`;
    const filePath = './output.csv';

    try {
        await fsPromises.appendFile(filePath, csvData);

        console.log(`Data saved to ${filePath}: ${currentHour}, ${numberOfCars}`);
    } catch (error) {
        console.error("Error while saving to CSV:", error);
    }
}

var flashMessage = -1;
var sleepy = false;

async function flashLeds() {
    try {
        await startProducerSendTemp(flashMessage)
        console.log("Message sent to Kafka topic 'temp' for blinking");
    } catch (error) {
        console.error("Error while sending message:", error);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 

async function startConsumerUltrasonicCall() {
    startConsumerUltrasonic(saveToCSV);

    await sleep(5000)
    while(1){
        try {
            await startProducerSendTemp(handleTemperatureFromOW(await getTemperatureFromOW()));
            //const randomNumber = Math.round(Math.random());
            //await startProducerSendTemp('0');
            console.log("Message sent to Kafka topic 'temp'");
        } catch (error) {
            console.error("Error while sending message:", error);
        }
        await sleep(5000);
    }

}

export { startConsumerUltrasonicCall, flashLeds, carNum };



