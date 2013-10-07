'use strict';

/* Directives */


angular.module('mathador.directives', []).
	directive("noBackspace", function() {
		return function(scope, elem, attr) {
			elem.bind('keydown', function(event) {
				var nodeName = event.target.nodeName.toLowerCase();
				if (event.keyCode === 8) {
					if ((nodeName === 'input' && event.target.type === 'text') ||
				       nodeName === 'textarea') {
						// do nothing
					} else {
						event.preventDefault();
					}
				}
			});
		};
	}).
	// the mathdown directive parses the provided model for markdown and
	// math content and transforms it into html nodes
	directive('mathdown', ['$timeout', function($timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				var swapVisible = function(view, shadow) {
					var temp = {
						display:    view[0].style.display,
						visibility: view[0].style.visibility,
						height:     view[0].style.height,
						overflow:   view[0].style.overflow,
						padding:    view[0].style.padding,
						margin:     view[0].style.margin,
						border:     view[0].style.border
					};

					view[0].style.display = shadow[0].style.display;
					view[0].style.visibility = shadow[0].style.visibility;
					view[0].style.height = shadow[0].style.height;
					view[0].style.overflow = shadow[0].style.overflow;
					view[0].style.padding = shadow[0].style.padding;
					view[0].style.margin = shadow[0].style.margin;
					view[0].style.border = shadow[0].style.border;

					shadow[0].style.display = temp.display;
					shadow[0].style.visibility = temp.visibility;
					shadow[0].style.height = temp.height;
					shadow[0].style.overflow = temp.overflow;
					shadow[0].style.padding = temp.padding;
					shadow[0].style.margin = temp.margin;
					shadow[0].style.border = temp.border;

				};

				var div = document.createElement("div");
				// crate a view where the markdown/mathjax html is displayed
				var view = angular.element(div);
				element[0].appendChild(view[0]);

				// create a hidden shadow copy of view and append it to the dom.
				// this is needed so that the scroll position does not jump
				// around when the escaped content is processed with markdown and
				// set to the element.html and later possibly expanded by MathJax.
				var shadow = angular.element(view[0].cloneNode(true));
				shadow[0].style.display = "block";
				shadow[0].style.visibility = "hidden";
				shadow[0].style.height = 0;
				shadow[0].style.overflow = "hidden";
				shadow[0].style.padding = 0;
				shadow[0].style.margin = 0;
				shadow[0].style.border = "none";
				element[0].appendChild(shadow[0]);

				var time = new Date().getTime();

				var counter = 0;
				var update;
				scope.$watch(attrs.ngModel, function (value, oldValue) {
					time = new Date().getTime();
					if (value === undefined) {
						view.html("");
						return;
					}
					// escape math with @@@(integer)@@@ entries and save the math content to a list.
					// Display block ($$) and inline ($) get their appropriate MathJax <script>
					// element added.
					// Also escape @@@ to \@\@\@
					var math = [];
					var escaped = value.replace(/@@@/g, "\\@\\@\\@")
						.replace(/\$\$([\s\S]*?)\$\$/g, function (match, eqn) {
						math.push("<script type='math/tex; mode=display'>" + eqn + "</script>");
						return "@@@" + (math.length - 1) + "@@@"
					})
						.replace(/\$([\s\S]*?)\$/g, function (match, eqn) {
						math.push("<script type='math/tex'>" + eqn + "</script>");
						return "@@@" + (math.length - 1) + "@@@"
					});

					// process markdown content and replace escaped math with content
					var markdown = marked(escaped)
						.replace(/@@@([\d]+?)@@@/g, function (match, n) { return  math[n]; })
						.replace(/\\@\\@\\@/g, "@@@");

					// delete mjx-eqn-* nodes from view
					// otherwise equation numbers are not set correctly in the shadow
					// removing all content in view would change the scroll position
					// and show scroll bars
					var allElements = view[0].getElementsByTagName("*");
					for (var i = 0; i < allElements.length; i++) {
						if (allElements[i].id.indexOf("mjx-eqn-") > -1) {
							allElements[i].remove();
						}
					}

					// render into shadow copy
					shadow.html(markdown);

					$timeout.cancel(update);
					update = $timeout(function () {
						// MathJax.InputJax.TeX or resetEquationNumbers function
						// might not be available on initial run but equation number
						// does not need to be reset then
						if (MathJax.InputJax.TeX === undefined ||
								!angular.isDefined(MathJax.InputJax.TeX.resetEquationNumbers)) {
							counter++;
							MathJax.Hub.Queue(
								["Process", MathJax.Hub, shadow[0]]
							);
						} else {
							counter++;
							MathJax.Hub.Queue(
								["resetEquationNumbers",MathJax.InputJax.TeX],
								["Process", MathJax.Hub, shadow[0]]
							);
						}
					}, 10, true);
				});

				MathJax.Hub.Register.MessageHook('End Process', function (message) {
					// after all processes finished replace shadow with view
					counter = (counter > 0) ? counter - 1 : 0;
					if (counter == 0) {
						swapVisible(view, shadow);
						var temp = view;
						view = shadow;
						shadow = temp;
					}
					console.log(new Date().getTime() - time);
				});
			}
		};
	}]);
