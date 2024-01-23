import express from 'express';
import { startConsumerUltrasonicCall, flashLeds, carNum } from '../utils/startConsumerUltrasonic.js';
import {getTemperatureFromOW} from '../utils/temperature.js'
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.post('/toggleLED', async (req, res) => {
    try {
        await flashLeds();
    } catch (error) {
        console.error("Error while sending message:", error);
    }
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
    res.json({ message: carNum});
});

router.get('/csvData', function(req, res) {
    const __dirname = path.resolve('C:/Users/Erik Boer/Documents/Egyetem/MESTERIX/git_iot/iot/proxy_backend/'); 
    const filePath = path.join(__dirname, 'output.csv'); 
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.send(fileContent);
});

router.get('/staticCsvData', function(req, res) {
    const __dirname = path.resolve('C:/Users/Erik Boer/Documents/Egyetem/MESTERIX/git_iot/iot/proxy_backend/'); 
    const filePath = path.join(__dirname, 'output.csv'); 
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.send(fileContent);
});
export default router;
