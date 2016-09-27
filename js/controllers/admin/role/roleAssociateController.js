app.controller("RoleAssociateController", [ '$scope', '$window', '$rootScope', '$filter', '$stateParams', 'Utils', 'APPServices', function($scope, $window, $rootScope, $filter, $stateParams, Utils, APPServices) {
	
	var consolidateRoleItems = function() {
		local.roles = {};
		angular.forEach($scope.config.roleItems, function(role) {
			local.roles[role.id] = role;
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
	
	$scope.saveCompanyRoleAssociations = function() {
		if (!$scope.data.name) {
			Utils.warning('Role Name is Mandatory');
		}
		var selectedRoles = $filter('filter')($scope.config.roleItems, function(role) {
			return role.selected;
		});
		
		if (!selectedRoles || selectedRoles.length == 0) {
			Utils.warning('Please select a role');
			return;
		};
		
		var serviceData = angular.copy($scope.data);
		var roleItemsList = [];
		angular.forEach(selectedRoles, function(role) {
			roleItemsList.push(role.id);
		});
		
		serviceData.role_items_list = roleItemsList;
		saveRoleAssociation(serviceData);
	};
	
	var saveRoleAssociation = function(serviceData) {
		var method = "updateCompanyRoleAssociations";
		if (!serviceData.hasData) method = "createCompanyRoleAssociations";
		APPServices[method](serviceData).then(function(response) {
			if (response.data) {
				$scope.data = response.data;
				$scope.data.hasData = true;
			} else {
				$scope.data.role_items_list = [];
			}
			normalizeData();
		});
	};	
	
	var normalizeData = function() {
		if (!$scope.data || !$scope.data.role_items_list) {
			return;
		}
		if(!local.roles) return;		
		var selectedRoleItemsList = $scope.data.role_items_list;
		for (var index = 0; index < selectedRoleItemsList.length; index++) {
			var role = selectedRoleItemsList[index];
			localRoleItem = local.roles[role];
			localRoleItem.selected = true;
		}
	};
	
	$scope.getRoleAssociationById = function(companyId) {
		
		if (!companyId) {
			if (!local.roles) return;
			for(var key in local.roles) {
				local.roles[key].selected = false;
			}
			return;
		}

		APPServices.getCompanyRoleAssociations({ id: companyId }).then(function(response) {
			if (response.data) {
				$scope.data = response.data;
				$scope.data.hasData = true;
			} else {
				$scope.data.role_items_list = [];
			}
			normalizeData();
		});
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.data = {};
		loadRolesList();
		$scope.getRoleAssociationById();
	};
	
	var local = {};
	init();
} ]);