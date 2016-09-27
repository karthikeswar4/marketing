angular.module('app').controller('BaseController', [ '$scope', 'APPServices', '$state', '$rootScope', 'Utils', function($scope, APPServices, $state, $rootScope, Utils) {

	$scope.logout = function() {
		APPServices.logout().then(function() {
			$rootScope.config.isAuthenticated = false;
			$rootScope.store.userInfo = null;
			$state.go('login');
			$scope.notifications = undefined;
			$scope.jobnotifications = undefined;
		});
	};
	
	$scope.clearCache = function() {
		APPServices.clearCache();
	}
	
	$rootScope.loadNotification = function() {
		APPServices.getAllNotifications().then(function(data) {
			$scope.notifications = data.data;
			console.log(data);
		});
	};
	
	$rootScope.loadJobNotification = function() {
		APPServices.getAllJobNotifications().then(function(data) {
			$scope.jobnotifications = data.data;
			console.log(data);
		});
	};
	
	$scope.openNotification = function(notify) {
		if (notify.usertype == "User") {
			$state.go("home.user.create", { "record_id": notify.id });
		} else if (notify.usertype == "Customer") {
			$state.go("home.customer.create", { "record_id": notify.id });
		} else if (notify.usertype == "Vendor") {
			$state.go("home.vendor.create", { "record_id": notify.id });
		}
	};
	
	$scope.openJobNotification = function(notify) {
		$state.go("home.jobs.create", { "record_id": notify.id });
	};
	
	$scope.getDate = function(date) {
		return Utils.toDate(date);
	}
	
	var initAPP = function() {
		$("#appContainer").css('min-height', ($(window).height() - 30));
	}
	
	var init = function() {
		$scope.state = $state;
		$rootScope.loadNotification();
		$rootScope.loadJobNotification();
		initAPP();
	};
	
	init();
} ]);
