app.controller("UserTrackingController", [ '$scope', '$element', '$rootScope', '$state', '$http', 'APPServices', function($scope, $element, $rootScope, $state, $http, APPServices) {
	
	var retriveDeviceLocationByUser = function(userId) {
		if (!userId) return;
		$scope.config.loading = true;
		$scope.deviceLocations = [];
		APPServices.retrieveUserDeviceLocation({ user_id: userId }).then(function(response) {
			$scope.deviceLocations = response.data;
			plotDirections();
		}).finally(function() {
			$scope.config.loading = false;
		});
	};
	
	$scope.retriveDeviceLocationByUser = function() {
		retriveDeviceLocationByUser($scope.filter.user_id);
	};
	
	$scope.onMapLoaded = function(map) {
		local.map = map;
		local.directionsService = new google.maps.DirectionsService;
        local.directionsDisplay = new google.maps.DirectionsRenderer;
		plotDirections();
	};
	
	var plotDirections = function() {
		if (local.directionsDisplay) local.directionsDisplay.setMap(null);
		if (!local.directionsService 
				|| !$scope.deviceLocations
				|| !$scope.deviceLocations.length) return;
		
		var origin = $scope.deviceLocations[0].latitude + "," + $scope.deviceLocations[0].longitude; // "11.110857,77.965981"
		var waypts = [], last = ($scope.deviceLocations.length - 1), incrementor = Math.floor($scope.deviceLocations.length / 8);
		for (var index = 1, count = 0, maxlength = Math.min(8, (last - 2)); count < maxlength ; count++) {
			waypts.push({
				location: $scope.deviceLocations[index].latitude + "," + $scope.deviceLocations[index].longitude
			});
			index = index + incrementor
		};
		var destination = $scope.deviceLocations[last].latitude + "," + $scope.deviceLocations[last].longitude; // "11.0650237,77.0005188"
        local.directionsService.route({
            origin: origin,
            destination: destination,
            waypoints: waypts,
            travelMode: 'DRIVING'
          }, function(response, status) {
        	  if (status === 'OK') {
        		  local.directionsDisplay.setMap(local.map);
        		  local.directionsDisplay.setDirections(response);
        		  var route = response.routes[0];
	              // For each route, display summary information.
	              for (var i = 0; i < route.legs.length; i++) {
	                var routeLegs = route.legs[i];
	                for (var j = 0; j < routeLegs.steps.length; j++) {
	                	var legSteps = routeLegs.steps[j];
	                	var points = legSteps.encoded_lat_lngs || legSteps.polyline.points;
	                }
	              }
	          } else {
	              window.alert('Directions request failed due to ' + status);
	          }
          });
	};
	
	var getAllUsers = function() {
		$scope.config.loading = true;
		$scope.usersList = [];
		APPServices.getAllUsers($scope.filter).then(function(response) {
			$scope.usersList = response.data;
		}).finally(function() {
			$scope.config.loading = false;
		});
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.filter = {};
		$scope.retriveDeviceLocationByUser();
		getAllUsers();
	};

	var local = {};
	init();
	
} ]);