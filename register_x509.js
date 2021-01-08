// PROVISIONING_HOST=devidpsdeu1dps001.azure-devices-provisioning.net;
//PROVISIONING_IDSCOPE=0ne001CF247;
//PROVISIONING_REGISTRATION_ID=24c546e2-ff32-4d90-9df9-3df142c8ab17@https://stage.eu.mybuildings.abb.com;
//CERTIFICATE_FILE=public.pem;
//KEY_FILE=private.pem
'use strict';


var iotHubTransport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

var fs = require('fs');
//读取配置文件，变量config的类型是Object类型
var config = require('./config.json');

// You can change the following using statement if you would like to try another protocol.
var Transport = require('azure-iot-provisioning-device-mqtt').Mqtt;
// var Transport = require('azure-iot-provisioning-device-amqp').Amqp;
// var Transport = require('azure-iot-provisioning-device-amqp').AmqpWs;
// var Transport = require('azure-iot-provisioning-device-http').Http;
// var Transport = require('azure-iot-provisioning-device-mqtt').MqttWs;


var X509Security = require('azure-iot-security-x509').X509Security;
var ProvisioningDeviceClient = require('azure-iot-provisioning-device').ProvisioningDeviceClient;

//读取配置文件config.json中的变量
var provisioningHost = config["PROVISIONING_HOST"];
var idScope = config["PROVISIONING_IDSCOPE"];
// var registrationId = config["PROVISIONING_REGISTRATION_ID"];

//获取 registrationId 值
var globals = require('./globals.json');
for (var i=0;i<globals["values"].length;i++){
    if(globals["values"][i]["key"]=="deviceid"){
        var registrationId=globals["values"][i]["value"];
    }
};

console.log("registrationId: "+registrationId)

var deviceCert = {
  cert: fs.readFileSync(config["CERTIFICATE_FILE"]).toString(),
  key:fs.readFileSync(config["KEY_FILE"]).toString()
};

console.log("publickey: "+deviceCert["cert"])

var transport = new Transport();
var securityClient = new X509Security(registrationId, deviceCert);
var deviceClient = ProvisioningDeviceClient.create(provisioningHost, idScope, transport, securityClient);

// Register the device.  Do not force a re-registration.
deviceClient.register(function(err, result) {
  if (err) {
    console.log("error registering device: " + err);
  } else {
    console.log('registration succeeded');
    console.log('assigned hub=' + result.assignedHub);
    console.log('deviceId=' + result.deviceId);
    var connectionString = 'HostName=' + result.assignedHub + ';DeviceId=' + result.deviceId + ';x509=true';
    var hubClient = Client.fromConnectionString(connectionString, iotHubTransport);
    hubClient.setOptions(deviceCert);
    hubClient.open(function(err) {
      if (err) {
        console.error('Failure opening iothub connection: ' + err.message);
      } else {
        console.log('Client connected');
        var message = new Message('Hello world');
        hubClient.sendEvent(message, function(err, res) {
          if (err) console.log('send error: ' + err.toString());
          if (res) console.log('send status: ' + res.constructor.name);
          process.exit();
        });
      }
    });
  }
});
