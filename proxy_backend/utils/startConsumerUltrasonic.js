import startProducerRGB from '../producer_actuate_rgb.js';
import startConsumerUltrasonic from '../consumer_ultrasonic.js';
import { getTemperatureFromOW, handleTemperatureFromOW } from './temperature.js'
import startProducerSendTemp from '../producer_send_temp.js';
import { promises as fsPromises } from 'fs';

async function saveToCSV(numberOfCars) {
    // Get the current time
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    // Prepare the data for CSV
    const csvData = `${numberOfCars},${currentHour}\n`;

    // Specify the file path
    const filePath = '../data/output.csv';

    try {
        // Append data to the CSV file
        await fsPromises.appendFile(filePath, csvData);

        console.log(`Data saved to ${filePath}: ${numberOfCars}, ${currentHour}`);
    } catch (error) {
        console.error("Error while saving to CSV:", error);
    }
}

const flashMessage = -1

//call this when sos button is pushed
async function flashLeds() {
    try {
        await Promise.all([
            startProducerRGB(flashMessage),
            startProducerSendTemp(flashMessage)
        ]);
        console.log("Message sent to Kafka topic 'rgb and temp'");
    } catch (error) {
        console.error("Error while sending message:", error);
    }
}

async function startConsumerUltrasonicCall() {
    const carNum = startConsumerUltrasonic(saveToCSV);

    return carNum;
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

export { startConsumerUltrasonicCall, flashLeds };



