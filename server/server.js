var pjson = require('../package.json'),
		connect = require('connect'),
		sharejs = require('share').server;

var port = 8080;

var server = connect(connect.static('app'));

var options = {
	sockjs: {},
	browserChannel: null,
	rest: null,
	socketio: null,
	db: {type: 'redis'},
	auth: function(client, action) {
		action.accept();
	}
};

console.log("Mathador v" + pjson.version);
console.log("ShareJS v" + sharejs.version);
console.log("Options: ", options);

// Attach sharejs REST and Websocket interfaces to server and start
sharejs.attach(server, options).listen(port);
console.log("Mathador server running at http://localhost:" + port);

process.title = 'mathador';
process.on('uncaugtException', function (err) {
	console.error('An error has occurred. Please contact the system administrator.');
	console.error('Mathador Version ' + mathador.version);
	console.error('ShareJS Version ' + sharejs.version);
	console.error('error stack: ' + err.stack);
});
