var connect = require('connect');

var app = connect().use(connect.static('app'))
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);

var peers = {};

io.sockets.on('connection', function (socket) {
	socket.on('set id', function (id) {
		socket.set('id', id, function() {
			socket.broadcast.emit('client connected', id);
			peers[id] = socket;
		});
	});

	socket.on('disconnect', function () {
		socket.get('id', function (err, id) {
			socket.broadcast.emit('client disconnected', id);
			delete peers[id];
		});
	});

	socket.on('get peers', function (fn) {
		var keys = Object.keys(peers);
		fn(keys);
	});

	socket.on('broadcast', function(msg) {
		socket.get('id', function (err, id) {
			socket.broadcast.emit('broadcast', {
				id: id,
				data: msg
			});
		});
	});
});
