'use strict';

/* Controllers */

angular.module('mathador.controllers', []).
	controller('MathadorCtrl',['$scope', 'editor', '$location', function($scope, editor, $location) {
		// $location.url() - $location.path()
		var paramsString = $location.url().split($location.path())[1];

		var params = {}
		if (paramsString && paramsString.length > 0 && paramsString.indexOf('?') == 0) {
			paramsString = paramsString.slice(1);
			var paramsList = paramsString.split('&');
			for (var i = 0; i < paramsList.length; i++) {
				var split = paramsList[i].split('=');
				if (split.length == 2) {
					params[split[0]] = split[1];
				}
			}
		}

		$scope.export = params.export;

		$scope.$watch( function () { return editor.lines }, function (data) {
			$scope.lines = data;
		}, true);

		$scope.$watch( function () { return editor.active }, function (data) {
			$scope.active = data;
		});

		$scope.activate = editor.activate;

		$scope.push = function (i, newval) {
			if (typeof(editor.push) == 'function') {
				editor.lines[i] = newval;
				editor.push();
			}
		};

		$scope.keydown = function ($event, lineNumber) {
			if ($event.keyCode === 38) { // up
				if (editor.active > 0) {
					editor.activate(editor.active-1);
				}
			}
			if ($event.keyCode === 40) { // down
				if (editor.active < editor.lines.length-1) {
					editor.activate(editor.active+1);
				}
			}

			if ($event.keyCode === 8) { // backspace
				if ($scope.lines[editor.active] === "" && $scope.lines.length > 1) {
					editor.removeLine(editor.active);
					if (editor.active > 0) {
						editor.activate(editor.active-1);
					}
					if (typeof(editor.push) == 'function') {
						editor.push();
					}
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
					if (typeof(editor.newLine) == 'function') {
						editor.newLine(nextLine);
					}
				}
			}
		};
	}]);
