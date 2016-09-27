app.controller("CreateTaskController", [ '$scope', '$window', '$rootScope', '$state', '$stateParams', 'APPServices', function($scope, $window, $rootScope, $state, $stateParams, APPServices) {
	
	$scope.createTask = function() {
		var serviceData = angular.copy($scope.task);
		serviceData.status = "Created";
		if ($state.includes("home.leads")) {
			serviceData.lead_id = $stateParams.record_id;
		} else {
			serviceData.opportunity_id = $stateParams.record_id;
		}
		APPServices.createLeadTask(serviceData).then(function(response) {
			$scope.closeModalDialog();
		});
	};
	
	var init = function() {
		if (!$scope.task) $scope.task = {};
	};

	var local = {};
	init();
	
} ]);