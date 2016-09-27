app.controller("LeadsDetailController", [ '$scope', '$window', '$rootScope', '$state', '$stateParams','$filter', '$location', 'Utils', 'APPServices', function($scope, $window, $rootScope, $state, $stateParams, $filter, $location, Utils, APPServices) {
	
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
	
	$scope.submitLead = function() {
		Utils.showConfirmation('ARE_YOU_SURE_YOU_WANT_TO_MARK_STAGE_AS_COMPLETED', 'YES', 'NO').then(function() {
			APPServices.submitLead({ lead_id: $scope.data.id }).then(function(response) {
				
				var leadCompany = $scope.data.lead_company;
				$scope.data = angular.extend($scope.data, response.data);
				$scope.data.lead_company = leadCompany;
				if ($scope.data.status == "Proposal") {
					$state.go('home.opportunities.detail', { record_id: response.data.id });
				}
			});
		});
	};
	
	$scope.saveLead = function() {

		var method = "createLead"
		if ($stateParams.record_id) method = "updateLead";
		var serviceData = angular.copy($scope.data);
		APPServices[method](serviceData).then(function(response) {

			$scope.data = response.data;
			$scope.backupData = angular.extend($scope.backupData, $scope.data);
			$stateParams.record_id = $scope.data.id;
			var updatedPath = $state.href($state.current);
			updatedPath = updatedPath.replace(/^[#]/, '');
			$location.path(updatedPath);			
		});
	};
	
	$scope.searchCompany = function() {
		var modalScope = $scope.$new();
		var modalInstance = Utils.openModalDialog('views/leads/searchCompany.html', modalScope);
		modalInstance.result.finally(function() {
			modalScope.$destroy();
		});
	};
	
	$scope.openCreateTask = function() {
		if (!$stateParams.record_id) return;
		
		var modalScope = $scope.$new();
		modalScope.task = { lead_id: $stateParams.record_id };
		var modalInstance = Utils.openModalDialog('views/tasks/createTask.html', modalScope);
		modalInstance.result.finally(function() {
			retrieveLeadTasks();
			modalScope.$destroy();
		});
	};
	
	$scope.openTaskDetail = function(task) {
		$state.go('home.task.detail', { record_id: task.id });
	};
	
	var retrieveLead = function() {
		if (!$stateParams.record_id) return;
		APPServices.retrieveLead({ record_id: $stateParams.record_id }).then(function(response) {
			$scope.data = response.data;
			if ($scope.data.lead_company) {
				$scope.company_lat_long = $scope.data.lead_company.latitude + ", " + $scope.data.lead_company.longitude;
			}
		});
	};
	
	var retrieveLeadTasks = function() {
		$scope.taskDetails = [];
		if (!$stateParams.record_id) return;
		APPServices.retrieveLeadTasksByLeadId({ lead_id: $stateParams.record_id }).then(function(response) {
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
		$scope.backupData = {};
		$scope.taskDetails = [];
		retrieveLead();
		retrieveLeadTasks();
		$scope.company_lat_long = "";
		/*$scope.data.lead_company.latitude = 11.0535;
		$scope.data.lead_company.longitude = 76.94532;*/
	};
	init();
} ]);