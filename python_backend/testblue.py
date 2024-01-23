import RPi.GPIO as GPIO
import time
GPIO.setmode(GPIO.BOARD)
ice_pin = 36

GPIO.setup(ice_pin, GPIO.OUT)

while True:
	try:
		GPIO.output(ice_pin, GPIO.LOW)
		time.sleep(1)
		GPIO.output(ice_pin, GPIO.HIGH)
		time.sleep(1)
	except KeyboardInterrupt:
		break
GPIO.cleanup()

