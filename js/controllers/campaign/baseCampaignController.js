app.controller("CampaignBaseController", [ '$scope', '$window', '$rootScope', '$state', function($scope, $window, $rootScope, $state) {
	
	var initLeftMenu = function() {
		
		var leftMenus = [{
			name: 'Search Campaign',
			state: 'home.campaign.search',
			security_code: "leads",
			action: "view",
		}, {
			name: 'Create Campaign',
			state: 'home.campaign.detail',
			security_code: "leads",
			action: "create",
		}];
		
		var leftMenus = $scope.setLeftMenu(leftMenus, 'leads');
		if (leftMenus.length > 0 && $state.is('home.campaign')) {
			$state.go(leftMenus[0].state);
		}
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		initLeftMenu();
	};

	var local = {};
	init();
	
} ]);