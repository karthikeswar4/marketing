angular.module('app').directive('fieldSecurity', ['$rootScope', function($rootScope) {
	
	
	var linkFn = function(scope, element, attrs) {
		
		var disableField = function() {
			element.closest('.form-group').removeAttr('rights-hidden');
			element.attr('rights-readonly', 'readonly')
			element.attr('rights-disabled', 'disabled')
			element.parent('label').attr('rights-readonly', 'readonly')
			element.parent('label').attr('rights-disabled', 'disabled')
		};
		
		var enableField = function() {
			element.closest('.form-group').removeAttr('rights-hidden');
			element.removeAttr('rights-readonly')
			element.removeAttr('rights-disabled')
			element.parent('label').removeAttr('rights-readonly')
			element.parent('label').removeAttr('rights-disabled')
		};

		var hideField = function() {
			element.closest('.form-group').attr('rights-hidden');
		};

		var evaluateSecurity = function() {
			var userInfo = $rootScope.store.userInfo;
			var accessibleMenus = userInfo.accessible_rights;
			if (scope.disable || !accessibleMenus || !accessibleMenus[scope.module]) {
				disableField();
				return;
			}
			
			var moduleRights = accessibleMenus[scope.module];
			if (moduleRights.create && !scope.dataId) {
				enableField();
			} else if (moduleRights.update && scope.dataId) {
				enableField();
			} else if (moduleRights.view) {
				disableField();
			} else {
				hideField();
			}
				
		};
		
		var initWatches = function() {
			
			scope.$watch('[dataId, disable]', function(newValue, oldValue) {
				if (oldValue == newValue) return;
				evaluateSecurity();
			});
		};
	
		var init = function() {
			initWatches();
			evaluateSecurity();
		};
		
		init();
	};
	
	return {
		restrict: 'A',
		link: linkFn,
		scope: {
			module: '@fieldSecurity',
			dataId: "=fieldSecurityDataId",
			disable: "=fieldSecurityDisabled"
		}
	}
}]);