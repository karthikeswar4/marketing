app.controller("ContactBaseController", [ '$scope', '$window', '$rootScope', '$state', function($scope, $window, $rootScope, $state) {
	
	var initLeftMenu = function() {
		
		var leftMenus = [{
			name: 'Search Contacts',
			state: 'home.contact.search',
			security_code: "leads",
			action: "view",
		}, {
			name: 'Create Contact',
			state: 'home.contact.detail',
			security_code: "leads",
			action: "create",
		}];
		
		var leftMenus = $scope.setLeftMenu(leftMenus, 'leads');
		if (leftMenus.length > 0 && $state.is('home.contact')) {
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