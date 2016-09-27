app.controller("RoleDetailController", [ '$scope', '$window', '$rootScope', '$filter', '$stateParams', 'Utils', 'APPServices', function($scope, $window, $rootScope, $filter, $stateParams, Utils, APPServices) {
	
	var initLeftMenu = function() {
	};
	
	var consolidateRoleItems = function() {
		local.roles = {};
		angular.forEach($scope.config.roleItems, function(role) {
			local.roles[role.code] = role;
		});
	};	
	
	var loadRolesList = function() {
		$scope.config.roleItems = [];
		APPServices.getAllRoleItems().then(function(response) {
			$scope.config.roleItems = response.data;
			consolidateRoleItems();
			normalizeData();
		});
	};
	
	$scope.saveRole = function() {
		if (!$scope.data.name) {
			Utils.warning('Role Name is Mandatory');
		}
		var selectedRoles = $filter('filter')($scope.config.roleItems, function(role) {
			return role.can_view || role.can_update || role.can_create || role.can_delete;
		});
		
		if (!selectedRoles || selectedRoles.length == 0) {
			Utils.warning('Please select a role');
			return;
		};
		
		var serviceData = angular.copy($scope.data);
		var roleItemsList = [];
		angular.forEach(selectedRoles, function(role) {
			roleItemsList.push({ id: role.id,
								 code: role.code,
								 view: role.can_view, 
								 create: role.can_create,
								 update: role.can_update,
								 delete: role.can_delete
								});
		});
		
		serviceData.role_items_list = JSON.stringify(roleItemsList);
		saveRole(serviceData);
	};
	
	var saveRole = function(serviceData) {
		var method = "updateRole";
		if (!$stateParams.record_id) {
			method = "createRole";
		}
		APPServices[method](serviceData).then(function(response) {
			$scope.data = response.data;
			normalizeData();
		});
	};	
	
	var normalizeData = function() {
		if (!$scope.data || !$scope.data.role_items_list) return;
		
		if (typeof $scope.data.role_items_list == "string") {
			$scope.data.role_items_list = JSON.parse($scope.data.role_items_list);
		}
		
		if(!local.roles) return;		
		var selectedRoleItemsList = $scope.data.role_items_list;
		for (var index = 0; index < selectedRoleItemsList.length; index++) {
			var role = selectedRoleItemsList[index];
			localRoleItem = local.roles[role.code];
			localRoleItem.can_view = role.view;
			localRoleItem.can_create = role.create;
			localRoleItem.can_update = role.update;
			localRoleItem.can_delete = role.delete;
		}
	};
	
	$scope.getRoleById = function() {
		
		if (!$stateParams.record_id) {
			return;
		}

		APPServices.getRoleById({ id: $stateParams.record_id }).then(function(response) {
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
		loadRolesList();
		$scope.getRoleById();
	};
	
	var local = {};
	init();
} ]);