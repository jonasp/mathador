'use strict';

/* Directives */


angular.module('mathador.directives', []).
	directive("ngMathjax", function() {
		return {
			restrict: "A",
			controller: ["$scope", "$element", "$attrs",
				function($scope, $element, $attrs) {
					$scope.$watch($attrs.ngMathjax, function(value) {
					var $script = angular.element("<script type='math/tex'>")
						.html(value == undefined ? "" : value);
					$element.html("");
					$element.append($script);
					MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $element[0]]);
				});
			}]
		};
	}).
	directive('ngResize', function() {
		return {
			restrict: 'A',
			controller: ["$scope", "$element", "$attrs",
				function($scope, $element, $attrs) {
					$scope.$watch($attrs.ngResize, function(value) {
						var size = parseFloat(value)/5;
						$element.css('font-size', size+'em');
						MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $element[0]]);
					});
				}
			]
		}
	}).
	directive('focus', ['$timeout', function($timeout) {
		return function(scope, elem, attr) {
			attr.$observe('focus', function (newValue) {
				$timeout(function () {newValue && elem[0].focus();});
			});
		};
	}]);
