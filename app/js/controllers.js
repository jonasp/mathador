'use strict';

/* Controllers */

angular.module('mathador.controllers', []).
	controller('navCtrl', ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
		$scope.state = $state;
		$scope.params= $stateParams;
	}]);
