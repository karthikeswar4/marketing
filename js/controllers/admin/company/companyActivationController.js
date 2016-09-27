app.controller("CompanyActivationController", [ '$scope', '$state', '$rootScope', '$filter', '$stateParams', 'Utils', 'APPServices', function($scope, $state, $rootScope, $filter, $stateParams, Utils, APPServices) {

	$scope.goBack = function() {
		$state.go('home.admin.company.detail', { record_id: $stateParams.record_id });
	};
	
	$scope.saveActivationDetail = function() {
		var errors = [];
		if (!$scope.data.activation_from) {
			errors.push('Activation From Date is Mandatory');
		}
		if (!$scope.data.activation_from) {
			errors.push('Activation To Date is Mandatory');
		}
		if (errors.length > 0) {
			Utils.warning(errors.join("<br />"));
			return;
		}
		var serviceData = angular.copy($scope.data);
		saveActivation(serviceData);
	};
	
	var saveActivation = function(serviceData) {
		
		var method = "createActivationDetail";
		if ($scope.data.id) method = "updateActivationDetail";
		serviceData.company_id = $stateParams.record_id;
		APPServices[method](serviceData).then(function(response) {
			$scope.data = response.data;
			normalizeData();
		});
	};	
	
	var normalizeData = function() {
	};
	
	$scope.getActivationDetailById = function() {
		
		if (!$stateParams.record_id) {
			return;
		}

		APPServices.getCompanyActivationByCompanyId({ id: $stateParams.record_id }).then(function(response) {
			$scope.data = response.data;
			normalizeData();
		});
	};
	
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.data = {};
		$scope.getActivationDetailById();
	};
	
	var local = {};
	init();
} ]);