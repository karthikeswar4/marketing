app.controller("ContactSearchController", [ '$scope', '$window', '$rootScope', '$element', '$state', 'APPServices', function($scope, $window, $rootScope, $element, $state, APPServices) {
	
	var getAllContacts = function() {
		$scope.contactsList = [];
		$scope.config.loading = true;
		APPServices.retrieveAllContacts($scope.filter).then(function(response) {
			$scope.contactsList = response.data;
		}).finally(function() {
			$scope.config.loading = false;
		});
	};
	
	$scope.searchContacts = function() {
		getAllContacts();
	};
	
	$scope.resetSearch = function() {
		$scope.filter = {};
		getAllContacts();
	};
	
	$scope.openContact = function(data) {
		$state.go('home.contact.detail', { record_id: data.id });
	};
	
	/**
	 * initializes the controller
	 */
	var init = function() {
		$scope.filter = {};
		$scope.config = {};
		$scope.leadsList = [];
		getAllContacts();
	};

	var local = {};
	init();
	
} ]);