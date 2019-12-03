var httpd = require('http').createServer(handler);
var io = require('socket.io').listen(httpd);
var fs = require('fs');
var path = require('path');

//FIXME make an udev rule
const iio_p = "/sys/bus/iio/devices/iio:device0/";
const v1_raw_fd = iio_p + "in_voltage1_raw";
const v1v2_raw_fd = iio_p + "in_voltage1-voltage2_raw";
const sFreq_fd = iio_p + "sampling_frequency";
/* Scale: Allows the user to select one scale out of the available scales. If the 
 * written scale differs from the current scale. The driver performs full and 
 * zero offset calibration on all differential input channels. */
/* e.g. scale 0.000149010 --> gain*1   (+/-2.5v);
 *            0.000001160 --> gain*128 (+/-19.53v); */
const vScale_fd = iio_p + "in_voltage_scale";
const vScale = fs.readFileSync(vScale_fd);
const vvScale_fd = iio_p + "in_voltage-voltage_scale"; 
const vvScale = fs.readFileSync(vvScale_fd);

var payload = [0,0,0];

process.on('SIGINT',() => {
	process.exit(1);
});

var pause0 = function() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve("pause");
		},0);
	});
};

var main = function() {
	return new Promise(resolve => {
		let contents = fs.readFileSync(v1v2_raw_fd,'utf8');
		//var contents = fs.readFileSync(v1_raw_fd,'utf8');
		payload[0] = contents * vvScale;
		//console.log(payload.toString());
		io.sockets.emit('serverMessage',payload.toString());
		resolve("done");
	});
};

var calib = function() {
	return new Promise(resolve => {
		payload[0] = 0.0; //min
		io.sockets.emit('serverMessage',payload.toString());
		payload[0] = 2500.0; //max
		io.sockets.emit('serverMessage',payload.toString());
		resolve("done");
	});
};

var loop = function(task) {
	task();
	return pause0().then(() => {
		task();
		return loop(task);
	});
};
loop(main);

httpd.listen(4000);
function handler(req, res) {
	var filePath = '.' + req.url;
	if(filePath == './') filePath = './index.html';
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch(extname){
	case '.js':
	    contentType = 'text/javascript';
	    break;
	case '.css':
	    contentType = 'text/css';
	    break;
	}
	fs.readFile(filePath,function(err,content){
	    if(err){
		if(err.code=='ENOENT'){
		    //fs.readFile('./404.html',function(err,content){
			//res.writeHead(200,{'Content-Type': contentType });
			//res.end(content,'utf-8');
		    //});
		} else {
		    res.writeHead(500);
		    res.end(err.code);
		}
	    } else {
		res.writeHead(200,{'Content-Type': contentType });
		res.end(content,'utf-8');
	    }
	});
}
io.sockets.on('connection', function (socket) {
	socket.emit('serverMessage','connected');
	/*socket.on('clientMessage', function(content) {
		console.log(content);
		socket.emit('serverMessage', 'You said: ' + content);
		socket.broadcast.emit('serverMessage', socket.id + ' said: ' +
			content);
	});*/
});

/*setInterval(function(){
	//io.sockets.emit('serverMessage',(new Date()));
},10);*/

