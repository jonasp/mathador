'use strict';

/* Controllers */

angular.module('mathador.controllers', []).
	controller('MathadorCtrl',[ '$scope', '$location', 'docId',
		function($scope, $location, docId) {
			$scope.aceLoaded = function (editor) {
				sharejs.open(docId, 'text', function (error, doc) {
					doc.attach_ace(editor);
				});
			};
		}
	]);
