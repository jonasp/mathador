'use strict';

/* Controllers */

angular.module('mathador.controllers', []).
	controller('MathadorCtrl',[ '$scope', '$location', 'docId',
		function($scope, $location, docId) {
			$scope.docId = docId;

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
		}
	]);
