angular.module('app')
.factory('APPServices', ['BaseService', function(BaseService) {
	
	var service = {};
	var getMap = function() {
		if (service.map) return service.map;
		service.map = new google.maps.Map($element.find('#user_location_map').get(0), {
            zoom: 12,
            center: {lat: 11.02068, lng: 76.9778}
		});  
		return service.map;
	}
	
	return {
		getMap: getMap
	}
}]);