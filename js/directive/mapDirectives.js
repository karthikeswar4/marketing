angular.module('app').directive('map', ['$timeout', function($timeout) {
	
	var linkFn = function(scope, element, attrs) {
		
		var defaultOptions = {
			zoom: 12,
			center: {lat: 11.02068, lng: 76.9778}
		};
		
		var loadMap = function() {
			scope.loadedMap = new google.maps.Map(element.get(0), angular.extend(defaultOptions, scope.map)); 
			scope.onMapLoaded({ map: scope.loadedMap });
		};
	
		var init = function() {
			$timeout(function() {
				loadMap();
			});
		};
		
		init();
	};
	
	return {
		restrict: 'A',
		link: linkFn,
		scope: {
			map: "=",
			onMapLoaded: "&"
		}
	}
}]);