app.controller("UserCallLogController", [ '$scope', '$window', '$rootScope', '$state', 'APPServices', function($scope, $window, $rootScope, $state, APPServices) {
	
	var getAllUserCallLogs = function() {
		if (!$scope.filter.user_id) return;
		$scope.config.loading = true;
		$scope.callLogsList = [];
		APPServices.getAllUserCallLogs($scope.filter).then(function(response) {
			$scope.callLogsList = response.data;
		}).finally(function() {
			$scope.config.loading = false;
		});
	};
	
	$scope.searchUserCallLog = function() {
		getAllUserCallLogs();
	};
	
	$scope.resetSearch = function() {
		$scope.filter = {};
		getAllUserCallLogs();
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.filter = {};
		getAllUserCallLogs();
	};

	var local = {};
	init();
	
} ]);