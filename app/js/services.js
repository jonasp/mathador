'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('mathador.services', []).
	factory('colorpool', function() {
		var cp = {
			default: "black",
			available: ["red", "green", "yellow", "blue"],
			// clients[id] -> colorInd
			clients: {}
		};

		cp.free = function () {
			var array = cp.available.slice(0);

			for (var key in cp.clients) {
				array.splice(array.indexOf(cp.available[cp.clients[key]]), 1);
			}
			return array;
		}

		cp.get = function (id) {
			if (typeof(cp.clients[id]) != 'undefined') {
				// registered, return color
				var color = cp.default;
				if (cp.clients[id] >= 0) {
					color = cp.available[cp.clients[id]];
				}
				return color
			}
			var free = cp.free();
			if (free.length === 0) {
				cp.clients[id] = -1;
				return cp.default;
			}
			var index = cp.available.indexOf(free[0]);
			cp.clients[id] = index;

			return cp.available[cp.clients[id]];
		}

		cp.release= function (id) {
			if (typeof(cp.clients[id]) != 'undefined') {
				delete cp.clients[id];
			}
		}
		
		return cp;
	}).
	factory('sharejs', function() {
		var docs = {};
		return function (id, callback) {
			if (docs.id !== undefined) {
				callback(null, docs.id);
			} else {
				sharejs.open(id, 'text', function (error, doc) {
					docs.id = doc;
					callback(error, doc);
				});
			}
		};
	}).
	value('version', '0.1');
