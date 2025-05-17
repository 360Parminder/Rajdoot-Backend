require('dotenv').config();
  const pass= process.env.HIVEMQ_PASSWORD;
  console.log(pass); // Hide password in logs
  
module.exports = {
  brokerUrl: process.env.HIVEMQ_URL,
  options: {
    port: 8883,
    username: process.env.HIVEMQ_USERNAME ,
    password: process.env.HIVEMQ_PASSWORD ,
    clientId: 'nodejs-server-' + Math.random().toString(16).substr(2, 8),
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    protocol: 'mqtts',
    rejectUnauthorized: false // TEMPORARY for testing
  },
  topicPrefix: 'home/automation/sms-gateway'
};