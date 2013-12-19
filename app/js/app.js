'use strict';


// Declare app level module which depends on filters, and services
angular.module('mathador', [
		'ui.ace',
		'ui.router',
		'mathador.filters',
		'mathador.services',
		'mathador.directives',
		'mathador.controllers'
	])
	.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
		// generate guids
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}

		var guid = function () {
			//return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				//s4() + '-' + s4() + s4() + s4();
			return s4() + s4();
		};

		$urlRouterProvider.otherwise("/" + guid());
		$urlRouterProvider.when("/", "/" + guid());
		$urlRouterProvider.when("/edit", "/edit/" + guid());
		$urlRouterProvider.when("/edit/", "/edit/" + guid());
		$urlRouterProvider.when("/view", "/view/" + guid());
		$urlRouterProvider.when("/view/", "/view/" + guid());

		var aceController = ['$scope', '$stateParams', 'sharejs', function($scope, $stateParams, sharejs) {
			$scope.aceLoaded = function (editor) {
				sharejs($stateParams.docId, function (error, doc) {
					$scope.content = doc.snapshot;
					doc.attach_ace(editor);
				});
			};
		}];

		$stateProvider
			.state("view", {
				url: "/view/:docId",
				templateUrl: "partials/view.html",
				controller: ['$scope', '$stateParams', 'sharejs', function($scope, $stateParams, sharejs) {
					sharejs($stateParams.docId, function (error, doc) {
						$scope.content = doc.snapshot;
						if(!$scope.$$phase) {
							$scope.$apply();
						}
						doc.on('change', function(op) {
							$scope.content = doc.snapshot;
							if(!$scope.$$phase) {
								$scope.$apply();
							}
						});
					});
				}]
			})
			.state("edit", {
				url: "/edit/:docId",
				templateUrl: "partials/edit.html",
				controller: aceController
			})
			.state("edit_view", {
				url: "/:docId",
				templateUrl: "partials/edit_view.html",
				controller: aceController
			});
	}]);
