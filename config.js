var config = {
  cgate: {
    host: '0.0.0.0',
    contolport: 20023,
    eventport: 20024,
    statusport: 20025,
    cbusname: 'STANFOR2',
    network: 254,
    application: 56
  },
  webserver: {
    port: 8080,
    host: '0.0.0.0'
  },
  location: {
    latitude: '31.9523',
    longitude: '115.8613',
    timezone: 'Australia/Perth'
  }
};

module.exports = config;
