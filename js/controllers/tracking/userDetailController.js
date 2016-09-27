app.controller("UserDetailController", [ '$scope', '$window', '$rootScope', '$stateParams', 'APPServices', 'Utils', function($scope, $window, $rootScope, $stateParams, APPServices, Utils) {
	
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
	
	$scope.saveUser = function() {
		
		var errors = [];
		if (!$scope.data.firstname) errors.push('Name is Mandatory');
		if (!$scope.data.role) errors.push('Role is Mandatory');
		if (errors.length > 0) {
			Utils.warning(errors.join("</br>"));
			return;
		};
		
		var serviceData = angular.copy($scope.data);
		saveUser(serviceData);
	};
	
	var saveUser = function(serviceData) {
		var method = "updateUser";
		if (!$stateParams.record_id) {
			method = "createUser";
		}
		APPServices[method](serviceData).then(function(response) {
			$scope.data = response.data;
			normalizeData();
		});
	};	
	
	var normalizeData = function() {
		if (!$scope.data) return;
	};
	
	$scope.getUserById = function() {
		
		if (!$stateParams.record_id) {
			return;
		}

		APPServices.getUser({ userId: $stateParams.record_id }).then(function(response) {
			$scope.data = response.data;
			normalizeData();
		});
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.data = {};
		initLeftMenu();
		$scope.getUserById();
	};
	init();
} ]);