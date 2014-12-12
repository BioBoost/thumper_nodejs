var device_path = "/dev/i2c-1";
var i2c_address = 7;
var master_app = '/home/pi/trex/i2c_pi_trex_master/i2c_pi_trex_master ' + device_path + ' ' + i2c_address;

var exec = require('child_process').exec;
var http = require('http');
http.createServer(function (req, res) {

  if (req.method == 'POST') {
      console.log("POST");
      console.log('Incoming connection from ' + req.connection.remoteAddress);
      res.writeHead(200, {'Content-Type': 'text/plain'});

      var body = '';
      req.on('data', function (data) {
          body += data;
      });
      req.on('end', function () {
        console.log("JSON command string: " + body);

        // Get the thumper status
        command = thumperCommandToJson(body);
        console.log("Sending command to trex master: " + command);
        exec(master_app + " " + command,    // append command string
          function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
              console.log('exec error: ' + error);
            }

            var json_status = thumperStatusToJson(stdout);

            // How can this work ?? Why can callback function access res ?????
            res.end(json_status);
        });
    });
  }
  else
  {
    console.log("GET");
    console.log('Incoming connection from ' + req.connection.remoteAddress);
    res.writeHead(200, {'Content-Type': 'text/plain'});

    // Get the thumper status
    exec(master_app,
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }

        var json_status = thumperStatusToJson(stdout);

        // How can this work ?? Why can callback function access res ?????
        res.end(json_status);
    });
  }
}).listen(1337, '0.0.0.0');

console.log('Server running at http://0.0.0.0:1337/');

/*
 Parse the status byte array coming from the master app
*/
function thumperStatusToJson(byteString) {
  var trex_values = byteString.split(" ");
  var battery_voltage = (256*parseInt(trex_values[2]) + parseInt(trex_values[3]))/100.0;

  var json_status = '{\
    "device_path": "' + device_path + '",\
    "i2c_address": ' + i2c_address + ',\
    "errors": {\
      "start_byte": false,\
      "pwm_frequency": false,\
      "motor_speed": false,\
      "servo_position": false,\
      "impact_sensitivity": false,\
      "low_battery": false,\
      "i2c_address": false,\
      "i2c_speed": false},\
    "battery_voltage": ' + battery_voltage + ',\
    "motor_current": {"left": 0.0, "right": 0.0},\
    "encoder_count": {"left": 0, "right": 0},\
    "accelero_meter": [0, 0, 0],\
    "impact": [0, 0, 0]}';

  return json_status;
}

/*
 Parse the command json string and convert to byte string to send to master app
*/
function thumperCommandToJson(json_command) {
  var byteString = "";

  var jsonObj = JSON.parse(json_command);

  var startByte = 15;
  var pwm_frequency = 6;

  var left_motor_speed = jsonObj.motor_speed.left;
  var left_motor_brake = 0;

  var right_motor_speed = jsonObj.motor_speed.right;
  var right_motor_brake = 0;

  var servo_0 = 0;
  var servo_1 = 0;
  var servo_2 = 0;
  var servo_3 = 0;
  var servo_4 = 0;
  var servo_5 = 0;
  var accel_devibrate = 50;
  var impact_sens = 0;
  var low_batt = 600;
  var i2c_address = 7;
  var clock = 0;

  byteString = startByte + " " +
    pwm_frequency + " " +
    parseInt(left_motor_speed / 256) + " " +
    parseInt(left_motor_speed % 256) + " " +
    left_motor_brake + " " +
    parseInt(right_motor_speed / 256) + " " +
    parseInt(right_motor_speed % 256) + " " +
    right_motor_brake + " " +

    parseInt(servo_0 / 256) + " " +
    parseInt(servo_0 % 256) + " " +
    parseInt(servo_1 / 256) + " " +
    parseInt(servo_1 % 256) + " " +
    parseInt(servo_2 / 256) + " " +
    parseInt(servo_2 % 256) + " " +
    parseInt(servo_3 / 256) + " " +
    parseInt(servo_3 % 256) + " " +
    parseInt(servo_4 / 256) + " " +
    parseInt(servo_4 % 256) + " " +
    parseInt(servo_5 / 256) + " " +
    parseInt(servo_5 % 256) + " " +

    accel_devibrate + " " +

    parseInt(impact_sens / 256) + " " +
    parseInt(impact_sens % 256) + " " +

    parseInt(low_batt / 256) + " " +
    parseInt(low_batt % 256) + " " +

    i2c_address + " " +
    clock;

    return byteString;
}