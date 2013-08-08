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
			if (typeof(this.peer) != 'undefined' && !this.peer.destroyed) {
				this.peer.destory();
			}
			this.changeConnection("connecting");
			this.peer = new Peer(id, { key: '46505tj9a6zp8pvi'});

			this.peer.on('open', function(id) {
				broadcast.changeConnection("connected");
			});

			this.peer.on('error', function(error) {
				broadcast.changeConnection("disconnected");
				broadcast.error(error.type);
			});

			this.peer.on('connection', function(connection, meta) {
				broadcast.handleConnection(connection);
			});
		}

		broadcast.connect = function (id) {
			var dataConnection = broadcast.peer.connect(id);
			if (typeof(dataConnection) != 'undefined') {
				this.handleConnection(dataConnection);	
			}
		}

		broadcast.disconnect = function () {
			if (typeof(this.peer) != 'undefined' && !this.peer.destroyed) {
				this.peer.destroy();
				this.changeConnection("disconnected");
			}
		}

		broadcast.send = function (data) {
			for (var i in this.peers) {
				var conn = this.peers[i];
				if (conn.open) {
					conn.send(data);
				}
			}
		}

		broadcast.handleConnection = function (c) {
			c.on('data', function(d) {
				for (var i = 0; i < broadcast.dataCallbacks.length; i++) {
					broadcast.dataCallbacks[i](c, d);
				}
			});

			c.on('error', function(error) {
				broadcast.error(error.type);
			});

			c.on('open', function() {
				c.color = colorpool.get(c.peer);
				broadcast.peers[c.peer] = c;
				broadcast.changePeers(broadcast.peers);
			});

			c.on('close', function() {
				colorpool.release(c.peer);
				broadcast.peers[c.peer] = {};
				broadcast.changePeers(broadcast.peers);
			});
		}

		broadcast.changeConnection = function (value) {
			for (var i = 0; i < this.connectionCallbacks.length; i++) {
				this.connectionCallbacks[i](value);
			}
			this.connection = value;
		}

		broadcast.onConnectionChange = function(fn) {
			this.connectionCallbacks.push(fn);
		};

		broadcast.onData = function (fn) {
			this.dataCallbacks.push(fn);
		};

		broadcast.error = function (error) {
			for (var i = 0; i < this.errorCallbacks.length; i++) {
				this.errorCallbacks[i](error);
			}
		}

		broadcast.onError = function (fn) {
			this.errorCallbacks.push(fn);
		};

		broadcast.changePeers = function (peers) {
			for (var i = 0; i < this.peersCallbacks.length; i++) {
				this.peersCallbacks[i](peers);
			}
		}

		broadcast.onPeersChange = function (fn) {
			this.peersCallbacks.push(fn);
		}

		return broadcast;
	}]).
  value('version', '0.1');
