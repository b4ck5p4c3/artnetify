const dmxlib = require('dmxnet');

class Artnetify {

  constructor(universe = 0, net = 0, subnet = 0, options = {}) {

    this.channelsHandlers = new Map();
    this.lastChannelsValues = new Map();

    this.dmxnet = new dmxlib.dmxnet({
      log: { level: 'error' },
      oem: options.oem || 0,
      sName: options.name || 'Artnetify',
      lName: options.descritpion || 'Freakingly cool ArtNet proxy',
    });

    this.dmxReceiver = this.dmxnet.newReceiver({ universe: universe, net, subnet });

    this.dmxReceiver.on('data', data => {

      data.forEach((value, channel) => {

        // Debounce values unless disabled
        if (!options.disableDebounce && this.lastChannelsValues.get(channel) === value)
          return;

        this.lastChannelsValues.set(channel, value);
        this.channelsHandlers.get(channel)?.map(handler => handler(value));

      })

    });

  }

  attachChannel(ch, callback) {

    const channel = ch - 1;
    if (!this.channelsHandlers.has(channel))
      this.channelsHandlers.set(channel, []);

    this.channelsHandlers.get(channel).push(callback);

  }

}

module.exports = Artnetify;
