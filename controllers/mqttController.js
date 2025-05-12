const mqtt = require('mqtt');
const mqttConfig = require('../config/mqttConfig');

class MqttService {
  constructor() {
    this.client = mqtt.connect(mqttConfig.brokerUrl, mqttConfig.options);
    
    this.client.on('connect', () => {
      console.log('✅ Connected to HiveMQ');
      console.log('Client ID:', this.client.options.clientId);
    });
  
    this.client.on('reconnect', () => {
      console.log('🔄 Attempting reconnect...');
    });
  
    this.client.on('close', () => {
      console.log('🔌 Connection closed');
    });
  
    this.client.on('offline', () => {
      console.log('📴 Client offline');
    });
  
    this.client.on('error', (err) => {
      console.error('❌ Connection error:', err);
      console.log('Current client options:', this.client.options);
    });
  }

  publish(topic, message) {
    return new Promise((resolve, reject) => {
      this.client.publish(topic, message, { qos: 1 }, (err) => {

        
        if (err) {
          console.error('❌ Publish Error:', err.message);
          return reject(err);
        }
        console.log(`✅ Message published to topic ${topic}: ${message}`);
        resolve(true);
        
        return {
          status: 'success',
          message: 'Message published successfully'
        }

      });
    });
  }

  getClient() {
    return this.client;
  }
}

module.exports = new MqttService();