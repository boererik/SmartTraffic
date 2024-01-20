// backgroundService.js
import { startConsumerUltrasonicCall } from './utils/startConsumerUltrasonic.js';

// Start the consumer function continuously in the background
startConsumerUltrasonicCall();

// Optionally, you can add additional logic or tasks that should run continuously.

// Prevent the Node.js process from exiting immediately
process.stdin.resume();
