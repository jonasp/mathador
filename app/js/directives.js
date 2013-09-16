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
	directive('mathdown', [function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {

				// create a hidden shadow copy of element[0] and append it to the dom.
				// this is needed so that the scroll position does not jump
				// around when the escaped content is processed with markdown and
				// set to the element.html and later possibly expanded by MathJax.
				var shadow = angular.element(element[0].cloneNode(true));
				shadow[0].style.display = "block";
				shadow[0].style.visibility = "hidden";
				shadow[0].style.height = 0;
				shadow[0].style.overflow = "hidden";
				shadow[0].style.padding = 0;
				shadow[0].style.margin = 0;
				shadow[0].style.border = "none";
				element[0].parentNode.appendChild(shadow[0]);

				MathJax.Hub.Register.MessageHook('End Process', function (message) {
					// after processing copy the shadow to the element
					element.html(shadow.html());
				});

				scope.$watch(attrs.ngModel, function (value, oldValue) {
					if (value === undefined) {
						element.html("");
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

					// delete mjx-eqn-* nodes from element
					// otherwise equation numbers are not set correctly in the shadow
					// removing all content in element would change the scroll position
					// and show scroll bars
					var allElements = element[0].getElementsByTagName("*");
					for (var i = 0; i < allElements.length; i++) {
						if (allElements[i].id.indexOf("mjx-eqn-") > -1) {
							allElements[i].remove();
						}
					}

					// render into shadow copy
					shadow.html(markdown);

					// MathJax.InputJax.TeX or resetEquationNumbers function
					// might not be available on initial run but equation number
					// does not need to be reset then
					if (MathJax.InputJax.TeX === undefined ||
							!angular.isDefined(MathJax.InputJax.TeX.resetEquationNumbers)) {
						MathJax.Hub.Queue(
							["Process", MathJax.Hub, shadow[0]]
						);
					} else {
						MathJax.Hub.Queue(
							["resetEquationNumbers",MathJax.InputJax.TeX],
							["Process", MathJax.Hub, shadow[0]]
						);
					}
				});
			}
		};
	}]);
