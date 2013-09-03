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

	// generate guids
	factory('guid', [function () {
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

		return guid;
	}]).
	//factory('editor', ['ot', '$location', function (ot, $rootScope, $location) {
	factory('editor', [
			'ot', '$rootScope', '$location', 'guid',
			function (ot, $rootScope, $location, guid) {
		var editor = {};

		editor.lines = [""];

		var docId;
		if ($location.path() === '' || $location.path() === '/') {
			docId = guid();
			$location.path(docId);
		} else {
			docId = $location.path().slice(1);
		}
		
		var textOt = ot.createText(docId);

		$rootScope.$watch(textOt.getSnapshot, function(newValue) {
			if (newValue) {
				editor.lines = newValue.split("\n");
			}
		});

		//if (editor.snapshot === '') {
			//editor.lines = [""];
		//} else {
			//if (editor.snapshot) {
				//editor.lines = editor.snapshot.split("\n");
			//}
		//}
		//editor.active = editor.lines.length - 1;

		editor.push = function () {
			textOt.snapshot = editor.lines.join("\n");
			textOt.send();
		};

		editor.newLine = function (nextLine) {
			editor.lines.splice(editor.active + 1, 0, nextLine);
			editor.activate(editor.active + 1);
			editor.push();
		}

		editor.removeLine = function (index) {
			if (editor.lines.length > 1) {
				editor.lines.splice(index, 1);
			}
		}

		editor.activate = function (lineNumber) {
			if (editor.active != lineNumber) {
				editor.active = lineNumber;
			}
		}

		return editor;
	}]).

  value('version', '0.1');
