from tracemalloc import start
from turtle import distance
import numpy as np
import time
import math
import array
import RPi.GPIO as GPIO
from confluent_kafka.admin import AdminClient, NewTopic
from confluent_kafka import Producer, Consumer
import random
import time
#-----  RASPBERRY   -----

# Set pin numbering to GPIO.BOARD
GPIO.setmode(GPIO.BOARD)

# Define pins for the ultrasonic modules
trig2 = 38
echo2 = 40
trig1 = 16
echo1 = 18
vehicleCount = 0
startVehicles = []
finishVehicles = []
s_o_s = False
# Set the trigger pin as OUTPUT and the echo as INPUT
GPIO.setup(trig2, GPIO.OUT)
GPIO.setup(echo2, GPIO.IN)
GPIO.setup(trig1, GPIO.OUT)
GPIO.setup(echo1, GPIO.IN)
# Set up RGB LED
# Define the pin numbers
RED_PIN = 11
GREEN_PIN = 13
BLUE_PIN = 15
ice_pin = 36
# Set up the pins as output
GPIO.setup(RED_PIN, GPIO.OUT)
GPIO.setup(GREEN_PIN, GPIO.OUT)
GPIO.setup(BLUE_PIN, GPIO.OUT)

GPIO.setup(ice_pin, GPIO.OUT)
# Function to set LED color
def turn_blueled_off():
    GPIO.output(ice_pin, GPIO.LOW)
def turn_blueled_on():
    GPIO.output(ice_pin, GPIO.HIGH)

def turn_led_off():
    GPIO.output(RED_PIN, GPIO.LOW)
    GPIO.output(GREEN_PIN, GPIO.LOW)
    GPIO.output(BLUE_PIN, GPIO.LOW)
    time.sleep(0.8)
def set_led_color(color):
    # Turn off all colors initially
    GPIO.output(RED_PIN, GPIO.LOW)
    GPIO.output(GREEN_PIN, GPIO.LOW)
    GPIO.output(BLUE_PIN, GPIO.LOW)

    # Set the color based on the input string
    if color.lower() == 'red':
        GPIO.output(RED_PIN, GPIO.HIGH)
    elif color.lower() == 'green':
        GPIO.output(GREEN_PIN, GPIO.HIGH)
    elif color.lower() == 'yellow':
        GPIO.output(RED_PIN, GPIO.HIGH)
        GPIO.output(GREEN_PIN, GPIO.HIGH)
    #for calibration
    elif color.lower() == 'turqoise':
        GPIO.output(BLUE_PIN, GPIO.HIGH)
        GPIO.output(GREEN_PIN, GPIO.HIGH)
    #when cars pass under
    elif color.lower() == 'blue':
        GPIO.output(BLUE_PIN, GPIO.HIGH)
    elif color.lower() == 'magenta':
        GPIO.output(RED_PIN, GPIO.HIGH)
        GPIO.output(BLUE_PIN, GPIO.HIGH)
def startSensor():
    try:
        GPIO.output(trig1, GPIO.HIGH)
        time.sleep(0.00001)
        GPIO.output(trig1, GPIO.LOW)

        start = time.time()
        stop = time.time()

        while GPIO.input(echo1) == 0:
            start = time.time()

        while GPIO.input(echo1) == 1:
            stop = time.time()

        duration = stop - start
        distance = 34300 / 2 * duration

    except GPIO.GPIOError as e:
        print(f"GPIO Error: {e}")
        distance = -1  # Set a default distance in case of error
    return distance
def finishSensor():
    try:
        GPIO.output(trig2, GPIO.HIGH)
        time.sleep(0.00001)
        GPIO.output(trig2, GPIO.LOW)

        start = time.time()
        stop = time.time()

        while GPIO.input(echo2) == 0:
            start = time.time()

        while GPIO.input(echo2) == 1:
            stop = time.time()

        duration = stop - start
        distance = 34300 / 2 * duration

    except Exception as e:
        print(f'EXCEPTION OCCURRED: {str(e)}')
        distance = -1  # Set a default distance in case of error
    return distance
