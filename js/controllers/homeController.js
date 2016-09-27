app.controller("HomeController", [ '$scope', '$window', '$rootScope', '$state', '$filter', '$timeout', '$element', function($scope, $window, $rootScope, $state, $filter, $timeout, $element) {
	
	var loadMenusList = function() {
		$scope.baseConfig.menus = [{
			name: 'Dashboard',
			state: 'home.dashboard'
		}, {
			name: 'Leads',
			state: 'home.leads'
		}, {
			name: 'Opportunities',
			state: 'home.opportunities'
		}, {
			name: 'Activities',
			state: 'home.task'
		}, {
			name: 'Campaign',
			state: 'home.campaign'
		}, {
			name: 'Contacts',
			state: 'home.contact'
		}, {
			name: 'Products',
			state: 'home.product'
		}, {
			name: 'Users',
			state: 'home.user'
		}, {
			name: 'Administration',
			state: 'home.admin'
		}];
	};
	
	var initHomeState = function() {
		
		if ($state.$current.name == 'home') {
			$state.go('home.dashboard');
			return;
		};
	};
	
	var initContentSection = function() {
		
		/*$timeout(function() {
			var mainContent = $('.main-content');
			var leftmenu = mainContent.find('.left-bar');
			var contentArea = mainContent.find('.content-area');
			contentArea.css('width', leftmenu.width());
		});*/
	};
	
	var initContentWindowHeight = function() {
		$timeout(function() {
			var windowHeight = ($($window).height() - 87);
			$element.find('.main-content-pane').css('min-height', Math.max(450, windowHeight));
			/*$element.find('.left-bar').css('min-height', Math.max(450, windowHeight));
			$element.find('.content-area').css('min-height', Math.max(450, windowHeight));*/
		});
	};
	
	var evaluateSecurityRights = function(leftMenus, module) {
		var userInfo = $rootScope.store.userInfo;
		if (!leftMenus || !userInfo 
				|| !userInfo.accessible_rights) {
			return [];
		}
		var newMenus = []; 
		for (var index = 0; index < leftMenus.length; index++) {
			var menu = leftMenus[index];
			if (menu.submenus) {
				menu.submenus = evaluateSecurityRights(menu.submenus, (menu.security_code || module));
			}
			var accessibleMenus = userInfo.accessible_rights[menu.security_code || module];
			if (menu.security_code) {
				if (accessibleMenus && ((menu.action == 'menu' && menu.submenus && menu.submenus.length > 0) 
						|| (menu.action == 'view' && accessibleMenus.view)
						|| (menu.action == 'create' && accessibleMenus.create)
						|| (menu.action == 'update' && accessibleMenus.update)
						|| (menu.action == 'delete' && accessibleMenus.delete))) {
					newMenus.push(menu);
				} else {
					continue;
				}
			} else {
				newMenus.push(menu);
			}
		}
		return newMenus;
	};
	
	$rootScope.setLeftMenu = function(leftMenus, module) {
		$scope.baseConfig.leftMenus = evaluateSecurityRights(leftMenus, module);
		return $scope.baseConfig.leftMenus;
	};
	
	$rootScope.toggleLeftMenu = function() {
		$rootScope.baseConfig.slideLeftMenu = !$rootScope.baseConfig.slideLeftMenu;
		localStorage.setItem('marketing_left_menu', $rootScope.baseConfig.slideLeftMenu);
	};
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$rootScope.baseConfig = {};
		var savedMenu = localStorage.getItem('marketing_left_menu');
		$rootScope.baseConfig.slideLeftMenu = savedMenu == "true" || savedMenu == true;
		loadMenusList();
		initHomeState();
		initContentSection();
		initContentWindowHeight();
	};
	
	init();
} ]);