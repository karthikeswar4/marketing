app.controller("ContactDetailController", [ '$scope', '$window', '$rootScope', '$state', '$stateParams','$filter', 'Utils', 'APPServices', function($scope, $window, $rootScope, $state, $stateParams, $filter, Utils, APPServices) {
	
	$scope.goBack = function() {
		$state.go('home.contact.search');
	};
	
	$scope.updateContact = function() {

		var serviceData = angular.copy($scope.data);
		APPServices.updateContact(serviceData).then(function(response) {
			$scope.data = response.data;
		});
	};
	
	var retrieveContact = function() {
		if (!$stateParams.record_id) return;
		APPServices.retrieveContact({ record_id: $stateParams.record_id }).then(function(response) {
			$scope.data = response.data;
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
		retrieveContact();
	};
	init();
} ]);