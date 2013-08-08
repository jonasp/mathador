'use strict';

/* Controllers */

angular.module('mathador.controllers', []).
	controller('MathadorCtrl',['$scope', 'peerjs', function($scope, peerjs) {

		$scope.lines = [
			{ number: 0, content: "" }
		];

		$scope.active = 0;

		function removeLine(lines, index) {
			if ($scope.lines.length > 1) {
				lines.splice(index, 1);
				for (var i = 0; i < lines.length; i++) {
					lines[i].number = i;
				}
			}
		}

		peerjs.onData(function (conn, data) {
			if (data.app === 'tex') {
				if (data.type === 'activation') {
					// incoming has more lines than us
					for (var i = $scope.lines.length; data.lineNumber >= $scope.lines.length; i++) {
						$scope.lines.push({ number: i, content: ""});
					}
					$scope.$apply();
					console.log(conn.peer + ' activated line ' + data.lineNumber);
				}

				if (data.type === 'update') {
					$scope.lines[data.lineNumber].content = data.content;
					$scope.$apply();
				}
			}
		});

		$scope.activate = function(lineNumber) {
			if ($scope.active != lineNumber) {
				if ($scope.lines[$scope.active].content === "") {
					removeLine($scope.lines, $scope.active);
				}
				$scope.active = lineNumber;
				peerjs.broadcast({
					app: 'tex',
					type: 'activation',
					lineNumber: $scope.active
				});
			}
		}

		$scope.keydown = function ($event, lineNumber) {
			if ($event.keyCode === 8) { // backspace
				if ($scope.lines[$scope.active].content === "" && $scope.lines.length > 1) {
					$scope.activate($scope.active-1);
					$event.preventDefault();
				}
			}
			if ($event.keyCode === 13) { // enter
				if ($scope.lines[lineNumber].content == "") {
					// empty - do nothing
				} else {
					var nextLine = "";
					if ($event.shiftKey) {
						nextLine = $scope.lines[$scope.active].content
					}

					$scope.lines.push({
						number: $scope.lines.length,
						content: nextLine
					})
					$scope.active++;
					peerjs.broadcast({
						app: 'tex',
						type: 'activation',
						lineNumber: $scope.active
					});
				}
			}
		}

		$scope.keyup = function ($event, lineNumber) {
			if ($event.keyCode != 13) {
				peerjs.broadcast({
					app: 'tex',
					type: 'update',
					lineNumber: $scope.active,
					content: $scope.lines[$scope.active].content
				});
			}
		}
	}]).

	controller('PointerCtrl', ['$scope', 'peerjs', '$timeout', function($scope, peerjs, $timeout) {
		$scope.transmit = false;
		$scope.pointers = {};

		//$scope.pointers["test"] = { x: 100, y: 100, color: "black" };

		peerjs.onData(function (conn, data) {
			if (data.app === 'pointer') {
				if (data.type === 'move') {
					$scope.pointers[conn.peer] = {
						x: data.pos.x,
						y: data.pos.y,
						color: conn.color
					};
				}
				if (data.type === 'click') {
					$timeout(function () {
						$scope.pointers[conn.peer].preclicking = true;
					});
					$timeout(function () {
						$scope.pointers[conn.peer].clicking = "clicking";
					}, 20);
					$timeout(function () {
						$scope.pointers[conn.peer].clicking = "";
						$scope.pointers[conn.peer].preclicking = false
					}, 2000);
				}
			}
			$scope.$apply();
		});

		document.onmousedown = function (event) {
			if ($scope.transmit) {
				peerjs.broadcast({
					app: 'pointer',
					type: 'click'
				});
			}
		}

		document.onmousemove = function (event) {
			if ($scope.transmit) {
				peerjs.broadcast({
					app: 'pointer',
					type: 'move',
					pos: {x: event.x, y: event.y}
				});
			}
		};
	}]).

	controller('ChatCtrl', ['$scope', 'peerjs', function($scope, peerjs) {
		$scope.chatinput = "";
		$scope.messages = [{
			sender: "",
			color: "",
			message: "---"
		} ];

		peerjs.onData(function (conn, data) {
			if (data.app === 'chat') {
				pushMessage({
					sender: conn.peer,
					color: conn.color,
					message: data.value
				});
				$scope.$apply();
			}
		});

		$scope.send = function() {
			if (peerjs.connection === "connected" && $scope.chatinput != "") {
				peerjs.broadcast({
					app: 'chat',
					value: $scope.chatinput
				});
				pushMessage({
					sender: $scope.peerid,
					color: "black",
					message: $scope.chatinput
				});
				$scope.chatinput = "";
			}
		}

		function pushMessage(msg) {
			$scope.messages.push(msg);
			while ($scope.messages.length > 7) {
				$scope.messages.shift();
			}
		}
	}]).

	controller('PeerCtrl',['$scope', 'peerjs', 'colorpool', function($scope, peerjs, colorpool) {

		var peer = {};
		$scope.peers = {};
		$scope.peerid="";
		$scope.connectionStatus = 'disconnected';

		peerjs.onConnectionChange(function(value) {
			$scope.connectionStatus = value;
			switch (value) {
				case "disconnected": 
					$scope.buttonMsg = "go online";
					break;
				case "connecting":
					$scope.buttonMsg = "connecting";
					break;
				case "connected":
					$scope.buttonMsg = "go offline";
					break;
			}
			// TODO: find a nicer solution for this.
			// investigate where the error comes from.
			if ($scope.$root.$$phase != '$apply') {
				$scope.$apply();
			}
		});

		peerjs.onError(function(error) {
			$scope.error = error;
			// TODO: find a nicer solution for this.
			// investigate where the error comes from.
			if ($scope.$root.$$phase != '$apply') {
				$scope.$apply();
			}
		});


		peerjs.onPeersChange(function(peers) {
			$scope.peers = {};
			for (var i in peers) {
				$scope.peers[i] = peers[i];
			}
			// TODO: find a nicer solution for this.
			// client initiating the closing doesn't need to apply but the peer does.
			if ($scope.$root.$$phase != '$apply') {
				$scope.$apply();
			}
		});

		$scope.connect = function() {
			if (peerjs.connection === "disconnected") {
				if ($scope.peerid === "") {
					alert("enter name!");
				} else {
					$scope.error = "";
					peerjs.init($scope.peerid);
				}
			} else {
				peerjs.disconnect();
			}
		};

		$scope.add = function() {
			if (peerjs.connection === "connected" && $scope.friendid != "") {
				peerjs.connect($scope.friendid);
			}
		}
	}]);
