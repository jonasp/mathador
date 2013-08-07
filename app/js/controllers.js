'use strict';

/* Controllers */

angular.module('mathador.controllers', []).
	controller('MathadorCtrl',['$scope', function($scope) {

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

		$scope.activate = function(lineNumber) {
			if ($scope.active != lineNumber) {
				if ($scope.lines[$scope.active].content === "") {
					removeLine($scope.lines, $scope.active);
				}
				$scope.active = lineNumber;
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
				}
			}
		}
	}]).
	controller('ChatCtrl', ['$scope', 'peerjs', function($scope, peerjs) {
		$scope.chatinput = "";
		$scope.messages = ["---"];
	}]).
	controller('PeerCtrl',['$scope', 'peerjs', function($scope, peerjs) {

		var peer = {};
		$scope.peers = {};
		$scope.peerid="";

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
			if ($scope.$root.$$phase != '$apply') {
				$scope.$apply();
			}
		});

		peerjs.onError(function(error) {
			$scope.error = error;
			$scope.$apply();
		});

		peerjs.onPeersChange(function(peers) {
			$scope.peers = peers;
		});

		$scope.connect = function() {
			if (peerjs.connection === "disconnected") {
				if ($scope.peerid === "") {
					alert("enter name!");
				} else {
					$scope.error = "";
					peerjs.init($scope.peerid);
					peer = peerjs.peer;

					peer.on('connection', function(connection, meta) {
						handleConnection(connection);
					});
				}
			} else {
				peerjs.disconnect();
			}
		};

		$scope.add = function() {
			if (peerjs.connection === "connected" && $scope.friendid != "") {
				var dataConnection = peer.connect($scope.friendid);
				handleConnection(dataConnection);	
			}
		}

		$scope.send = function() {
			if (peerjs.connection === "connected" && $scope.chatinput != "") {
				broadcast({
					type: 'chat',
					value: $scope.chatinput
				});
				pushMessage($scope.peerid + ': ' + $scope.chatinput);
				$scope.chatinput = "";
			}
		}



		function broadcast(data) {
			for (var i in $scope.peers) {
				var conn = $scope.peers[i];
				if (conn.open) {
					conn.send(data);
				}
			}
		}

		function pushMessage(msg) {
			$scope.messages.push(msg);
			while ($scope.messages.length > 7) {
				$scope.messages.shift();
			}
		}
	}]);
