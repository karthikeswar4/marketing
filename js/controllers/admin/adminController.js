app.controller("AdminController", [ '$scope', '$window', '$rootScope', '$state', function($scope, $window, $rootScope, $state) {
	
	var initLeftMenu = function() {
		
		var leftMenus = [{
			name: 'Company',
			state: 'home.admin.company',
			security_code: "admin_company",
			action: "menu",
			submenus: [{
					name: 'Search Company',
					state: 'home.admin.company',
					security_code: "admin_company",
					action: "view"
				}, {
					name: 'Create Company',
					state: 'home.admin.company.detail',
					security_code: "admin_company",
					action: "create"
			}]
		}, {
			name: 'Role',
			state: 'home.admin.role',
			security_code: "admin_role",
			action: "menu",
			submenus: [{
					name: 'Search Role',
					state: 'home.admin.role',
					security_code: "admin_role",
					action: "view"
				}, {
					name: 'Create Role',
					state: 'home.admin.role.detail',
					security_code: "admin_role",
					action: "create"
				/*}, {
					name: 'Associate Role',
					state: 'home.admin.role.associate',
					security_code: "admin_role",
					action: "create"*/
			}]
		}];
		
		var leftMenus = $scope.setLeftMenu(leftMenus, 'administration');
		if (leftMenus.length > 0 && $state.is('home.admin')) {
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