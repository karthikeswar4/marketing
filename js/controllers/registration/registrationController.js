app.controller("RegistrationController", [ '$scope', '$window', '$rootScope', '$filter', '$stateParams', 'Utils', 'APPServices', function($scope, $window, $rootScope, $filter, $stateParams, Utils, APPServices) {
	
	$scope.submitRegistration = function() {
		var errors = [];
		if (!$scope.data.name) {
			errors.push('Company Name is Mandatory');
		}
		if (!$scope.data.email) {
			errors.push('Company Email is Mandatory');
		}
		if (!$scope.data.address_line1) {
			errors.push('Company Address Line1 is Mandatory');
		}
		if (!$scope.data.state) {
			errors.push('State is Mandatory');
		}
		if (!$scope.data.city) {
			errors.push('City is Mandatory');
		}
		if (!$scope.data.country) {
			errors.push('Country is Mandatory');
		}
		if (!$scope.data.phone1) {
			errors.push('Phone1 is Mandatory');
		}
		if (!$scope.data.agreed) {
			errors.push('Agree to the terms and conditions');
		}
		if (errors.length != 0) {
			Utils.warning(errors.join("<br/>"));
			return;
		}
		var serviceData = angular.copy($scope.data);
		registerCompany(serviceData);
	};
	
	var registerCompany = function(serviceData) {
		APPServices.registerCompany(serviceData).then(function(response) {
			$scope.data = response.data;
			normalizeData();
		});
	};	
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.data = {};
	};
	
	var local = {};
	init();
} ]);