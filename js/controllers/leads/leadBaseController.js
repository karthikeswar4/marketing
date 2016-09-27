app.controller("LeadBaseController", [ '$scope', '$window', '$rootScope', '$element', '$state', 'APPServices', function($scope, $window, $rootScope, $element, $state, APPServices) {
	
	var initLeftMenu = function() {
		
		var leftMenus = [{
			name: 'Search Leads',
			state: 'home.leads.search',
			security_code: "leads",
			action: "view",
		}, {
			name: 'Create Opportunity',
			state: 'home.leads.detail',
			security_code: "leads",
			action: "create",
		/*}, {
			name: 'Import Opportunity',
			state: 'home.leads.import',
			security_code: "leads",
			action: "create",*/
		}];
		
		var leftMenus = $scope.setLeftMenu(leftMenus, 'leads');
		if (leftMenus.length > 0 && $state.is('home.leads')) {
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
	init()
	
} ]);