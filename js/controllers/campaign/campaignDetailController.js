app.controller("CampaignDetailController", [ '$scope', '$window', '$rootScope', '$state', '$stateParams','$filter', '$location', 'Utils', 'APPServices', function($scope, $window, $rootScope, $state, $stateParams, $filter, $location, Utils, APPServices) {
	
	$scope.goBack = function() {
		$state.go('home.campaign.search');
	};
	
	$scope.saveCampaign = function() {

		var method = "createCampaign";
		if ($stateParams.record_id) method = "updateCampaign"; 
		var serviceData = angular.copy($scope.data);
		delete serviceData.leads;
		APPServices[method](serviceData).then(function(response) {
			$scope.data = response.data;
			$scope.backupData = angular.extend($scope.backupData, $scope.data);
			$stateParams.record_id = $scope.data.id;
			var updatedPath = $state.href($state.current);
			updatedPath = updatedPath.replace(/^[#]/, '');
			$location.path(updatedPath);
		});
	};
	
	var retrieveCampaign = function() {
		if (!$stateParams.record_id) return;
		APPServices.getCampaign({ record_id: $stateParams.record_id }).then(function(response) {
			$scope.data = response.data;
		});
	};

	var retrieveCampaignLeads = function() {
		if (!$stateParams.record_id) return;
		APPServices.getCampaignLeads({ record_id: $stateParams.record_id }).then(function(response) {
			$scope.campaignLeads = response.data;
		});
	};
	
	$scope.closeCampaign = function() {
		if (!$stateParams.record_id) return;
		APPServices.closeCampaign({ campaign_id: $stateParams.record_id }).then(function(response) {
			$scope.campaignLeads = response.data;
		});
	};
	
	$scope.openCreateLead = function() {
		if (!$stateParams.record_id) return;
		
		if (angular.uppercase($scope.data.status) == "CLOSED") {
			Utils.warning('CANNOT_CREATE_LEAD_CLOSED_CAMPAIGN');
			return;
		}
		
		var modalScope = $scope.$new();
		modalScope.data = { campaign_id: $stateParams.record_id };
		var modalInstance = Utils.openModalDialog('views/leads/createLeads.html', modalScope, 'lg');
		modalInstance.result.finally(function() {
			retrieveCampaignLeads();
			modalScope.$destroy();
		});
	};
	
	$scope.openLead = function(lead) {
		$state.go('home.leads.detail', { record_id: lead.id });
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.data = {};
		$scope.backupData = {};
		$scope.taskDetails = [];
		retrieveCampaign();
		retrieveCampaignLeads();
	};
	init();
} ]);