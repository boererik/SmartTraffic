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

const flashMessage = -1

//call this when sos button is pushed
async function flashLeds() {
    try {
        await Promise.all([
            startProducerSendTemp(flashMessage)
        ]);
        console.log("Message sent to Kafka topic 'rgb and temp'");
    } catch (error) {
        console.error("Error while sending message:", error);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 

async function startConsumerUltrasonicCall() {
    console.log('belep')
    startConsumerUltrasonic(saveToCSV);

    await sleep(5000)
    while(1){
        try {
            //await startProducerSendTemp(handleTemperatureFromOW(getTemperatureFromOW()));
            const randomNumber = Math.round(Math.random());
            await startProducerSendTemp('1');
            console.log("Message sent to Kafka topic 'temp'");
        } catch (error) {
            console.error("Error while sending message:", error);
        }
        await sleep(5000);
    }

    //producer turns on/off the blue led according to temperature
    // try {
    //     await startProducerSendTemp(handleTemperatureFromOW(getTemperatureFromOW()));
    //     console.log("Message sent to Kafka topic 'temp'");
    // } catch (error) {
    //     console.error("Error while sending message:", error);
    // }\
    // try {
    //     await flashLeds()
    // } catch (error) {
    //     console.error("Error while sending message:", error);
    // }
}

export { startConsumerUltrasonicCall, flashLeds, carNum };



