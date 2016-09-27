var app = angular.module('app', [ 'ui.router', 'oc.lazyLoad', 'pascalprecht.translate', 'ngSanitize', 'ui.bootstrap' ]);

app.config([ '$stateProvider', '$urlRouterProvider', '$locationProvider', '$provide', '$ocLazyLoadProvider', '$translateProvider', function($stateProvider, $urlRouterProvider, $locationProvider, $provide, $ocLazyLoadProvider, $translateProvider) {

	$locationProvider.html5Mode(false);
	$stateProviderRef = $stateProvider;
	$urlRouterProviderRef = $urlRouterProvider;

	/*
	 * Translation Logic
	 */
	$translateProvider.useStaticFilesLoader({
		prefix : 'resources/languages/',
		suffix : '.json'
	});

	// For any unmatched url, redirect to /
	$urlRouterProvider.otherwise("/login");

	$translateProvider.preferredLanguage('english');
	$translateProvider.fallbackLanguage('english');
	
	/**
	 * include the immediate previous state for the state change
	 */
	$provide.decorator('$state', function($delegate) {
		var delegateFn = $delegate.go;
		$delegate.go = function(to, params, options) {

			if (!to) to = "login";
			var previousState = $delegate.$current, previousStateData = previousState.data;
			var previousStateParams = $delegate.currentStateParams;
			var cstate = $delegate.get(to);
			if (!cstate) {
				console.log('State Not available:' + to);
				return;
			}
			var returnState = delegateFn(to, params, options);
			var currentState = cstate.data;
			if ((!currentState || !currentState.hasOwnProperty("skipState") && currentState.skipState !== true && currentState.skipState !== "true")
				&& (!previousStateData || !previousStateData.hasOwnProperty("skipState") && previousStateData.skipState !== true && previousStateData.skipState !== "true")
				&& ((previousState && previousState.name != cstate.name) || !previousState || !previousState.name)) {
				$delegate.previousState = previousState;
				$delegate.currentStateParams = params;
				$delegate.previousStateParams = previousStateParams;
			}
			return returnState;
		}
		return $delegate;
	});

} ]);

app.run([ '$state', '$rootScope', '$location', '$timeout', '$stateParams', 'Utils', '$urlMatcherFactory', function($state, $rootScope, $location, $timeout, $stateParams, Utils, $urlMatcherFactory) {

	$rootScope.store = {};
	$rootScope.config = {};
	$rootScope.config.initial = {};
	var _url = 'resources/states/states.json';
	$.ajax({
		url : _url,
		type : 'GET',
		dataType : 'json',
		success : function(collection) {

			var location = $location.path(), stateName;
			angular.forEach(collection, function(value, key) {

				if ($state.get(key))	return;

				var obj = value;
				var state = {};

				if (obj.url) state.url = obj.url;
				if (obj.views) state.views = obj.views;
				if (obj.data) state.data = obj.data;
				if (obj.abstract) state.abstract = obj.abstract;

				if (obj.resolve && obj.resolve.lazyload && obj.resolve.lazyload.dependencies) {

					state.resolve = {
						loadMyCtrl : [ '$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load({
								name : "app",
								files : obj.resolve.lazyload.dependencies
							});
						} ]
					}
				}
				$stateProviderRef.state(key, state);
				var match = $urlMatcherFactory.compile(state.url);
				if ("#" + location == $state.href(key)) $rootScope.config.initial.state = key;
			});		
			authenticate();
			$state.go('home');
		},
		error : function(data) {
			
		}
	});
	
	var authenticate = function() {
		$.ajax({
			url : 'api/login/authenticate',
			type : 'GET',
			dataType : 'json',
			success : function(data) {
				$rootScope.normalizeUserData(data);
				if (!$rootScope.config.initial.state 
						|| $rootScope.config.initial.state == "login" 
						|| $rootScope.config.initial.state.name == "login") {
					$rootScope.config.initial.state = "home";
				}
				$state.go($rootScope.config.initial.state, $rootScope.config.initial.stateParam);	
				Utils.hideLoader();
			},
			error : function(data) {
				console.log(data);
				$rootScope.config.isAuthenticated = false;
				$rootScope.config.authenticationLoaded = true;
				
				var initialState = $rootScope.config.initial.state;
				if (initialState && typeof initialState == "string") {
					initialState = $state.get(initialState);
				} 
				
				if (initialState.data && initialState.data.requireAuthentication == false) {
					$state.go(initialState, $rootScope.config.initial.stateParam);
				} else {
					$state.go('login', $rootScope.config.initial.stateParam);
				}
				
				Utils.hideLoader();
			}
		});
	};
	
	$rootScope.normalizeUserData = function(data) {
		$rootScope.config.isAuthenticated = true;
		$rootScope.config.authenticationLoaded = true;
		var rights = {};
		if (data.accessible_rights) {
			for (var index = 0; index < data.accessible_rights.length; index++) {
				rights[data.accessible_rights[index].code] = data.accessible_rights[index];
			}
		}
		
		data.accessible_rights = rights;
		$rootScope.store.userInfo = data;
	};
	
	$rootScope.$on("$stateChangeStart", function(event, next, nextparam, current, currentParam) {

		if (!$rootScope.config.authenticationLoaded) {
			$rootScope.config.initial.state = next;
			$rootScope.config.initial.stateParam = nextparam;
			event.preventDefault();
		} else if(!$rootScope.config.isAuthenticated 
				&& (next.name != 'login' && (!next.data || next.data.requireAuthentication != false))) {
			event.preventDefault();
		}
	});
	
	$rootScope.$on('$viewContentLoaded', function(event) {
      $timeout(function() {
//        componentHandler.upgradeAllRegistered();
      });
    });
} ]);