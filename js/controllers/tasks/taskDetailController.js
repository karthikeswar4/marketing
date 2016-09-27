app.controller("TaskDetailController", [ '$scope', '$window', '$rootScope', '$element', '$stateParams', 'Utils', 'APPServices', function($scope, $window, $rootScope, $element, $stateParams, Utils, APPServices) {
	
	var initLeftMenu = function() {
		
		var leftMenus = [{
			name: 'Search Tasks',
			state: 'home.task'
		}];
		
		$scope.setLeftMenu(leftMenus);
	};
	
	var retrieveLeadTask = function(taskId) {
		if (!taskId) return;
		APPServices.retrieveTask({ record_id: taskId }).then(function(response) {
			$scope.data = response.data;
			retrieveAllLeadTasks($scope.data.lead_id, $scope.data.opportunity_id);
		});
	};

	var retrieveAllLeadTasks = function(leadId, opportunityId) {
		APPServices.getAllLeadOpportunityTasks({ lead_id: leadId, opportunity_id: opportunityId }).then(function(response) {
			$scope.leadOpportunityTasks = response.data;
		});
	};
	
	$scope.openTask = function(task) {
		retrieveLeadTask(task.id);
		$scope.selectedTaskId = task.id;
	};	
	
	$scope.saveTask = function() {
		var serviceData = angular.copy($scope.data);
		APPServices.updateTask(serviceData).then(function(response) {
			$scope.data = response.data;
		});
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.data = {};
		initLeftMenu();
		retrieveLeadTask($stateParams.record_id);
		$scope.selectedTaskId = $stateParams.record_id;
	};
	init();
} ]);