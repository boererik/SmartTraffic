import express from 'express';
import { startConsumerUltrasonicCall, flashLeds } from '../utils/startConsumerUltrasonic.js';
import {getTemperatureFromOW} from '../utils/temperature.js'
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.get('/', function(req, res) {
    startConsumerUltrasonicCall();
    res.json({ message: 'hooray! welcome to our api!' });
});

router.post('/toggleLED', async (req, res) => { // Make the callback function async
    // Toggle the LED state
    try {
        await flashLeds();
    } catch (error) {
        console.error("Error while sending message:", error);
    }
    // Send a response to the client
    res.send('LED state toggled');
});

router.get('/weather', async (req, res) => {
    try {
        var temperature = await getTemperatureFromOW();
        var weather = `${temperature}°C`;
    } catch (error) {
        console.error("Error while sending message:", error);
    }
    res.json({ message: weather});
});

router.get('/currentTraffic', async (req, res) => {
    try {
        var carNumber = await startConsumerUltrasonicCall();

    } catch (error) {
        console.error("Error while sending message: ", error);
    }
    res.json({ message: carNumber});
});

router.get('/csvData', function(req, res) {
    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.resolve(path.dirname(__filename), '..'); // Set to parent directory
    const filePath = path.join(__dirname, 'output.csv'); // Replace with your actual CSV file path
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.send(fileContent);
});

router.get('/staticCsvData', function(req, res) {
    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.resolve(path.dirname(__filename), './data'); // Set to parent directory
    const filePath = path.join(__dirname, 'data.csv'); // Replace with your actual CSV file path
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.send(fileContent);
});
export default router;
