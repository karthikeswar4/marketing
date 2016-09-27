app.controller("SearchCompanyController", [ '$scope', '$q', '$rootScope', '$element', 'Utils', 'APPServices', function($scope, $q, $rootScope, $element, Utils, APPServices) {
	
	$scope.searchAllLeadCompanies = function() {
		$scope.companiesList = {};
		if (!$scope.filter || !$scope.filter.name) return;
		APPServices.getAllLeadCompanies($scope.filter).then(function(response) {
			$scope.companiesList = response.data;
		});
	};
	
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.filter = {};
	};
	
	var local = {};
	init();
} ]);