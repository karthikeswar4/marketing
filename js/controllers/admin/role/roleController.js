app.controller("RoleController", [ '$scope', '$window', '$rootScope', '$state', 'APPServices', function($scope, $window, $rootScope, $state, APPServices) {

	var getAllRoles = function() {
		$scope.config.loading = true;
		$scope.rolesList = [];
		APPServices.getAllRoles($scope.filter).then(function(response) {
			$scope.rolesList = response.data;
		}).finally(function() {
			$scope.config.loading = false;
		});
	};
	
	$scope.searchRole = function() {
		getAllRoles();
	};
	
	$scope.resetSearch = function() {
		$scope.filter = {};
		getAllRoles();
	};
	
	$scope.rowClick = function(role) {
		$state.go('home.admin.role.detail', { record_id: role.id });
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.filter = {};
		getAllRoles();
	};

	var local = {};
	init();
	
} ]);