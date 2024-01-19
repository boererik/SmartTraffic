import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import router from './server/routes.js';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.resolve(path.dirname(__filename), '..'); // Set to parent directory

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 8080;

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use("/", router);
app.use(express.static(path.join(__dirname, 'public')));

// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);
