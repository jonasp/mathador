'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('mathador.services', []).
	factory('peerjs', function() {
		var peerjs = {
			connection: "disconnected",
			connectionCallbacks: [],
			errorCallbacks: [],
			peersCallbacks: []
		};

		peerjs.init = function(id) {
			if (typeof(this.peer) != 'undefined' && !this.peer.destroyed) {
				this.peer.destory();
			}
			this.changeConnection("connecting");
			this.peer = new Peer(id, { key: '46505tj9a6zp8pvi', debug: 'true'});

			this.peer.on('open', function(id) {
				peerjs.changeConnection("connected");
			});

			this.peer.on('error', function(error) {
				peerjs.changeConnection("disconnected");
				peerjs.error(error.type);
			});
		}

		peerjs.disconnect = function () {
			if (typeof(this.peer) != 'undefined' && !this.peer.destroyed) {
				this.peer.destroy();
				this.changeConnection("disconnected");
			}
		}

		function handleConnection(c) {
			c.on('data', function(data) {
				if (data.type = 'chat') {
					pushMessage(c.peer + ': ' + data.value);
					$scope.$apply();
				}
			});

			c.on('error', function(error) {
				$scope.error = error.type;
				//$scope.$apply();
			});

			c.on('open', function() {
				$scope.peers[c.peer] = c;
				//$scope.$apply();
			});

			c.on('close', function() {
				$scope.peers[c.peer] = {};
				// TODO: find a nicer solution for this.
				// client initiating the closing doesn't need to apply but the peer does.
				if ($scope.$root.$$phase != '$apply') {
					$scope.$apply();
				}
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
