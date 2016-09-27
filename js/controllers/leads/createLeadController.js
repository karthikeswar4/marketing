app.controller("CreateLeadController", [ '$scope', '$window', '$rootScope', '$state', '$stateParams','$filter', '$location', 'Utils', 'APPServices', function($scope, $window, $rootScope, $state, $stateParams, $filter, $location, Utils, APPServices) {
	
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
	
	$scope.saveLead = function() {

		var serviceData = angular.copy($scope.data);
		APPServices.createLead(serviceData).then(function(response) {
			$scope.data = response.data;
			$scope.backupData = angular.extend($scope.backupData, $scope.data);
			$scope.closeModalDialog();
		});
	};
	
	$scope.searchCompany = function() {
		var modalScope = $scope.$new();
		var modalInstance = Utils.openModalDialog('views/leads/searchCompany.html', modalScope);
		modalInstance.result.finally(function() {
			modalScope.$destroy();
		});
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.backupData = {};
	};
	init();
} ]);