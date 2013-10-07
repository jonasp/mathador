'use strict';

/* Controllers */

angular.module('mathador.controllers', []).
	controller('ViewCtrl', ['$scope', 'docId',
		function($scope, docId) {
			sharejs.open(docId, 'text', function (error, doc) {
				$scope.$apply(function () {
					$scope.content = doc.snapshot;
				});
				doc.on('change', function(op) {
					$scope.$apply(function () {
						$scope.content = doc.snapshot;
					});
				});
			});
		}]).
	controller('MathadorCtrl',['$scope', 'docId',
		function($scope, docId) {
			$scope.aceLoaded = function (editor) {
				sharejs.open(docId, 'text', function (error, doc) {
					doc.attach_ace(editor);
				});
			};
		}
	]);
