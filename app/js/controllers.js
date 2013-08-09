'use strict';

/* Controllers */

angular.module('mathador.controllers', []).
	controller('MathadorCtrl',['$scope', 'broadcast', 'editor', function($scope, broadcast, editor) {

		$scope.lines = [""];

		$scope.lines = editor.lines;

		$scope.$watch( function () { return editor.lines }, function (data) {
			$scope.lines = data;
		}, true);

		$scope.$watch( function () { return editor.active }, function (data) {
			$scope.active = data;
		});

		$scope.activate = editor.activate;

		$scope.push = editor.push;

		$scope.keydown = function ($event, lineNumber) {
			if ($event.keyCode === 8) { // backspace
				if ($scope.lines[editor.active] === "" && $scope.lines.length > 1) {
					editor.removeLine(editor.active);
					editor.activate(editor.active-1);
					editor.push();
					$event.preventDefault();
				}
			}
			if ($event.keyCode === 13) { // enter
				if ($scope.lines[lineNumber] === "") {
					// empty - do nothing
				} else {
					var nextLine = "";
					if ($event.shiftKey) {
						nextLine = editor.lines[editor.active]
					}
					editor.newLine(nextLine);
				}
			}
		}
	}]).

	controller('PointerCtrl', ['$scope', 'broadcast', '$timeout', function($scope, broadcast, $timeout) {
		$scope.transmit = false;
		$scope.pointers = {};

		broadcast.onData(function (conn, data) {
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
				broadcast.send({
					app: 'pointer',
					type: 'click'
				});
			}
		}

		document.onmousemove = function (event) {
			if ($scope.transmit) {
				broadcast.send({
					app: 'pointer',
					type: 'move',
					pos: {x: event.x, y: event.y}
				});
			}
		};
	}]).

	controller('ChatCtrl', ['$scope', 'broadcast', function($scope, broadcast) {
		$scope.chatinput = "";
		$scope.messages = [{
			sender: "",
			color: "",
			message: "---"
		} ];

		broadcast.onData(function (conn, data) {
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
			if (broadcast.connection === "connected" && $scope.chatinput != "") {
				broadcast.send({
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

	controller('PeerCtrl',['$scope', 'broadcast', 'colorpool', function($scope, broadcast, colorpool) {

		var peer = {};
		$scope.peers = {};
		$scope.peerid="";
		$scope.connectionStatus = 'disconnected';

		broadcast.onConnectionChange(function(value) {
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

		broadcast.onError(function(error) {
			$scope.error = error;
			// TODO: find a nicer solution for this.
			// investigate where the error comes from.
			if ($scope.$root.$$phase != '$apply') {
				$scope.$apply();
			}
		});


		broadcast.onPeersChange(function(peers) {
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
			if (broadcast.connection === "disconnected") {
				if ($scope.peerid === "") {
					alert("enter name!");
				} else {
					$scope.error = "";
					broadcast.init($scope.peerid);
				}
			} else {
				broadcast.disconnect();
			}
		};

		$scope.add = function() {
			if (broadcast.connection === "connected" && $scope.friendid != "") {
				broadcast.connect($scope.friendid);
			}
		}
	}]);
