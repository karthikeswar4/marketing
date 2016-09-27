app.controller("CampaignSearchController", [ '$scope', '$window', '$rootScope', '$element', '$state', 'APPServices', function($scope, $window, $rootScope, $element, $state, APPServices) {
	
	var getAllCampaigns = function() {
		$scope.contactsList = [];
		$scope.config.loading = true;
		APPServices.getAllCampaigns($scope.filter).then(function(response) {
			$scope.contactsList = response.data;
		}).finally(function() {
			$scope.config.loading = false;
		});
	};
	
	$scope.searchCampaigns = function() {
		getAllCampaigns();
	};
	
	$scope.resetSearch = function() {
		$scope.filter = {};
		getAllCampaigns();
	};
	
	$scope.openContact = function(data) {
		$state.go('home.campaign.detail', { record_id: data.id });
	};
	
	/**
	 * initializes the controller
	 */
	var init = function() {
		$scope.filter = {};
		$scope.config = {};
		$scope.leadsList = [];
		getAllCampaigns();
	};

	var local = {};
	init();
	
} ]);