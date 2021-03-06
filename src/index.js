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

const binaryOutputReducerBuffer = new Map();
const binaryOutputReducer = (channel, value, topic, on = 'on', off = 'off') => {
  const state = value > 128;
  if (binaryOutputReducerBuffer.get(channel) === state) { return; }
  binaryOutputReducerBuffer.set(channel, state);
  mqtt.publish(topic, state ? on : off);
};

/**
 * 1-2 Small traffic light
 * CH1 - RED
 * CH2 - GREEN
 */
artnet.attachChannel(1, (value) => binaryOutputReducer(1, value, 'bus/devices/traffic-light/red'));
artnet.attachChannel(2, (value) => binaryOutputReducer(2, value, 'bus/devices/traffic-light/green'));

/**
 * 3-5 Big traffic light
 * CH3 - RED
 * CH4 - YELLOW
 * CH5 - GREEN
 */
artnet.attachChannel(3, (value) => binaryOutputReducer(3, value, 'modbus/endpointint/set/red_traffic', '1', '0'));
artnet.attachChannel(4, (value) => binaryOutputReducer(4, value, 'modbus/endpointint/set/yellow_traffic', '1', '0'));
artnet.attachChannel(5, (value) => binaryOutputReducer(5, value, 'modbus/endpointint/set/green_traffic', '1', '0'));

/**
 * Red lamp over the table
 * CH6 – On/off (0...128 Off / 129...255 On)
 */
artnet.attachChannel(6, (value) => binaryOutputReducer(6, value, 'modbus/endpointint/set/red_space_light', '1', '0'));

/**
 * Color changer disco ball
 * CH6 - Dimmer overall
 * CH7 - Red
 * CH8 - Green
 * CH9 - Blue
 * CH10 - White
 * CH11 - Strobe
 * CH12 - Auto-mode (Fade: 0-250, Sound: 251-255)
 * CH13 - Auto-mode speed
 */
artnet.attachChannel(7, (value) => mqtt.publish('bus/dmx/0/1', String(value)));
artnet.attachChannel(8, (value) => mqtt.publish('bus/dmx/0/2', String(value)));
artnet.attachChannel(9, (value) => mqtt.publish('bus/dmx/0/3', String(value)));
artnet.attachChannel(10, (value) => mqtt.publish('bus/dmx/0/4', String(value)));
artnet.attachChannel(11, (value) => mqtt.publish('bus/dmx/0/5', String(value)));
artnet.attachChannel(12, (value) => mqtt.publish('bus/dmx/0/6', String(value)));
artnet.attachChannel(13, (value) => mqtt.publish('bus/dmx/0/7', String(value)));
artnet.attachChannel(14, (value) => mqtt.publish('bus/dmx/0/8', String(value)));

/**
 * Color changer scene/ceiling
 * CH14 - Dimmer overall
 * CH15 - Red
 * CH16 - Green
 * CH17 - Blue
 * CH18 - White
 * CH19 - Strobe
 * CH20 - Auto-mode (Fade: 0-250, Sound: 251-255)
 * CH21 - Auto-mode speed
 */
artnet.attachChannel(15, (value) => mqtt.publish('bus/dmx/0/9', String(value)));
artnet.attachChannel(16, (value) => mqtt.publish('bus/dmx/0/10', String(value)));
artnet.attachChannel(17, (value) => mqtt.publish('bus/dmx/0/11', String(value)));
artnet.attachChannel(18, (value) => mqtt.publish('bus/dmx/0/12', String(value)));
artnet.attachChannel(19, (value) => mqtt.publish('bus/dmx/0/13', String(value)));
artnet.attachChannel(20, (value) => mqtt.publish('bus/dmx/0/14', String(value)));
artnet.attachChannel(21, (value) => mqtt.publish('bus/dmx/0/15', String(value)));
artnet.attachChannel(22, (value) => mqtt.publish('bus/dmx/0/16', String(value)));
