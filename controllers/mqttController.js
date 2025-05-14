const mqtt = require('mqtt');
const mqttConfig = require('../config/mqttConfig');

class MqttService {
  constructor() {
    this.client = mqtt.connect(mqttConfig.brokerUrl, mqttConfig.options);
    this.topicPrefix = mqttConfig.topicPrefix;
    
    this.client.on('connect', () => {
      console.log('✅ Successfully connected to HiveMQ Cloud');
    });

    this.client.on('error', (err) => {
      console.error('❌ MQTT Connection Error:', err.message);
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