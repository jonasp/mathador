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

		peerjs.onData(function (conn, data) {
			console.log("onData");
			console.log(data);
			if (data.type = 'chat') {
				pushMessage(conn.peer + ': ' + data.value);
				$scope.$apply();
			}
		});

		$scope.send = function() {
			if (peerjs.connection === "connected" && $scope.chatinput != "") {
				peerjs.broadcast({
					type: 'chat',
					value: $scope.chatinput
				});
				pushMessage($scope.peerid + ': ' + $scope.chatinput);
				$scope.chatinput = "";
			}
		}

		function pushMessage(msg) {
			// TODO: put messages into ordered hash so they don't duplicate
			$scope.messages.push(msg);
			while ($scope.messages.length > 7) {
				$scope.messages.shift();
			}
		}
	}]).
	controller('PeerCtrl',['$scope', 'peerjs', function($scope, peerjs) {

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
					peer = peerjs.peer; //TODO delete
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
