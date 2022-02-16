require('dotenv').config();

const fs = require('fs');
const path = require('path');
const MQTT = require('mqtt');
const debug = require('debug')('artnetify');
const Artnetify = require('./artnetify');

const artnet = new Artnetify();

const mqttOptions = {};
if (process.env.MQTT_CA_PATH) {
  mqttOptions.ca = fs.readFileSync(path.resolve(__dirname, process.env.MQTT_CA_PATH));
}

const mqtt = MQTT.connect(process.env.MQTT_URI, mqttOptions);

mqtt.on('connect', () => debug('mqtt connected'));
mqtt.on('error', (err) => debug('mqtt failed: %O', err));

/**
 * 1-2 Small traffic light
 * CH1 - RED
 * CH2 - GREEN
 */
artnet.attachChannel(1, (value) => {
  debug('(ch1) small traffic light red: %d', value);
  mqtt.publish('bus/devices/traffic-light/red', (value > 128) ? 'on' : 'off');
});

artnet.attachChannel(2, (value) => {
  debug('(ch2) small traffic light green: %d', value);
  mqtt.publish('bus/devices/traffic-light/green', (value > 128) ? 'on' : 'off');
});

/**
 * 3-5 Big traffic light
 * CH3 - RED
 * CH4 - YELLOW
 * CH5 - GREEN
 */
artnet.attachChannel(3, (value) => {
  debug('(ch3) big traffic light red: %d', value);
  mqtt.publish('modbus/endpointint/set/red_traffic', (value > 128) ? '1' : '0');
});

artnet.attachChannel(4, (value) => {
  debug('(ch4) big traffic light yellow: %d', value);
  mqtt.publish('modbus/endpointint/set/yellow_traffic', (value > 128) ? '1' : '0');
});

artnet.attachChannel(5, (value) => {
  debug('(ch5) big traffic light green: %d', value);
  mqtt.publish('modbus/endpointint/set/green_traffic', (value > 128) ? '1' : '0');
});

artnet.attachChannel(6, (value) => {
  debug('(ch6) red space light: %d', value);
  mqtt.publish('modbus/endpointint/set/red_space_light', (value > 128) ? '1' : '0');
});
