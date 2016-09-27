app.controller("OpportunitiesDetailController", [ '$scope', '$window', '$rootScope', '$state', '$stateParams','$filter', 'Utils', 'APPServices', function($scope, $window, $rootScope, $state, $stateParams, $filter, Utils, APPServices) {
	
	$scope.goBack = function() {
		$state.go('home.opportunities.search');
	};
	
	$scope.locateOnMap = function() {
		var modalScope = $scope.$new();
		modalScope.city = 'coimbatore';
		modalScope.latLng = {};
		
		if ($scope.data.lead_company) {
			if ($scope.data.lead_company.latitude) modalScope.latLng.latitude = $scope.data.lead_company.latitude;
			if ($scope.data.lead_company.longitude) modalScope.latLng.longitude = $scope.data.lead_company.longitude;
		}
		
		var modalInstance = Utils.openModalDialog('views/leads/mapLocation.html', modalScope, 'lg')
		modalInstance.result.finally(function() {
			if (!$scope.data.lead_company) $scope.data.lead_company = {};
			if (modalScope.latLng.latitude) $scope.data.lead_company.latitude = modalScope.latLng.latitude;
			if (modalScope.latLng.longitude) $scope.data.lead_company.longitude = modalScope.latLng.longitude;
			$scope.company_lat_long = $scope.data.lead_company.latitude + ", " + $scope.data.lead_company.longitude;
			modalScope.$destroy();
		});
	};
	
	$scope.updateOpportunity = function() {

		var serviceData = angular.copy($scope.data);
		APPServices.updateOpportunity(serviceData).then(function(response) {
			$scope.data = response.data;
		});
	};
	
	$scope.submitOpportunity = function() {
		Utils.showConfirmation('CONFIRM_SUBMIT_OPPORTUNITY').then(function() {
			APPServices.submitOpportunity($scope.data).then(function(response) {
				var company_detail = $scope.data.lead_company;
				$scope.data = response.data;
				$scope.data.lead_company = company_detail;
			});
		});
	};
	
	$scope.holdOpportunity = function() {
		Utils.showConfirmation('CONFIRM_HOLD_OPPORTUNITY').then(function() {
			APPServices.holdOpportunity($scope.data).then(function(response) {
				var company_detail = $scope.data.lead_company;
				$scope.data = response.data;
				$scope.data.lead_company = company_detail;
			});
		});
	};
	
	$scope.wonOpportunity = function() {
		Utils.showConfirmation('CONFIRM_WON_OPPORTUNITY').then(function() {
			APPServices.wonOpportunity($scope.data).then(function(response) {
				var company_detail = $scope.data.lead_company;
				$scope.data = response.data;
				$scope.data.lead_company = company_detail;
			});
		});
	};
	
	$scope.lostOpportunity = function() {
		Utils.showConfirmation('CONFIRM_LOST_OPPORTUNITY').then(function() {
			APPServices.lostOpportunity($scope.data).then(function(response) {
				var company_detail = $scope.data.lead_company;
				$scope.data = response.data;
				$scope.data.lead_company = company_detail;
			});
		});
	};

	$scope.backToNegotiation = function() {
		Utils.showConfirmation('CONFIRM_BACK_TO_NEGOTIATION').then(function() {
			APPServices.backToNegotiation($scope.data).then(function(response) {
				var company_detail = $scope.data.lead_company;
				$scope.data = response.data;
				$scope.data.lead_company = company_detail;
			});
		});
	};
	
	$scope.openCreateTask = function() {
		if (!$stateParams.record_id) return;
		
		var modalScope = $scope.$new();
		modalScope.task = { opportunity_id: $stateParams.record_id };
		var modalInstance = Utils.openModalDialog('views/tasks/createTask.html', modalScope);
		modalInstance.result.finally(function() {
			retrieveOpportunityTasks();
			modalScope.$destroy();
		});
	};
	
	$scope.openTaskDetail = function(task) {
		$state.go('home.task.detail', { record_id: task.id });
	};
	
	var retrieveOpportunity = function() {
		if (!$stateParams.record_id) return;
		APPServices.retrieveOpportunity({ record_id: $stateParams.record_id }).then(function(response) {
			$scope.data = response.data;
			if ($scope.data.lead_company) {
				$scope.company_lat_long = $scope.data.lead_company.latitude + ", " + $scope.data.lead_company.longitude;
			}
		});
	};
	
	var retrieveOpportunityTasks = function() {
		$scope.taskDetails = [];
		if (!$stateParams.record_id) return;
		APPServices.retrieveTasksByOpportunityId({ opportunity_id: $stateParams.record_id }).then(function(response) {
			$scope.taskDetails = response.data;
			$scope.closedTaskDetails = $filter('filter')($scope.taskDetails, { status: 'Completed' });
			$scope.openTaskDetails = $filter('filter')($scope.taskDetails, function(task){ return task.status != 'Completed'; });
		});
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.data = {};
		$scope.taskDetails = [];
		$scope.submitButton = "MARK_STAGE_AS_COMPLETED";
		retrieveOpportunity();
		retrieveOpportunityTasks();
		$scope.company_lat_long = "";
		$scope.data.latitude = 11.0535;
		$scope.data.longitude = 76.94532;
	};
	init();
} ]);