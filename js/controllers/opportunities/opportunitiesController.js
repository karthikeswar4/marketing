app.controller("OpportunitiesController", [ '$scope', '$window', '$rootScope', '$element', '$state', 'APPServices', function($scope, $window, $rootScope, $element, $state, APPServices) {
	
	var getAllOpportunities = function() {
		$scope.opportunitiesList = [];
		$scope.config.loading = true;
		APPServices.retrieveAllOpportunities($scope.filter).then(function(response) {
			$scope.opportunitiesList = response.data;
		}).finally(function() {
			$scope.config.loading = false;
		});
	};
	
	$scope.searchOpportunities = function() {
		getAllOpportunities();
	};
	
	$scope.resetSearch = function() {
		$scope.filter = {};
		getAllOpportunities();
	};
	
	$scope.openOpportunity = function(data) {
		$state.go('home.opportunities.detail', { record_id: data.id });
	};
	
	var loadStatus = function() {
		$scope.statusList = {
			QUALIFY: "Qualify",
			REQ_ANALYSIS: "Req_Analysis",
			PROPOSAL: "Proposal",
			HOLD: "Hold",
			WON: "Won",
			LOST: "Lost"
		};
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.filter = {};
		$scope.config = {};
		$scope.leadsList = [];
		getAllOpportunities();
		loadStatus();
	};

	var local = {};
	init();
	
} ]);