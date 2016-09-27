app.controller("CalendarController", [ '$scope', '$window', '$rootScope', '$element', '$state', '$q', 'APPServices', function($scope, $window, $rootScope, $element, $state, $q, APPServices) {
	
	var getMyCalendarTasks = function(start, end) {
		var defer = $q.defer();
		APPServices.getMyCalendarTasks({ start_date: start.format('YYYY-MM-DD 00:00:00'), end_date: end.format('YYYY-MM-DD 00:00:00')}).then(function(response) {
			var eventsList = [];
			var data = response.data;
			for (var index = 0; index < data.length; index++) {
				var eData = data[index];
				eventsList.push({
					id: eData.id,
					lead_id: eData.lead_id,
					opportunity_id: eData.opportunity_id,
					title: eData.title,
					start: eData.start_date || eData.due_date
				});
			}
			
			defer.resolve(eventsList);
		}, defer.reject);
		return defer.promise;
	};
	
	var initOptions = function() {
		$scope.calendarOptions = {
			events: function(start, end, timezone, callback) {
				getMyCalendarTasks(start, end).then(function(events) {
					callback(events);
				})
		    }, eventClick: function(calEvent, jsEvent, view) {
		       $state.go('home.task.detail', { record_id: calEvent.id });
		    }
		};
	};
	
	/**
	 * initializes the controller
	 */
	var init = function() {
		$scope.filter = {};
		$scope.config = {};
		$scope.setLeftMenu([]);
		initOptions();
	};

	var local = {};
	init();
	
} ]);