'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('mathador.services', []).
	factory('colorpool', function() {
		var cp = {
			default: "black",
			available: ["red", "green", "yellow", "blue"],
			// clients[id] -> colorInd
			clients: {}
		};

		cp.free = function () {
			var array = cp.available.slice(0);

			for (var key in cp.clients) {
				array.splice(array.indexOf(cp.available[cp.clients[key]]), 1);
			}
			return array;
		}

		cp.get = function (id) {
			if (typeof(cp.clients[id]) != 'undefined') {
				// registered, return color
				var color = cp.default;
				if (cp.clients[id] >= 0) {
					color = cp.available[cp.clients[id]];
				}
				return color
			}
			var free = cp.free();
			if (free.length === 0) {
				cp.clients[id] = -1;
				return cp.default;
			}
			var index = cp.available.indexOf(free[0]);
			cp.clients[id] = index;

			return cp.available[cp.clients[id]];
		}

		cp.release= function (id) {
			if (typeof(cp.clients[id]) != 'undefined') {
				delete cp.clients[id];
			}
		}
		
		return cp;
	}).

	factory('editor', ['$rootScope', function ($rootScope) {
		var editor = {};

		editor.lines = [""];

		var applyChange = function(doc, oldval, newval) {
			var commonEnd, commonStart;

			if (oldval === newval) {
				return;
			}
			commonStart = 0;
			while (oldval.charAt(commonStart) === newval.charAt(commonStart)) {
				commonStart++;
			}
			commonEnd = 0;
			while (oldval.charAt(oldval.length - 1 - commonEnd) === newval.charAt(newval.length - 1 - commonEnd) && commonEnd + commonStart < oldval.length && commonEnd + commonStart < newval.length) {
				commonEnd++;
			}
			if (oldval.length !== commonStart + commonEnd) {
				return doc.del(commonStart, oldval.length - commonStart - commonEnd);
			}
			if (newval.length !== commonStart + commonEnd) {
				return doc.insert(commonStart, newval.slice(commonStart, newval.length - commonEnd));
			}
		};

		sharejs.open('doc', 'text', function (error, doc) {
			editor.snapshot = doc.snapshot;
			if (editor.snapshot === '') {
				editor.lines = [""];
			} else {
				editor.lines = editor.snapshot.split("\n");
			}
			editor.active = editor.lines.length - 1;
			$rootScope.$apply();

			editor.push = function () {
				applyChange(doc, editor.snapshot, editor.lines.join("\n"));
				editor.snapshot = doc.snapshot;
			};

			editor.newLine = function (nextLine) {
				editor.lines.splice(editor.active + 1, 0, nextLine);
				editor.activate(editor.active + 1);
				editor.push();
			}

			doc.on('remoteop', function(op) {
				editor.lines = doc.snapshot.split("\n");
				$rootScope.$apply();
			});
		});

		editor.removeLine = function (index) {
			if (editor.lines.length > 1) {
				editor.lines.splice(index, 1);
			}
		}

		editor.activate = function (lineNumber) {
			if (editor.active != lineNumber) {
				editor.active = lineNumber;
			}
		}

		return editor;
	}]).

	factory('broadcast', ['colorpool', function(colorpool) {
		var broadcast = {
			peers: [],
			connection: "disconnected",
			connectionCallbacks: [],
			errorCallbacks: [],
			dataCallbacks: [],
			peersCallbacks: []
		};

		broadcast.init = function(id) {
			var host = '/';
			if (typeof(broadcast.socket) === 'undefined') {
				broadcast.socket = io.connect(host);
			} else if (!broadcast.socket.socket.connected) {
				broadcast.socket = io.connect(host, { 'force new connection': true });
			}
			broadcast.changeConnection("connecting");

			broadcast.socket.on('connect', function() {

				broadcast.socket.emit('get peers', function (peers) {
					for (var i in peers) {
						broadcast.peers[peers[i]] = {
							peer: peers[i],
							color: colorpool.get(peers[i])
						};
					}
					broadcast.changePeers(broadcast.peers);
				});

				broadcast.socket.emit('set id', id);

				broadcast.changeConnection("connected");

				broadcast.socket.on('disconnect', function () {
					broadcast.changeConnection("disconnected");
				});

				broadcast.socket.on('client connected', function (id) {
					broadcast.peers[id] = {
						peer: id,
						color: colorpool.get(id)
					};
					broadcast.changePeers(broadcast.peers);
				});

				broadcast.socket.on('broadcast', function(d) {
					for (var i = 0; i < broadcast.dataCallbacks.length; i++) {
						broadcast.dataCallbacks[i]({
							peer: d.id,
							color: colorpool.get(d.id)
						}, d.data);
					}
				});

				broadcast.socket.on('client disconnected', function (id) {
					delete broadcast.peers[id];
					broadcast.changePeers(broadcast.peers);
				});

			});

			broadcast.socket.on('error', function(error) {
				broadcast.changeConnection("disconnected");
				broadcast.error(error);
			});
		}

		broadcast.connect = function (id) {
			var dataConnection = broadcast.peer.connect(id);
			if (typeof(dataConnection) != 'undefined') {
				broadcast.handleConnection(dataConnection);
			}
		}

		broadcast.disconnect = function () {
			if (typeof(broadcast.socket) != 'undefined' && broadcast.socket.socket.connected) {
				broadcast.socket.disconnect();
				broadcast.changeConnection("disconnected");
			}
		}

		broadcast.send = function (data) {
			if (typeof(broadcast.socket) != 'undefined' && broadcast.socket.socket.connected) {
				broadcast.socket.emit('broadcast', data);
			}
		}

		broadcast.changeConnection = function (value) {
			for (var i = 0; i < broadcast.connectionCallbacks.length; i++) {
				broadcast.connectionCallbacks[i](value);
			}
			broadcast.connection = value;
		}

		broadcast.onConnectionChange = function(fn) {
			broadcast.connectionCallbacks.push(fn);
		};

		broadcast.onData = function (fn) {
			broadcast.dataCallbacks.push(fn);
		};

		broadcast.error = function (error) {
			for (var i = 0; i < broadcast.errorCallbacks.length; i++) {
				broadcast.errorCallbacks[i](error);
			}
		}

		broadcast.onError = function (fn) {
			broadcast.errorCallbacks.push(fn);
		};

		broadcast.changePeers = function (peers) {
			for (var i = 0; i < broadcast.peersCallbacks.length; i++) {
				broadcast.peersCallbacks[i](peers);
			}
		}

		broadcast.onPeersChange = function (fn) {
			broadcast.peersCallbacks.push(fn);
		}

		return broadcast;
	}]).
  value('version', '0.1');