def calibrateSensors():
    startroad = []
    finishroad = []
    for i in range (5):
        print('Calibrating...')
        set_led_color('turqoise')
        startroad.append(int(startSensor()))
        finishroad.append(int(finishSensor()))
        turn_led_off()
        time.sleep(0.5)
    avgstart = sum(startroad)/len(startroad)
    avgfinish = sum(finishroad)/len(finishroad)
    print('Calibrated sensors', avgstart, avgfinish)
    return avgstart, avgfinish
roads = calibrateSensors()
road_start = roads[0]
road_finish = roads[1]

def categorize_vehicle(sensorId):
    category = 0
    if (sensorId == 'startSensor'):
        measurement = math.floor(startSensor())
        category = road_start-measurement
    if (sensorId == 'finishSensor'):
        measurement = math.floor(finishSensor())
        category = road_finish-measurement
    #get category
    if (category > -1 and category < 2):
        return 'road', category
    elif (category >= 2 and category < 5 ):
        set_led_color('blue')
        return 'car', category
    elif (category >= 5 and category < 8):
        set_led_color('magenta')
        return 'truck', category
    else:
        return 'N/A', category
def listVehicles(startVehicles):
    vehicleList = []
    measured = 0
    vehicle = ''
    for i in (startVehicles):
        if i == 'road':
            if measured != 0:
                vehicleList.append([vehicle,measured])
            vehicle = 'car'
            measured = 0
        if i != 'road':
            measured+=1
            if i == 'truck':
                vehicle = 'truck'
    return vehicleList  

def handleStart():
    global vehicleCount
    global startVehicles
    startVehicles.append(categorize_vehicle('startSensor')[0])
    lastIndex = len(startVehicles)-1
    if (startVehicles[lastIndex] == 'road'):
            before = lastIndex-1
            if (startVehicles[before] == 'car' or startVehicles[before] == 'truck'):
                vehicleCount+=1
                print(vehicleCount)
                turn_led_off()
def handleFinish():
    global vehicleCount
    global finishVehicles
    finishVehicles.append(categorize_vehicle('finishSensor')[0])
    lastIndex = len(finishVehicles)-1
    if (finishVehicles[lastIndex] == 'road'):
            before = lastIndex-1
            if (finishVehicles[before] == 'car' and finishVehicles[before-1] == 'car'
                or finishVehicles[before] == 'truck' and finishVehicles[before-1] == 'truck' ):
                if (vehicleCount > 0):
                    vehicleCount-=1
                    print(vehicleCount)
                    turn_led_off()

# - - - - - KAFKA SERVER - - - - -
def delivery_report(err, msg):
    if err is not None:
        print('Message delivery failed: {}'.format(err))
    else:
        print('Message delivered to {} [{}]'.format(msg.topic(), msg.value()))

def start_producer():
   
    broker_address = '192.168.219.97:9092'
    
    topic = 'carnumber'
    
    admin_client = AdminClient({'bootstrap.servers': broker_address})
    
    producer = Producer({'bootstrap.servers': broker_address})
    
    new_topic = NewTopic(topic, num_partitions=1, replication_factor=1)
    
    admin_client.delete_topics([topic])
    admin_client.create_topics([new_topic])

    print("Consumer consumer_blue_led is started")
    while (True):
        try:
            #PRODUCER + ULTRASONIC
            handleStart()
            time.sleep(0.25)
            handleFinish()
            time.sleep(0.25)
            if(vehicleCount >= 0 and vehicleCount < 2):
                set_led_color('green')
            elif(vehicleCount >=2 and vehicleCount <= 3):
                set_led_color('yellow')
            elif(vehicleCount > 3):
                set_led_color('red')
            message_value = str(vehicleCount)
            print("kafka msg: ",message_value)
            producer.produce(topic, key='some_key', value=message_value, callback=delivery_report)
        except KeyboardInterrupt:
                print(startVehicles)
                producer.flush()
                break
    producer.flush()

# vehicles_start = listVehicles(startVehicles)
# vehicles_finish = listVehicles(finishVehicles)
# print('success')
# for v in (vehicles_start):
#     print(v)
# print('Traffic size: ', len(vehicles_start))
# for v in (vehicles_finish):
#     print(v)
# print('Traffic size: ', len(vehicles_finish))
# print('whole array start: ', startVehicles)
# print('whole array finish: ', finishVehicles)

start_producer()
# Use the same GPIO.cleanup() after all measurements are done
GPIO.cleanup()
