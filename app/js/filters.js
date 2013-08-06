'use strict';

/* Filters */

angular.module('mathador.filters', []).
	filter('mathjax', ['version', function(version) {
		return function(text) {
			if (text === undefined) {
				return ""
			}
			return String(text)
		}
	}]);
