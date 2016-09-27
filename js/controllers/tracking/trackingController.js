app.controller("UsersController", [ '$scope', '$window', '$rootScope', '$state', 'APPServices', function($scope, $window, $rootScope, $state, APPServices) {
	
	var initLeftMenu = function() {
		
		var leftMenus = [{
			name: 'Search Users',
			state: 'home.user.search',
			security_code: "users",
			action: "view"
		}, {
			name: 'Create User',
			state: 'home.user.search.detail',
			security_code: "users",
			action: "create"
		}];
		var leftMenus = $scope.setLeftMenu(leftMenus, 'users');
		if (leftMenus.length > 0 && $state.is('home.user')) {
			$state.go(leftMenus[0].state);
		}
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		initLeftMenu();
	};

	var local = {};
	init();
	
} ]);