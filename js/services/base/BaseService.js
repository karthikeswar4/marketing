angular.module('app')
.value("apihost","api/")
.factory('BaseService', ['$q', '$http','apihost', 'Utils', function($q, $http, apihost, Utils) {
	
	/**
	 * for the given base url, parse the url for the placeholder symbols, if the place holder symbols are available, 
	 * then replace the placeholders with the value from the arguments 
	 */
	var constructUrl = function(baseUrl, params) {
		var splitUrl = baseUrl.split("/"), buildUrl = apihost + baseUrl;
		if (splitUrl.length > 1) {
			
			var buildUrl = apihost, tempUrl;
			for (var index = 0, length = splitUrl.length; index < length; index++) {
				
				tempUrl = splitUrl[index];
				if (!tempUrl) continue;
				
				// the split part starts with { and ends with the } then replace it with the argument
				if (tempUrl[0] == "{" && tempUrl[tempUrl.length - 1] == "}") {
					buildUrl = buildUrl + "/" + params.shift();
				} else {
					
					if (buildUrl[buildUrl.length - 1] !== "/") {
						buildUrl = buildUrl + "/";
					}				
					
					buildUrl = buildUrl + tempUrl;
				}
			}
		}
		
		return buildUrl;
	};
	
	/**
	 * Error handler callback which should be used to handle the error and format the error function
	 */
	var handleError = function(data, status, headers, config) {
		
		var formattedErrorMsg = '';
		if (typeof data.consumerMessage != 'undefined') {
			formattedErrorMsg = data.consumerMessage;
		} else if (typeof data.applicationMessage != 'undefined') {
			formattedErrorMsg = data.applicationMessage;
		} else {
			formattedErrorMsg = "Internal Server Error.";
		}
		
		return formattedErrorMsg;
	};	
	
	
	var loadingService = {}, svc = {};
	svc.createService = function(url, method, service) {
		
		if (!url) return $q.reject("Url to communicate to server cannot be empty");
				
		if (!method) method = "GET"; // if the method parameter is not available, then simply consider it as get request
		var requestBase = angular.extend({}, service.config, { method: method.toUpperCase(), url: apihost + url }), needUrlTransform = false;
		
		// if the url contains some place holders, then replcae the placeholder with the corresponding values
		if (url.indexOf("{") != -1) needUrlTransform = true;		
		return function() {
			
			var mainArguments = Array.prototype.slice.call(arguments);
			var defer = $q.defer(), timeoutDefer = $q.defer();
			var request = angular.copy(requestBase);
			
			// timeout promise, whihc would be used while to cancel the request
			defer.cancel = timeoutDefer.resolve;
			request.timeout = request.promise;
			
			if (needUrlTransform) request.url = constructUrl(url, mainArguments);
			
			if (request.method == "GET") {
			
				// if the service is already loading, 
				// then no need of invoking the service once again
				if (loadingService[request.url] && loadingService[request.url].loading)  return loadingService[request.url].promise;				
				loadingService[request.url] = { loading: true, promise: defer.promise };
				request.params = mainArguments.shift();
				
			} else if (request.method == "PUT" || request.method == "POST") {
				// for post and put request, the data should be sent in payload, hence set the data to the payload object
				request.data = mainArguments.shift();
				// if any additional data is avaialbe in the services, then set those parameters for the params
				if (mainArguments.length > 0) {
					request.params = mainArguments.shift();
				}
			}
			
			Utils.showLoader();			
			$http(request).success(function(data, status, headers, config) {
				
				// if the request method is post/put, then it is considered as save/update request, the shows the success message
				var successMsg = data;
				if (service.successMsg) successMsg =  { msg : service.successMsg };				
				if (service.showRequestMsg !== false && (request.method == "PUT" || request.method == "POST")) Utils.success(successMsg, status, headers, config);
				defer.resolve( { headers:  headers, data: data, config: config } );
				$('.url_loader').hide();
			}).error(function(data, status, headers, config) {
				
				$('.url_loader').hide();
				var error =  { headers:  headers, data: data, config: config };
				// if the request method is post/put, then it is considered as save/update request, the shows the success message 
				if (service.showRequestMsg !== false) Utils.error(data, status, headers, config);
				
				error.formattedMsd = handleError(data, status, headers, config); 
				defer.reject(error);
				
			}).finally(function() {		
				Utils.hideLoader();
				if (loadingService[request.url]) delete loadingService[request.url];
			});		
			
			return defer.promise;
		};
	};
	
	/**
	 * build the services for the invoker service and returns the service
	 */
	svc.buildServices = function(services, serviceObj) {
		
		if (!services) return serviceObj || {};
		
		var constructedServices = {}, tempService;
		for (var index = 0; index < services.length; index++) {
			
			var service = services[index];
			tempService = svc.createService(service.url, service.method, service);
			constructedServices[service.name] = tempService;
			if (serviceObj) serviceObj[service.name] = tempService;
		}
		
		return constructedServices;
	};
	
	return svc;
}]);
