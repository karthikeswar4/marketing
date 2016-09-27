app.controller("CompanyController", [ '$scope', '$window', '$rootScope', '$state', 'APPServices', function($scope, $window, $rootScope, $state, APPServices) {

	var getAllCompanies = function() {
		$scope.config.loading = true;
		$scope.companiesList = [];
		APPServices.getAllCompanies($scope.filter).then(function(response) {
			$scope.companiesList = response.data;
		}).finally(function() {
			$scope.config.loading = false;
		});
	};
	
	$scope.searchCompany = function() {
		getAllCompanies();
	};
	
	$scope.resetSearch = function() {
		$scope.filter = {};
		getAllCompanies();
	};
	
	$scope.rowClick = function(company) {
		$state.go('home.admin.company.detail', { record_id: company.id });
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.filter = {};
		getAllCompanies();
	};

	var local = {};
	init();
	
} ]);