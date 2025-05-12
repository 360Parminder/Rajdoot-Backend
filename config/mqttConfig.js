require('dotenv').config();

module.exports = {
  brokerUrl: process.env.HIVEMQ_URL,
  options: {
    port: 8883,
    username: process.env.HIVEMQ_USERNAME,
    password: process.env.HIVEMQ_PASSWORD,
    clientId: 'nodejs-' + require('crypto').randomBytes(4).toString('hex'),
    clean: true,
    keepalive: 60,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
    protocol: 'mqtts',
    protocolVersion: 4, // MQTT v3.1.1
    rejectUnauthorized: false, // TEMPORARY for debugging
    debug: true // Enable MQTT.js internal logging
  },
  topicPrefix: 'home/automation/sms-gateway'
};