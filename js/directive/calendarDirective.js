angular.module('app').directive('calendar', ['$timeout', function($timeout) {
	
	var linkFn = function(scope, element, attrs) {
		
		var getDefaultOptions = function() {
			
			var defaultOptions = {
				header: {
					left: 'prev,next today',
					center: 'title',
					right: 'month,basicWeek,basicDay'
				},
				defaultDate: new Date(),
				navLinks: true, // can click day/week names to navigate views
				editable: true,
				eventLimit: true, // allow "more" link when too many events
				events: function(start, end, timezone, callback) {
					callback([]);
			    }, eventClick: function(calEvent, jsEvent, view) {
			        console.log(calEvent);
			    }
			};
			
			return defaultOptions;
		};		
		
		var initCalendar = function() {
			
			var options = angular.extend(getDefaultOptions(), scope.options);
			element.fullCalendar(options);
		};
		
		var init = function() {
			initCalendar();
		};
		init();
	};
	
	return {
		restrict: 'A',
		link: linkFn,
		scope: {
			options: "=calendar"
		}
	}
}]);