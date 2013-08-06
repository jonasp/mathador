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
		
		$scope.peers = [];
		$scope.peerid = ""

		var peer = new Peer({ key: 'dn4z2c42g7o561or', debug: true });

		peer.on('open', function(id) {
			$scope.peerid = id;
			$scope.$apply();
		})
	}]);
