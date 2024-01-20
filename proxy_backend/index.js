import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import router from './server/routes.js';
import { startConsumerUltrasonicCall } from './utils/startConsumerUltrasonic.js';
import './backgroundService.js'; // Import and run the background service

const __filename = 'C:/Users/Erik Boer/Documents/Egyetem/MESTERIX/git_iot/iot';
const __dirname = 'C:/Users/Erik Boer/Documents/Egyetem/MESTERIX/git_iot/iot';


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 8080;



app.get('/', async function(req, res) {
    startConsumerUltrasonicCall();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use("/", router);
app.use(express.static(path.join(__dirname, 'public')));


app.listen(port);
console.log('Magic happens on port ' + port);
