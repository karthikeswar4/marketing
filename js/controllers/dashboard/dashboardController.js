app.controller("DashboardController", [ '$scope', '$timeout', '$rootScope', '$element', '$state', 'APPServices', function($scope, $timeout, $rootScope, $element, $state, APPServices) {
	
	
	var loadMenusList = function() {
		$scope.setLeftMenu([]);
	};
	
	var initDashboardSection = function() {
		$timeout(function() {
			var contentAreaHeight = $element.closest('.content-area').height();
			$element.find('.dashboard-section').css('min-height', Math.max(400, (contentAreaHeight / 2)));
			$element.find('.dashboard-section .dash-elem').addClass('animate');
		});
	};
	
	$scope.openTask = function(task) {
		$state.go('home.task.detail', { record_id: task.id });
	};
	
	$scope.openLead = function(lead) {
		$state.go('home.leads.detail', { record_id: lead.id });
	};
	
	var loadOpenLeads = function() {
		$scope.leadsList = [];
		APPServices.getMyLeads().then(function(response) {
			$scope.leadsList = response.data;
		});
	};

	var loadOpenTasks = function() {
		$scope.tasksList = [];
		APPServices.getMyOpenTasks().then(function(response) {
			$scope.tasksList = response.data;
		});
	};

	var loadOverdueTasks = function() {
		$scope.overdueTasksList = [];
		APPServices.getMyOverdueTasks().then(function(response) {
			$scope.overdueTasksList = response.data;
		});
	};
	
	var loadLeadStatus = function() {
		
		$scope.leadStats = [];
		APPServices.getLeadStatistics().then(function(response) {
			var stats = response.data;
			var finalStats = []
			for (var index = 0; index < stats.length; index++) {
				finalStats.push({ name: stats[index].status, y: parseInt(stats[index].count) });
			}
			$scope.leadStats = finalStats;
		});
	};
	
	var loadPieChartOptions = function() {
		$scope.chartOptions = {
			title: {
				align: 'left',
				text: 'Lead Status',
				style: { fontWeight: 'bold', fontSize: '14px' }
			}
		};
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		loadMenusList();
		loadPieChartOptions();
		initDashboardSection();
		loadOpenTasks();
		loadOverdueTasks();
		loadOpenLeads();
		loadLeadStatus();
	};
	init();
} ]);