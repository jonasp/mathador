'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('mathador.services', []).
	factory('peerjs', function() {
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
					console.log("sending data: " + data);
					conn.send(data);
				}
			}
		}

		peerjs.handleConnection = function (c) {
			c.on('data', function(d) {
				for (var i = 0; i < peerjs.dataCallbacks.length; i++) {
					console.log("function data:");
					console.log(d);
					peerjs.dataCallbacks[i](c, d);
				}
			});

			c.on('error', function(error) {
				peerjs.error(error.type);
			});

			c.on('open', function() {
				peerjs.peers[c.peer] = c;
				peerjs.changePeers(peerjs.peers);
			});

			c.on('close', function() {
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
	}).
  value('version', '0.1');
