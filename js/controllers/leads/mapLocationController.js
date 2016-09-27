app.controller("MapLocationController", [ '$scope', '$q', '$rootScope', '$element', 'Utils', function($scope, $q, $rootScope, $element, Utils) {
	
	var initMapByCurrentLocation = function() {
		if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(function(position) {
        	initMapLocation(position);
        });
	};
	
	var initMapLocation = function(position) {

        local.map = new google.maps.Map($element.find('#locatiomap').get(0), {
            center: {
                lat: Number(position.coords.latitude),
                lng: Number(position.coords.longitude)
            },
            zoom: 13
        });
        
        placeMarker(new google.maps.LatLng(position.coords.latitude, position.coords.longitude), local.map);
        google.maps.event.addListener(local.map, 'click', function(event) {
            placeMarker(event.latLng, local.map);
        });
	};
	
	var getLocationByCity = function() {
		var defer = $q.defer();
		if (!$scope.city) {
			defer.reject();
			return defer.promise;
		};
		
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({
			'address' : $scope.city
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				defer.resolve(results[0].geometry.location);
			} else {
				defer.reject();
			}
		});
		return defer.promise;
	};
	
	var placeMarker = function(location, map) {
		if ($scope.marker)  $scope.marker.setMap(null);
		$scope.marker = new google.maps.Marker({
            position: location,
            map: map
        });
	};
	
	$scope.selectLocation = function(marker) {
		if (!marker.position) return;
		var latitude = marker.position.lat();
		var longitude = marker.position.lng();
		if (!latitude || !longitude) return;
		if (!$scope.latLng) $scope.latLng = {};
		$scope.latLng.latitude = latitude;
		$scope.latLng.longitude = longitude;
		$scope.closeModalDialog();
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		if ($scope.latLng.latitude && $scope.latLng.longitude) {
			var coords = {};
			coords.latitude = $scope.latLng.latitude,
            coords.longitude = $scope.latLng.longitude
			initMapLocation({ coords : coords });
		} else {
			getLocationByCity().then(function(location) {
				var coords = {};
				coords.latitude = location.lat(),
	            coords.longitude = location.lng()
				initMapLocation({ coords : coords });
			}, initMapByCurrentLocation);
		}
	};
	
	var local = {};
	init();
} ]);