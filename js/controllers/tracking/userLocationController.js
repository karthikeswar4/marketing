app.controller("UserLocationController", [ '$scope', '$element', '$rootScope', '$state', '$http', 'APPServices', function($scope, $element, $rootScope, $state, $http, APPServices) {
	
	$scope.onMapLoaded = function(map) {
        local.map = map;
        local.placeMarker = function(latitude, longitude) {
        	placeMarker(new google.maps.LatLng(latitude, longitude), map);
        };
        
        if (!$scope.data.location) return;
        local.placeMarker($scope.data.location.latitude, $scope.data.location.longitude);
	};
	
	var placeMarker = function(location, map) {
		if (!$scope.marker) $scope.marker = new google.maps.Marker();
		if (!$scope.infowindow) $scope.infowindow = new google.maps.InfoWindow();
		
		$scope.infowindow.close();
		$scope.marker.setMap(null);
		if (!location || (!location.lat() && !location.lng())) return;
		$scope.marker.setMap(map);
		$scope.marker.setPosition(location);
		if (!$scope.marker.getVisible())return;
		
		var contentString = '<div id="content">'+
        '<div id="bodyContent">'+
        '<p>'+ getUserDetail()+'s</p>'+
        '</div>'+
        '</div>';
	
	    $scope.infowindow.setContent(contentString);
	    $scope.infowindow.open(map, $scope.marker);
	};
	
	var getUserDetail = function() {
		var selUser = $scope.data.selectedUser;
		if (!selUser) return "";
		return (selUser.firstname || "" + " " + selUser.lastname || "");
	};
	
	var getUserLocation = function() {
		if (!$scope.filter.user_id) return;
		local.placeMarker();
		APPServices.retrieveLastDeviceLocationByUserId({ user_id: $scope.filter.user_id }).then(function(response) {
			$scope.data.location = response.data;
			if (!$scope.data.location) return;
			 local.placeMarker($scope.data.location.latitude, $scope.data.location.longitude);
		});
	};
	
	$scope.getUserLastKnownLocation = function() {
		getUserLocation();
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.filter = {};
		$scope.data = {};
	};
	var local = {};
	local.placeMarker = angular.identity
	init();
	
} ]);