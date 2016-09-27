app.controller("UserSearchController", [ '$scope', '$window', '$rootScope', '$state', 'APPServices', function($scope, $window, $rootScope, $state, APPServices) {
	
	var initLeftMenu = function() {
		
		/*var leftMenus = [{
			name: 'Search Users',
			state: 'home.user',
			security_code: "users",
			action: "view"
		}, {
			name: 'Create User',
			state: 'home.user.detail',
			security_code: "users",
			action: "create"
		}];
		
		$scope.setLeftMenu(leftMenus);*/
	};
	
	var getAllUsers = function() {
		$scope.config.loading = true;
		$scope.usersList = [];
		APPServices.getAllUsers($scope.filter).then(function(response) {
			$scope.usersList = response.data;
		}).finally(function() {
			$scope.config.loading = false;
		});
	};
	
	$scope.searchUser = function() {
		getAllUsers();
	};
	
	$scope.resetSearch = function() {
		$scope.filter = {};
		getAllUsers();
	};
	
	$scope.rowClick = function(role) {
		$state.go('home.user.search.detail', { record_id: role.id });
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.filter = {};
		initLeftMenu();
		getAllUsers();
	};

	var local = {};
	init();
	
} ]);