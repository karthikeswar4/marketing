angular.module('app').controller('LoginController', [ '$scope', '$state', '$rootScope', 'APPServices', function($scope, $state, $rootScope, APPServices) {

	$scope.loginAction = function() {
		
		$scope.errormessage = "";
		if (!$scope.login.username) {
			$scope.errormessage = "Enter username";
			return;
		}
		if (!$scope.login.password) {
			$scope.errormessage = "Enter password";
			return;
		}
		
		APPServices.login($.param($scope.login)).then(function(data) {
			$rootScope.normalizeUserData(data.data)
			$rootScope.loadNotification();
			$rootScope.loadJobNotification();
			$state.go('home');	
		}, function(data) {
			$scope.errormessage = data.data;
		});		
	};
	
	var init = function() {
		$scope.login = {};
		$scope.errormessage = "";
	}
	
	init();
} ]);
