app.controller("LeadsController", [ '$scope', '$window', '$rootScope', '$element', '$state', 'APPServices', function($scope, $window, $rootScope, $element, $state, APPServices) {
	
	var getAllLeads = function() {
		$scope.leadsList = [];
		$scope.config.loading = true;
		APPServices.retrieveAllLeads($scope.filter).then(function(response) {
			$scope.leadsList = response.data;
		}).finally(function() {
			$scope.config.loading = false;
		});
	};
	
	$scope.searchLeads = function() {
		getAllLeads();
	};
	
	$scope.resetSearch = function() {
		$scope.filter = {};
		getAllLeads();
	};
	
	$scope.openLead = function(data) {
		$state.go('home.leads.detail', { record_id: data.id });
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.filter = {};
		$scope.config = {};
		$scope.leadsList = [];
		getAllLeads();
	};

	var local = {};
	init();
	
} ]);