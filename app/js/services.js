'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('mathador.services', []).
	factory('colorpool', function() {
		var colorpool = {
			available: ["red", "green", "yellow", "blue"],
			// clients[id] -> colorInd
			clients: {}
		};

		colorpool.free = function () {
			var array = this.available.slice(0); 
			for (var i in this.clients) {
				array.splice(this.clients[i], 1);	
			}
			return array;
		}

		colorpool.get= function (id) {
			if (typeof(this.clients[id]) != 'undefined') {
				// registered, return color
				return this.available[this.clients[id]];
			}
			var free = this.free();
			if (free.length === 0) {
				return false
			}
			var index = this.available.indexOf(free[0]);
			this.clients[id] = index;

			return this.available[this.clients[id]];
		}

		colorpool.release= function (id) {
			if (typeof(this.clients[id]) != 'undefined') {
				delete this.clients[id];
			}
		}
		
		return colorpool;
	}).
	factory('peerjs', ['colorpool', function(colorpool) {
		var peerjs = {
			peers: [],
			connection: "disconnected",
			connectionCallbacks: [],
			errorCallbacks: [],
			dataCallbacks: [],
			peersCallbacks: []
		};

		peerjs.init = function(id) {
			if (typeof(this.peer) != 'undefined' && !this.peer.destroyed) {
				this.peer.destory();
			}
			this.changeConnection("connecting");
			this.peer = new Peer(id, { key: '46505tj9a6zp8pvi'});

			this.peer.on('open', function(id) {
				peerjs.changeConnection("connected");
			});

			this.peer.on('error', function(error) {
				peerjs.changeConnection("disconnected");
				peerjs.error(error.type);
			});

			this.peer.on('connection', function(connection, meta) {
				peerjs.handleConnection(connection);
			});
		}

		peerjs.connect = function (id) {
			var dataConnection = peerjs.peer.connect(id);
			if (typeof(dataConnection) != 'undefined') {
				this.handleConnection(dataConnection);	
			}
		}

		peerjs.disconnect = function () {
			if (typeof(this.peer) != 'undefined' && !this.peer.destroyed) {
				this.peer.destroy();
				this.changeConnection("disconnected");
			}
		}

		peerjs.broadcast = function (data) {
			for (var i in this.peers) {
				var conn = this.peers[i];
				if (conn.open) {
					conn.send(data);
				}
			}
		}

		peerjs.handleConnection = function (c) {
			c.on('data', function(d) {
				for (var i = 0; i < peerjs.dataCallbacks.length; i++) {
					peerjs.dataCallbacks[i](c, d);
				}
			});

			c.on('error', function(error) {
				peerjs.error(error.type);
			});

			c.on('open', function() {
				c.color = colorpool.get(c.peer);
				peerjs.peers[c.peer] = c;
				peerjs.changePeers(peerjs.peers);
			});

			c.on('close', function() {
				colorpool.release(c.peer);
				peerjs.peers[c.peer] = {};
				peerjs.changePeers(peerjs.peers);
			});
		}

		peerjs.changeConnection = function (value) {
			for (var i = 0; i < this.connectionCallbacks.length; i++) {
				this.connectionCallbacks[i](value);
			}
			this.connection = value;
		}

		peerjs.onConnectionChange = function(fn) {
			this.connectionCallbacks.push(fn);
		};

		peerjs.onData = function (fn) {
			this.dataCallbacks.push(fn);
		};

		peerjs.error = function (error) {
			for (var i = 0; i < this.errorCallbacks.length; i++) {
				this.errorCallbacks[i](error);
			}
		}

		peerjs.onError = function (fn) {
			this.errorCallbacks.push(fn);
		};

		peerjs.changePeers = function (peers) {
			for (var i = 0; i < this.peersCallbacks.length; i++) {
				this.peersCallbacks[i](peers);
			}
		}

		peerjs.onPeersChange = function (fn) {
			this.peersCallbacks.push(fn);
		}

		return peerjs;
	}]).
  value('version', '0.1');
