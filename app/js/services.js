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

	factory('editor', ['$rootScope', function ($rootScope) {
		var editor = {};

		editor.lines = [""];

		var applyChange = function(doc, oldval, newval) {
			var commonEnd, commonStart;

			if (oldval === newval) {
				return;
			}
			commonStart = 0;
			while (oldval.charAt(commonStart) === newval.charAt(commonStart)) {
				commonStart++;
			}
			commonEnd = 0;
			while (oldval.charAt(oldval.length - 1 - commonEnd) === newval.charAt(newval.length - 1 - commonEnd) && commonEnd + commonStart < oldval.length && commonEnd + commonStart < newval.length) {
				commonEnd++;
			}
			if (oldval.length !== commonStart + commonEnd) {
				return doc.del(commonStart, oldval.length - commonStart - commonEnd);
			}
			if (newval.length !== commonStart + commonEnd) {
				return doc.insert(commonStart, newval.slice(commonStart, newval.length - commonEnd));
			}
		};

		sharejs.open('doc', 'text', function (error, doc) {
			editor.snapshot = doc.snapshot;
			if (editor.snapshot === '') {
				editor.lines = [""];
			} else {
				editor.lines = editor.snapshot.split("\n");
			}
			editor.active = editor.lines.length - 1;
			$rootScope.$apply();

			editor.push = function () {
				applyChange(doc, editor.snapshot, editor.lines.join("\n"));
				editor.snapshot = doc.snapshot;
			};

			editor.newLine = function (nextLine) {
				editor.lines.splice(editor.active + 1, 0, nextLine);
				editor.activate(editor.active + 1);
				editor.push();
			}

			doc.on('remoteop', function(op) {
				editor.lines = doc.snapshot.split("\n");
				$rootScope.$apply();
			});
		});

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
