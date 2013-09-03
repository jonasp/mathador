var pjson = require('../package.json');

var http = require('http'),
		sockjs = require('sockjs'),
		express = require('express');

var ot = require('ot');

console.log("Mathador v " + pjson.version);
console.log("OT v " + ot.version);

var host = "0.0.0.0";
var port = 8080;


// generate guids
function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
}

function guid() {
	//return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	//s4() + '-' + s4() + s4() + s4();
	return s4() + s4();
};

var clients = {};

function broadcast(broadcaster, channel, message) {
	for (var key in clients) {
		if (clients[key].listen.indexOf(channel) >= 0 && key !== broadcaster) {
			clients[key].conn.write(message);
		}
	}
}

var docs = {};
function handleOt(id, parent, operation, conn) {
	if (typeof docs[id] == 'undefined') {
		docs[id] = ot.createText();
	}

	try {
		var result = docs[id].applyToMaster(operation, parent);
		result.t = 'ot';

		// broadcast operation
		broadcast(conn.id, id, JSON.stringify(result));
	} catch (e) {
		console.log("could not unpack changes \"" + operation + "\": " + e);
	}
}

function handleGetDoc(id, conn) {
	if (typeof docs[id] === 'undefined') {
		docs[id] = ot.createText();
	}
	var doc = {
		history: docs[id].history,
		head: docs[id].head
	};
	conn.write(JSON.stringify({
		t: 'doc',
		i: id,
		d: doc
	}));
}

var otServer = sockjs.createServer();
otServer.on('connection', function (conn) {

	clients[conn.id] = {
		conn: conn,
		listen: []
	};

	conn.on('data', function (message) {
		try {
			// got new operation
			var parsed = JSON.parse(message);
			if (typeof parsed.i === 'undefined') {
				throw "no doc id provided";
			}
			switch (parsed.t) { // message type
				case 'ot':
					handleOt(parsed.i, parsed.p, parsed.o, conn);
					break;
				case 'getDoc':
					clients[conn.id].listen.push(parsed.i);
					handleGetDoc(parsed.i, conn);
					break;
				default:
					console.log("invalid message type: " + parsed.t);
			}
		} catch (e) {
			console.log("could not parse message object \"" + message + "\": " + e);
		}
	});
	conn.on('close', function () {
		delete clients[conn.id];
	});
});

var app = express();
var server = http.createServer(app);

otServer.installHandlers(server, {prefix:'/ot'});

// Attach sharejs REST and Websocket interfaces to server and start
server.listen(port, host);
console.log("running at http://"+ host + ":" + port);

app.use(express.static('app'));

process.title = 'mathador';
process.on('uncaugtException', function (err) {
	console.error('An error has occurred. Please contact the system administrator.');
	console.error('Mathador Version ' + mathador.version);
	console.error('ShareJS Version ' + sharejs.version);
	console.error('error stack: ' + err.stack);
});
