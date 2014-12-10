var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  console.log('Incoming connection from ' + req.connection.remoteAddress)
  res.end('{"device_path": "/dev/i2c-1", "i2c_address": 7, "errors": {"start_byte": false, "pwm_frequency": false, "motor_speed": false, "servo_position": false, "impact_sensitivity": false, "low_battery": false, "i2c_address": false, "i2c_speed": false}, "battery_voltage": 7.52, "motor_current": {"left": 2.15, "right": 5.71}, "encoder_count": {"left": 125, "right": 800}, "accelero_meter": [0, 125, 88], "impact": [0, 125, 88]}');
}).listen(1337, '0.0.0.0');

console.log('Server running at http://0.0.0.0:1337/');