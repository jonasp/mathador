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
				}
			}
			if ($event.keyCode === 13) { // enter
				if ($scope.lines[lineNumber].content == "") {
					console.log("empty - do nothing");
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
	controller('PeerCtrl',['$scope', function($scope) {

		//var peer = new Peer('some-id', {host: 'localhost', port: 9000});
		
		$scope.peer = {};
		$scope.peers = [];
		$scope.peerid="";
		$scope.connectionStatus = "disconnected";

		$scope.$watch('connectionStatus', function(value) {
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
		});

		$scope.connect = function() {
			if ($scope.connectionStatus === "disconnected") {
				if ($scope.peerid === "") {
					alert("enter name!");
				} else {
					$scope.buttonMsg = "connecting";
					$scope.connectionStatus = "connecting";
					$scope.peer = new Peer($scope.peerid, { key: 'dn4z2c42g7o561or', debug: true });

					$scope.peer.on('open', function(id) {
						$scope.connectionStatus = "connected";
						$scope.$apply();
					});
				}
			} else {
				$scope.connectionStatus = "disconnected";
				$scope.peer.destroy();
			}
		};

		$scope.add = function() {
			console.log($scope.connectionStatus);
			console.log($scope.friendid);
			if ($scope.connectionStatus === "connected" && $scope.friendid != "") {
				console.log($scope.peer.connect($scope.friendid));
				$scope.peer.on('error', function(error) {
					alert(error);
				});
			}
		}


	}]);
