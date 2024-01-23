import RPi.GPIO as GPIO
import time
from confluent_kafka.admin import AdminClient, NewTopic
from confluent_kafka import Producer, Consumer
GPIO.setmode(GPIO.BOARD)
ice_pin = 36
GPIO.setup(ice_pin, GPIO.OUT)
def turn_led_off():
	GPIO.output(ice_pin, GPIO.LOW)
def turn_led_on():
	GPIO.output(ice_pin, GPIO.HIGH)
def blink_led():
	GPIO.output(ice_pin, GPIO.LOW)
	time.sleep(2)
	for i in range(3):
		GPIO.output(ice_pin, GPIO.HIGH)
		time.sleep(0.3)
		GPIO.output(ice_pin, GPIO.LOW)
	
def start_consumer():
	conf = {
        'bootstrap.servers': '192.168.219.97:9092',
        'group.id': 'mygroup',
        'auto.offset.reset': 'earliest'
    }

	consumer = Consumer(conf)
	consumer.subscribe(['temp'])
	print("Consumer consumer_blue_led is started")

	try:
		while True:
			time.sleep(2)
			msg = consumer.poll(0)
			if msg is None:
				continue
			if (msg.error()):
				print("REACHED END OF FILE. WAITING FOR MORE...")
			message = msg.value().decode('utf-8')
			if (message == '0'):
				turn_led_off()
			if (message == '1'):
				turn_led_on()   
			if (message == '-1'):
				blink_led()
			print('Received message in consumer_blue_led: {}'.format(message))

	except KeyboardInterrupt:
		pass
	finally:
		consumer.close()
		GPIO.cleanup()




if __name__ == '__main__':
    start_consumer()
GPIO.cleanup()

