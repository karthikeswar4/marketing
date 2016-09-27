app.controller("TasksController", [ '$scope', '$window', '$rootScope', '$element', '$state', 'APPServices', function($scope, $window, $rootScope, $element, $state, APPServices) {
	
	var initLeftMenu = function() {
		
		var leftMenus = [{
			name: 'Search Tasks',
			state: 'home.task'
		}];
		
		$scope.setLeftMenu(leftMenus);
	};
	
	var loadTasks = function() {
		APPServices.retrieveLeadTasks().then(function(response) {
			$scope.tasksList = response.data
		});
	};
	
	$scope.openTask = function(task) {
		$state.go('home.task.detail', { record_id: task.id });
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		initLeftMenu();
		loadTasks();
	};

	var local = {};
	init();
	
} ]);