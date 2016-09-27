angular.module('app')
	.directive('autoComplete', ['$compile', '$document', '$timeout', '$q', '$filter', '$parse', '$log', function($compile, $document, $timeout, $q, $filter, $parse, $log) {
		
		var templateFn = function(element, attrs) {
			
			var template = '<div class="auto-complete">' +
							'	<a ondragstart="return false" href="javascript:;" class="clearfix auto-complete-control" ng-click="showDropDown()" ng-class="{ focussed: (isInputFocussed || isMouseOver)}" ng-disabled="loadingBackground || ngDisabled" tabindex="{{(loadingBackground || ngDisabled) ?\'-1\': \'\'}}">' +
							'		<div class="icon-down">&#x25BC;</div>' +
							'	</a>' +
							'</div>';
			return template;
		};
		
		var controllerFn = ['$scope', '$element', '$http', '$compile', '$attrs', function($scope, $element, $http, $compile, $attrs) {
			
			$scope.multipleSelection = false;
			$scope.allowFreeTextSelection = ($scope.allowFreeText && $scope.allowFreeText.toLowerCase() == "true") ? true : false;
			$scope.isMandatoryQueryParam = ($scope.mandatoryQuery && $scope.mandatoryQuery.toLowerCase() == "true") ? true : false;
			$scope.hideEmptyDropDown = ($scope.hideEmptyDropDown && $scope.hideEmptyDropDown.toLowerCase() == "true") ? true : false;
			
			var innerTemplate = '<input type="text" class="autocomplete-input form-control" tabindex="-1" ng-model="inputValue" ng-disabled="loadingBackground || ngDisabled">';
			if ($scope.selMultiple && $scope.selMultiple.toLowerCase() == "true") {
				
				$scope.multipleSelection = true;
				innerTemplate = '<div><ul class="list-inline">' +
								'	<li ng-repeat="option in selectedOption track by $index" class="selected-option" ng-class="{ \'last-selected-option\': $last}"><span ng-bind="formatDisplayName(option) | translate"></span><span class="close-option" ng-click="removeOption(option, $index, $event)">x</span></li>' +
								'	<li ng-class="{\'zero-width\': !isInputFocussed }" class="input-list"><input type="text" class="autocomplete-input form-control" tabindex="-1" ng-model="inputValue" ng-disabled="loadingBackground || ngDisabled"></li>' +
								'</ul></div>';
			}
			
			// based on the selectipon type, the content template is modified
			// accordingly
			$element.find('a').prepend($compile(innerTemplate)($scope));
			
			$scope.isFreeText = function() {
				return ($scope.allowFreeText && $scope.allowFreeText.toLowerCase() == "true") ? true : false;
			};
			
			/**
			 * construct the service
			 */
			var getSearchUrl = function() {
				
				var urlPrefix, urlSuffix = '', url = urlPrefix = $scope.searchUrl;				
				if (url.indexOf('?') !== -1) {
					
					var split = url.split('?');
					urlPrefix = split[0];
					urlSuffix = split[1];
				}
				
				// constructs the url with the seacrh text, pageNumber and the
				// total number of data per page.
				urlPrefix += '?q=' + (($scope.searchtext) ? $scope.searchtext : '');
				// pagination related information are appended to the url.
				urlPrefix += '&pgNo=' + $scope.pageNumber++ + '&length=' + $scope.pageCount;						  
				if ($scope.displayField || $scope.searchField) {
					urlPrefix += '&searchField=' + (($scope.searchField) ? $scope.searchField : $scope.displayField);
					urlPrefix += '&sortProp=' + (($scope.searchField) ? $scope.searchField : $scope.displayField);
					urlPrefix += '&sortDir=asc';
				}
				
				return urlPrefix + ((urlSuffix) ? '&' + urlSuffix : '');
			};
			
			
			/**
			 * functionality to search the content based on the given url;
			 */
			var urlSearch = function(timeout) {
				
				var defer = $q.defer();
				if (!$scope.loadingBackground) $scope.loading = true;
				
				if (timeoutResolver) {
					$timeout.cancel(timeoutResolver);
					timeoutResolver = null;
				}
				
				if (searchResolver) {
					searchResolver.resolve();
					searchResolver = null;
				}
				
				timeout = (timeout == undefined || timeout == null) ? 500 : timeout;
				timeoutResolver = $timeout(function() {
					
					if ($scope.isMandatoryQueryParam && !$scope.searchtext) {
						$scope.loading = false;
						defer.reject();
						return;
					}	
					
					searchResolver = $q.defer();
					var options = { timeout: searchResolver.promise };
					
					$http.get(getSearchUrl(), options).then(function(response) {
						
						var data = response.data;
						if (!data) {
							$scope.gotAll = true;
							defer.resolve([]);
							return;
						}
						
						if (!$scope.gotAll) $scope.gotAll = data.length < $scope.pageCount;						
						if ($scope.onResponse) data = $scope.onResponse(data);
						if (!$scope.dropdownOptions) $scope.dropdownOptions = [];
						$scope.dropdownOptions = $scope.dropdownOptions.concat(data);
						$scope.updateDropDown();
						
						defer.resolve(data);
						
					}, defer.reject).finally(function() {						
						$scope.loading = false;						
					});	
					
				}, timeout);				
				
				return defer.promise;
			};			
			
			/**
			 * sets the variable to detect whether the value change is done by
			 * the user or it has been done in the background
			 */
			$scope.setUserChanged = function() {
				$scope.userChanged = true;
			};
			
			/**
			 * whenever the text is enetered in the input box, then the options
			 * should be filtered based on it
			 */
			$scope.search = function(timeout) {
				
				if ($scope.options) {
					$scope.dropdownOptions = $filter('filter')($scope.options, $scope.searchtext);
					$scope.updateDropDown();
				} else if ($scope.searchUrl) {
					
					if (!$scope.gotAll) {						
						return urlSearch(timeout);		
					}					
				}
			};
			
			/**
			 * format the option for the display
			 */
			$scope.formatDisplayName = function(option) {
			
				if (!$scope.displayField || !option) {
					if (option && option.isFreeText) return option.value;				
					return option;
				}
				
				if (option.isFreeText) return option.value;
				if (!$scope.displayGetter) $scope.displayGetter = getModelGetter($scope.displayField);
				return $scope.displayGetter(option);
			};	

			/**
			 * format the option for the value
			 */
			$scope.formatValue = function(option) {
				
				if (!$scope.valueField || !option) {
					if (option && option.isFreeText) return option.value;
					return option;
				}
				
				if (option.isFreeText) return option.value;				
				if (!$scope.valueGetter) $scope.valueGetter = getModelGetter($scope.valueField);				
				return $scope.valueGetter(option);
			};	
			
			$scope.setSelectedOption = function(selectedOption) {
				
				if (!selectedOption && $scope.multipleSelection) selectedOption = [];
				$scope.selectedOption = selectedOption;
				
				if (!$attrs.hasOwnProperty('selectedItem') || !$attrs.selectedItem) return;
				$scope.selectedItem = selectedOption;
			};

			$scope.getSelectedOption = function() {
				if (!$scope.selectedOption && $scope.multipleSelection) $scope.selectedOption = [];
				return $scope.selectedOption;
			};
			
			
			/**
			 * selects the option for the field
			 */
			$scope.selectOption = function(option, index, isModelChange) {
				
				$scope.inputValue = $scope.formatDisplayName(option);
				if ($scope.multipleSelection) {
					
					var selectedOption = $scope.getSelectedOption();					
					var tempResult = shallowCopy(selectedOption);
					var filtered = $filter('filter')(selectedOption, function(opt, index) { return angular.equals(opt, option); });
					if (filtered.length == 0) tempResult.push(option);	
					
					//$scope.selectedOption = tempResult;
					$scope.setSelectedOption(tempResult);
					
				} else {				
					//$scope.selectedOption = option;
					$scope.setSelectedOption(option);
				}
				$scope.hideDropDown();				
				// if the change is done in the background, then the model is
				// set in pristine state,
				// so initially set the pristine state to false and then mark it
				// to true
				(!isModelChange) ? $element.find('a').focus() : $scope.setPristine(false);
				//$scope.updateModelValue($scope.selectedOption);
				$scope.updateModelValue($scope.getSelectedOption());
				// mark the state of the model to pristine
				(isModelChange) ? $scope.setPristine() : '';
				$scope.isMouseOver = false;
			};		
			
			/**
			 * removes the selection from the list
			 */
			$scope.removeOption = function(option, index, event) {
				
				if ($scope.loadingBackground || $scope.ngDisabled || !$scope.getSelectedOption() || !$scope.multipleSelection) return;
				
				var tempResult = shallowCopy($scope.getSelectedOption());
				tempResult.splice(index, 1);
				//$scope.selectedOption = tempResult;
				$scope.setSelectedOption(tempResult);
				
				$scope.updateModelValue($scope.getSelectedOption());
				$scope.setUserChanged();
				$scope.searchtext = '';
				event.stopPropagation();
			};			
			
			// sets the current hover index
			$scope.setIndex = function(index) {
				$scope.moverOptionIndex = index;
			};
			
			$scope.setMouseOver = function(isOverDropDown, index) {
				
				$scope.isMouseOver = isOverDropDown;
				if (index != undefined && index != null) $scope.setIndex(index);
				
				if ($scope.isMouseOver) return;
				$timeout(function() {
					
					if ($scope.isAnchorMouseOver) {
						$element.find('input').trigger("focus");
						return;
					}				
					if (!$scope.isMouseOver && !$scope.isInputFocussed) {
						$scope.inputValue = $scope.formatDisplayName($scope.getSelectedOption());
						$timeout(function() { $element.find('a').trigger("focus"); });
						$scope.hideDropDown();
					}
					
				}, 10);
			};

			$scope.setAnchorMouseOver = function(isOverAnchor) {
				$scope.isAnchorMouseOver = isOverAnchor;
			};
			
			/**
			 * creates a shallow copy of the array
			 */
			var shallowCopy = function(source) {
				
				if (!source || typeof source !== "object") return source;
				
				var dest = [];
				if (Array.isArray(source)) {
					
					for (var index = 0, length = source.length; index < length; index++) {
						dest.push(source[index]); // shallow copy of the array
					}
					
				} else {
					return angular.extend({}, source);
				}
				
				return dest;
			}
			
			
			/**
			 * resets the value of the selection box
			 */
			$scope.resetValue = function() {
				$scope.setSelectedOption();
				$scope.inputValue = ''; // resets the input value to the empty
										// value
				$scope.updateModelValue(null);
				$scope.moverOptionIndex = -1;
			};
			
			/**
			 * checks whether the scope model and the current selectedOption is
			 * equal and return true if equal, otherwise false
			 */
			var isEqualToSelection = function() {
				
				if (!$scope.multipleSelection) return $scope.formatValue($scope.getSelectedOption()) == $scope.model
				if ($scope.model == null || $scope.model == undefined || ($scope.model == "" && $scope.model != false && $scope.model != 0))
					return $scope.getSelectedOption().length == 0;
				
				var modelCopy = shallowCopy($scope.model) || [], optionsCopy = shallowCopy($scope.getSelectedOption()) || [];
				for (var index = 0, length = modelCopy.length; index < length; index++) {
					
					var matchedIndex = _.findIndex(optionsCopy, function(option) { return angular.equals($scope.formatValue(option), modelCopy[index]); } );
					// if the option is available in the selected options simply
					// splice it from the list
					if (matchedIndex != -1) {
						optionsCopy.splice(matchedIndex, 1);
						modelCopy.splice(index--, 1);
						--length;
						continue;
					}
					return false;
				}
				// if any unmatched element is present in the optionsCopy or
				// model copy then return false, if both contains empty element
				// then returns true
				return modelCopy.length == 0 && optionsCopy.length == 0;
			};
			
			/**
			 * starts the loading of the autocomplete directive
			 */
			var startLoading = function() {
				
				if ($scope.loadingBackground) return;
				$scope.loadingBackground = true;
				$element.find('a').append($scope.inputLoading);
			}

			/**
			 * stops the loading of the autocomplete directive
			 */
			var stopLoading = function() {
				$scope.loadingBackground = false;
				if ($scope.inputLoading) $scope.inputLoading.detach();
			}
			
			
			/**
			 * initializes the list of all watches for the auto complete drop
			 * down
			 */
			var initWatches = function() {
				
				// when teh model value is changed, we have to load the drop
				// down with the value
				$scope.$watch('model', function() {
					
					if ($scope.userChanged || isEqualToSelection()) {
						$scope.userChanged = false;
						$scope.setValidity();
						return;
					}
					
					if ($scope.model == undefined || $scope.model == null) {
						$scope.resetValue();
						return;
					}
					
					var selectedOption = $scope.selectedItem, modelValue = $scope.model;
					if (selectedOption) {
						
						if (!$scope.multipleSelection) {
							if (angular.equals($scope.formatValue(selectedOption), modelValue)) {
								$scope.selectOption(selectedOption, 0, true);
								return;
							}
						} else {
						
							var selectedItemsValue = [];
							var model = shallowCopy($scope.model), selectedOptionCopy = shallowCopy(selectedOption);
							// for the multiple selection iterate through the list of options and select the value
							for (var index = 0, length = model.length; index < length; index++) {
								var result = popSelectedValue(selectedOptionCopy, model[index]);				
								if (result) { // if the vaue is available in the list, then remove it from the model,
												// to avoid further iteration for the current model option
									selectedItemsValue.push(result);
									model.splice(index, 1);
									index--; length--;
								}
							}
							
							if (model.length == 0) {
								$scope.setSelectedOption(selectedItemsValue);
								return;
							}
						}
					}
					
					if ($scope.options) {
						selectOptionsByModel();
					} else if ($scope.searchUrl) {
					
						$scope.searchtext = '';
						$scope.setSelectedOption();
						$scope.gotAll = false;
						var value = getSelectedValue($scope.dropdownOptions, $scope.model);
						if (value) {
							$scope.selectOption(value, $scope.moverOptionIndex, true);
						} else { 
							if ($scope.isMandatoryQueryParam) {
								selectUrlOptionForMandatoryQuery(shallowCopy($scope.model));
							} else {
								selectUrlOptionsByModel(shallowCopy($scope.model));
							}
						}
					} else if ($scope.isFreeText()) {
                        var model = shallowCopy($scope.model);
                        if (!$scope.multipleSelection) {
                            $scope.selectOption({ isFreeText: true, value: model }, $scope.moverOptionIndex, true);
                        } else {
                            // for the multiple selection iterate through the list of options and select the value
                            var selectedItemsValue = [];
                            for (var index = 0, length = model.length; index < length; index++) {
                                 selectedItemsValue.push({ isFreeText: true, value: model[index] });
                            }
                            $scope.setSelectedOption(selectedItemsValue, $scope.moverOptionIndex, true);
                        }
					}
				});
				
				$scope.$watch('options', function() {
					$scope.dropdownOptions = $filter('filter')($scope.options, $scope.searchtext);	
					selectOptionsByModel();
				});
			};
			
			/**
			 * gets the selected value from the given optins, by validating with
			 * the scope model.
			 */
			var popSelectedValue = function(dropdownOptions, value) {
				
				if (!dropdownOptions) return;
				
				var isEqual = false;
				var index = _.findIndex(dropdownOptions, function(option) {
					return angular.equals($scope.formatValue(option), value);
				});
				
				return dropdownOptions.splice(index, 1)[0];
			};
			
			/**
			 * for some of the search services the query string is mandatory, hence for mandatory search query
			 */
			var selectUrlOptionForMandatoryQuery = function(model) {
				
				if (!$scope.searchUrl || !model) {
					stopLoading();
					return;
				}					
				
				if (!$scope.multipleSelection) {
					
					$scope.searchtext = model;
					startLoading();
					var promise = $scope.search(0);
					if (!promise) {
						stopLoading();
						return;
					}
					
					promise.finally(function() {
						
						var value = getSelectedValue($scope.dropdownOptions, model);
						if (!value) value = { isFreeText: true, value: model };
						if (value) $scope.selectOption(value, $scope.moverOptionIndex, true);
						stopLoading();
					});
					
				} else {
					
					if (model.length == 0) return;
					startLoading();
					$scope.searchtext = model[0];
					var promise = $scope.search(0);
					if (!promise) {
						stopLoading();
						return;
					}						
					
					promise.finally(function() {
						
						var value = getSelectedValue($scope.dropdownOptions, model[0]);
						if (!value) value = { isFreeText: true, value: model[0] };
						if (value) {
							$scope.selectOption(value, $scope.moverOptionIndex, true);
							$scope.pageNumber = 0;
							$scope.gotAll = false;
						}
						
						model.splice(0, 1);
						stopLoading();
						selectUrlOptionForMandatoryQuery(model);
					});
				}		
			}
			
			/**
			 * select the option by ngmodel
			 */
			var selectOptionsByModel = function() {
				
				if (!$scope.options || $scope.model == null || $scope.model == undefined || ($scope.model == "" && $scope.model != false && $scope.model != 0)) {
					stopLoading();
					return;
				}
				
				if (!$scope.multipleSelection) {
					var value = getSelectedValue($scope.options, $scope.model);				
					if (!value && $scope.isFreeText())  value = { isFreeText: true, value: $scope.model };
					if (value) $scope.selectOption(value, $scope.moverOptionIndex, true);
				} else {
					
					var result = []; // for the multiple selection iterate
										// through the list of options and
										// select the value
					for (var index = 0, length = $scope.model.length; index < length; index++) {
						var value = getSelectedValue($scope.options, $scope.model[index]);				
						if (value) {
							result.push(value);
						} else {
							// if the value is not availabe in the selection list, then splice the value from the model.
							$scope.model.splice(index, 1); 
							index--; length--;
						}						
					}
					
					$scope.setSelectedOption(result);				
				}				
			};
			
			/**
			 * gets the selected value from the given optins, by validating with
			 * the scope model.
			 */
			var getSelectedValue = function(dropdownOptions, value) {
				
				if (!dropdownOptions) return;
				
				var isEqual = false;
				return _.find(dropdownOptions, function(option) {
					return angular.equals($scope.formatValue(option), value);
				});
			};
			
			/**
			 * gets the selected value from the given optins, by validating with
			 * the scope model.
			 */
			var getCaseInsensitiveSelectedValue = function(dropdownOptions, value) {
				
				if (!dropdownOptions) return;
				
				var isEqual = false;
				return _.find(dropdownOptions, function(option) {
					return angular.equals(angular.uppercase($scope.formatValue(option)), angular.uppercase(value));
				});
			};

			/**
			 * select the option by model by fetching the value from the url and
			 * select the corresponding option
			 */
			var selectUrlOptionsByModel = function(model) {
				
				if (!$scope.searchUrl || !model) {
					stopLoading();
					return;					
				}					
				
				startLoading();
				$scope.searchtext = model;
				if ($scope.multipleSelection) {
					$scope.searchtext = model[0];
				}
				var promise = $scope.search(0);
				if (!promise && !$scope.gotAll) {
					stopLoading();
					return;
				}
				
				if ($scope.gotAll) {
					
					// if the options are preloaded, then no need of invoking
					// the service call
					if (!$scope.multipleSelection) {
						
						var value = getSelectedValue($scope.dropdownOptions, model);
						if (!value && $scope.isFreeText()) value = { isFreeText: true, value: $scope.model }; 
						if (value) $scope.selectOption(value, $scope.moverOptionIndex, true);
						
					} else {
						try {
							var value = loadUrlOptions(data, model);
							var caseInsensitiveValue = loadCaseInsensitiveUrlOptions(data, model);
							if (value) {
								$scope.setSelectedOption($scope.getSelectedOption().concat(value));
							} else if (caseInsensitiveValue) {
								$scope.setSelectedOption($scope.getSelectedOption().concat(caseInsensitiveValue));
							}
						} catch(e) {}
						
					}
					
					stopLoading();
					
				} else if (promise.then) {
					
					promise.then(function(data) {
						
						var value = loadUrlOptions(data, model);
						var caseInsensitiveValue = loadCaseInsensitiveUrlOptions(data, model);
						// if the value is not available in the current drop
						// down list, then fetch the next page of data and
						// search in that page
						
						if (!$scope.multipleSelection) {
							
							if (value) {
								$scope.selectOption(value, $scope.moverOptionIndex, true);
								stopLoading();
							} else if (caseInsensitiveValue && $scope.gotAll) {
									$scope.selectOption(caseInsensitiveValue, $scope.moverOptionIndex, true);
									stopLoading();
							} else if (!$scope.gotAll) {
								stopLoading();
								selectUrlOptionsByModel(model);
							} else if ($scope.gotAll) {
								$scope.selectOption({ isFreeText: true, value: $scope.model }, $scope.moverOptionIndex, true);
								stopLoading();
							} else {
								stopLoading();
							}							
							
							return;
						}
												
						if (!value) {
							value = { isFreeText: true, value: model[0] };
							model.splice(0, 1);
						}
						$scope.setSelectedOption($scope.getSelectedOption().concat(value));
						$scope.pageNumber = 0;
						$scope.gotAll = false;
						
						if (model.length !== 0) selectUrlOptionsByModel(model);
						stopLoading();
						
					}, function(data) {
						if (data.config.timeout && data.config.timeout.$$state.status) return;
						if (!$scope.multipleSelection) {
							$scope.selectOption({ isFreeText: true, value: $scope.model }, $scope.moverOptionIndex, true);
						} else {
							var selectedOptions = [];
							for (var index = 0; index < $scope.model.length; index++) {
								selectedOptions.push({ isFreeText: true, value: $scope.model[0] });
							}
							$scope.selectOption(selectedOptions, $scope.moverOptionIndex, true);
						}
						stopLoading();
					});
				}
			};
			
			// loads the value from the options
			var loadUrlOptions = function(options, model) {
				
				var value;
				if (!$scope.multipleSelection) {
					value = getSelectedValue(options, model);
				} else {
					
					// for the multiple selection iterate through the list of
					// options and select the value
					for (var index = 0, length = model.length; index < length; index++) {
						var result = getSelectedValue(options, model[index]);				
						if (result) { // if the vlaue is available in the
										// list, then remove it from the model,
										// to avoid further iteration for the
										// current model option
							
							if (!value) value = [];
							value.push(result);
							model.splice(index, 1);
							index--; length--;
						}
					}
				}
				
				return value;
			};
			
			// loads the value from the options
			var loadCaseInsensitiveUrlOptions = function(options, model) {
				
				var value;
				if (!$scope.multipleSelection) {
					value = getCaseInsensitiveSelectedValue(options, model);
				} else {
					
					// for the multiple selection iterate through the list of
					// options and select the value
					for (var index = 0, length = model.length; index < length; index++) {
						var result = getCaseInsensitiveSelectedValue(options, model[index]);				
						if (result) { // if the vlaue is available in the
							// list, then remove it from the model,
							// to avoid further iteration for the
							// current model option
							
							if (!value) value = [];
							value.push(result);
							model.splice(index, 1);
							index--; length--;
						}
					}
				}
				
				return value;
			};
			
			/**
			 * constructs the getter for the given string
			 */
			var getModelGetter = function(modelString) {
				
				if (!modelString) return;
				return $parse(modelString);
			};			
			
			/**
			 * initializes the drop down boxes
			 */
			var init = function() {
				
				$scope.setIndex(-1);
				$scope.searchtext = '';
				$scope.pageNumber = 0;
				$scope.pageCount = 30;
				$scope.dropdownOptions = [];
				$scope.userChanged = false;
				$scope.inputLoading = $('<div class="loading-icon spinner-container"><div class="spinner"></div></div>');
				
				$scope.displayGetter = getModelGetter($scope.displayField);				
				$scope.valueGetter = getModelGetter($scope.valueField);
				
				initWatches();
			};
			var searchResolver, timeoutResolver;
			
			init();
		}];
		
		/**
		 * linking function for the drop down
		 */
		var linkFn = function(scope, element, attrs, controllers) {
			
			
			/**
			 * create a random guid and return the created guid
			 */
			var createdGuid = function() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				    return v.toString(16);
				});
			};
		
			var formCtrl = controllers[0], modelCtrl = controllers[1];
			if (modelCtrl) { // checks whether the name for the form is given
								// is not given create a custom guid and assign
								// it to the componenet
				
				var name = scope.name;
				if (!name) name = createdGuid();
				modelCtrl.$name = name;
				modelCtrl.$parsers.push(function(value) {
					
					if (!scope.multipleSelection || !value) return scope.formatValue(value);
					
					var result = [];
					for (var index = 0; index < value.length; index++) {
						result.push(scope.formatValue(value[index]));
					}		
					
					return result;
				});
			}	

			// adds the model to the form controller
			if (formCtrl && modelCtrl) {				
				formCtrl.$addControl(modelCtrl);
			}
			
			/**
			 * sets the pristine state for the model
			 */
			scope.setPristine = function(ispristine) {
				
				if (!modelCtrl) return;
				if (ispristine == undefined || ispristine == null || ispristine == true) {
					modelCtrl.$setPristine();
					return;
				}
				modelCtrl.$pristine = false;				
			};
			
			/**
			 * sets the validity messages for the drop down
			 */
			scope.setValidity = function() {

				if (scope.required || scope.ngRequired) {
					
					var required = !!scope.getSelectedOption();
					if (scope.multipleSelection) required = scope.getSelectedOption().length !== 0;
					modelCtrl.$setValidity('required', required);
				}
			};
			
			/**
			 * updates the model value with the selected option
			 */
			scope.updateModelValue = function(option) {				
				if (!modelCtrl) return;					
				modelCtrl.$setViewValue(option);
				scope.setValidity();
			};
			
			
			/**
			 * constructs the drop down html element
			 */
			var constructDropDown = function() {
				
				var dropdown = '<div class="auto-complete-dropdown ' + scope.name +'-autocomplete-dropdown" loading="loading" ng-mouseenter="setMouseOver(true)" ng-mouseleave="setMouseOver(false)">' +
							'	<ul class="list-unstyled">' + 
							'		<li ng-repeat="option in dropdownOptions track by $index" ng-class="{\'active\': $index == moverOptionIndex}" ng-mouseover="setIndex($index)" ng-click="setUserChanged();selectOption(option, index);" ng-bind="formatDisplayName(option) | translate"></li>' +
							'	</ul>' +
							'</div>';
				$compile(dropdown)(scope, function(iElement) {
					dropDownElement = iElement;
				});
			};
			
			/**
			 * updates the query param
			 */
			scope.updateDropDown = function() {
				
				if (!scope.isMandatoryQueryParam && !scope.hideEmptyDropDown) return;
				if (!scope.dropdownOptions || scope.dropdownOptions.length == 0) {
					dropDownElement.addClass('hideDropdown');
				} else {
					dropDownElement.removeClass('hideDropdown');
				}
			}
			
			
			/**
			 * position the drop down as per the position of the drop down.
			 */
			var positionDropDown = function() {
				
				// if the drop down element is not available then simply return
				// it without resizing
				if (!dropDownElement) return;
				scope.updateDropDown();
				var anchor = element.find('a');
				var offset = anchor.offset();
				var style = { top: (offset.top + anchor.height() + 3), left: offset.left };
				//style.width = anchor.width();
				style.minWidth = anchor.width();
				
				dropDownElement.css(style);
			};
			
			/**
			 * When the focus to the input field is lost, then the drop down
			 * should be removed
			 */
			var blurEvent = function(event) {				
				if (scope.isMouseOver) return;
				if (scope.isFreeText() && !scope.multipleSelection && scope.formatDisplayName(scope.getSelectedOption()) != scope.inputValue) {
					scope.selectOption({ isFreeText: true, value: scope.inputValue } , scope.moverOptionIndex);		
				}
				if (!scope.multipleSelection) scope.inputValue = scope.formatDisplayName(scope.getSelectedOption());
				scope.hideDropDown();
				// if the digest phase i snot already inprogress, then digest
				// the cycle.
				if (!scope.$root.$$phase) scope.$digest();
			};
			
			
			/**
			 * events are binded, while showing the drop down for options list
			 */
			var bindEvents = function() {
				
				// binding a event to the docuemnt, whenever the docuemtn is
				// resized then the drop down should be positioned accordingly
				$(window).resize(positionDropDown);
				element.find('input').bind('blur', blurEvent);
			};

			/**
			 * events which are all binded, while showing the drop down for
			 * options list, should be unbinded
			 */
			var unbindEvents = function(event) {
				
				// unbinding a event to the document, whenever the docuemtn is
				// resized then the drop down should be positioned accordingly
				$(window).unbind('resize', positionDropDown);
				element.find('input').unbind('blur', blurEvent);
				if (event && event.name == '$destroy') {
					
					dropDownElement.remove();
					return;
				}
				
				if (!scope.$root.$$phase) {
					scope.$digest();
				}
			};
			
			
			/**
			 * shows the dropdown
			 */
			scope.showDropDown = function(skipInputSelect) {
				
				if (scope.loadingBackground || scope.ngDisabled) return;
								
				scope.searchtext = '';
				scope.gotAll = false;
				var inputElement = element.find('.autocomplete-input');
				// if any character is eneter in the text box, search the data
				// based on the entered value
				var inputValue = inputElement.val();
				element.find('input').focus();
				if (scope.isMandatoryQueryParam) {
					if (!inputValue) return;
				};
				
				positionDropDown(dropDownElement);
				$document.find('body').append(dropDownElement);
				isDropDownShown = true;
				if (skipInputSelect !== true) {
					element.find('input').select();
				}
				
				bindEvents();					
				$timeout(function() {
					
					scope.dropdownOptions = [];
					if (scope.multipleSelection && scope.getSelectedOption().length != 0) {		
						var list = element.find('ul');
						list.scrollTop(list[0].scrollHeight);
						positionDropDown();
					}
					
					searchInput(true);
				});
			};
			
			/**
			 * invoke the search service based on the data enetered in the text
			 * field
			 */
			var searchInput = function(useSearchText) {
				
				if (scope.isMandatoryQueryParam && !isDropDownShown) {
					scope.showDropDown(true);
					return;
				}
				
				if (!scope.isMandatoryQueryParam && initalLoading) {
					initalLoading = false;
					scope.search();
					return;
				}
				
				var inputElement = element.find('.autocomplete-input');
				// if any character is eneter in the text box, search the data
				// based on the entered value
				var inputValue = inputElement.val();
//				if (scope.searchtext !== inputValue) {
					
					scope.pageNumber = 0; // since the entered value is new
											// one, reinitialize the pageNumber
					scope.dropdownOptions = [];
					scope.gotAll = false;
					if (scope.isMandatoryQueryParam || !useSearchText) scope.searchtext = inputValue;
					scope.search();
					scope.updateDropDown();
//				}
			};
			
			
			/**
			 * hides the drop down
			 */
			scope.hideDropDown = function() {
				// if the drop down is not available, then no need of hiding the events
				if (!dropDownElement) return;				
				dropDownElement.detach();
				isDropDownShown = false;
				unbindEvents();
				scope.loading = false;				 
				
				if (scope.multipleSelection) {
					
					scope.inputValue = '';
					$timeout(function() {
						
						if (scope.getSelectedOption().length == 0) return;
						var list = element.find('ul');
						list.scrollTop(0);
						dropDownElement.css('top', (parseInt(dropDownElement.css('top')) + element.find('input').height()));
					});
				}				
			};
			
			/**
			 * Move to the next element than the current selection
			 */
			var moveNext = function() {
				
				if (scope.moverOptionIndex == (scope.dropdownOptions.length - 1)) return;
				
				var index = Math.min((scope.moverOptionIndex + 1), (scope.dropdownOptions.length - 1));
				scope.setIndex(index);
				if (!scope.multipleSelection && !isDropDownShown) scope.selectOption(scope.dropdownOptions[scope.moverOptionIndex], scope.moverOptionIndex);
				
				var optionElem = dropDownElement.find('li:nth-child(' + (scope.moverOptionIndex + 1) + ')'), position = optionElem.position();				
				var optionHeight = optionElem.height(), dropDownHeight = dropDownElement.innerHeight();				
				
				if (position && (position.top < 0 || (position.top + optionHeight) > dropDownHeight)) {
					var scrollTop = optionElem.offset().top + optionHeight - dropDownElement.find('ul').offset().top - dropDownHeight;
					dropDownElement.scrollTop(scrollTop);
				}
			};
			
			
			/**
			 * Move to the previous element than the current selection
			 */
			var movePrevious = function() {
				
				if (scope.moverOptionIndex == 0) return;
				var index = Math.max((scope.moverOptionIndex - 1), 0);
				scope.setIndex(index);
				if (!scope.multipleSelection && !isDropDownShown) scope.selectOption(scope.dropdownOptions[scope.moverOptionIndex], scope.moverOptionIndex);
				
				var optionElem = dropDownElement.find('li:nth-child(' + (scope.moverOptionIndex + 1) + ')');
				var scrollTop = optionElem.position().top;
				if (optionElem.position().top < 0) {
					dropDownElement.scrollTop(dropDownElement.scrollTop() + scrollTop);
				}
			};
			
			
			/**
			 * binds the list of all events for the auto complete drop down
			 */
			var bindAutoCompleteEvents = function() {
				
				var inputElement = element.find('.autocomplete-input');
				var anchorElement = element.find('a'); 
				var listElement = element.find('a ul'); 
				var CONTROL_KEYS = [9, 16, 17, 18, 20, 91, 93];
				anchorElement.bind('keydown', function(event) {
					
					if (scope.loadingBackground || scope.ngDisabled) return;
					if (event.which == 38) { // up arrow 38
						movePrevious();
						event.preventDefault();
					} else if (event.which == 40) { // down arrow 40
						
						if ((scope.dropdownOptions.length - 1) == scope.moverOptionIndex) {
							// if the user scrolls to the end of the drop down,
							// then loads the next user data
							var promise = scope.search();
							if (promise && promise.then) promise.then(moveNext);
							
						} else {
							moveNext();
						};
						event.preventDefault();
					} else if (event.which == 46) { // delete button
						if (scope.allowRemove == 'false') return;
						if(!scope.multipleSelection) scope.resetValue();
					} else if (CONTROL_KEYS.indexOf(event.which) == -1) {
						scope.showDropDown();
					}
				});
				
				anchorElement.bind('blur', function(event) {
					scope.isInputFocussed = false;
				});
				
				anchorElement.bind('mouseenter mouseleave', function(event) {
					scope.setAnchorMouseOver(event.type == "mouseenter");
				});
				
				// On key press in the input element, the event handler function
				// defeined for different keys
				inputElement.bind('keydown', function(event) {					
					
					if (scope.loadingBackground || scope.ngDisabled) return;
					if (event.which == 9) { // tab 9
						
						var prevSelectedValue = scope.formatDisplayName(scope.getSelectedOption());
						if (scope.isFreeText() && prevSelectedValue != scope.inputValue) {
							scope.selectOption({ isFreeText: true, value: scope.inputValue } , scope.moverOptionIndex);		
						}
						scope.inputValue = scope.formatDisplayName(scope.getSelectedOption());
						$timeout(function() { anchorElement.focus(); });
						scope.hideDropDown();
						
					} else if (event.which == 13) { // enter 13
						
						if (scope.moverOptionIndex >= 0 && scope.moverOptionIndex < scope.dropdownOptions.length) {
							scope.selectOption(scope.dropdownOptions[scope.moverOptionIndex], scope.moverOptionIndex);
						} else if (scope.isFreeText()) {
							scope.selectOption({ isFreeText: true, value: scope.inputValue } , scope.moverOptionIndex);							
						} else if (!scope.multipleSelection) {
							scope.inputValue = scope.formatDisplayName(scope.getSelectedOption());
						}
						
						$timeout(function() { anchorElement.focus(); });
						
					} else if (event.which == 38) { // up arrow 38
						movePrevious();
					} else if (event.which == 40) { // down arrow 40
						moveNext();
					} else if (event.which == 27) { // escape 27
						
						scope.inputValue = scope.formatDisplayName(scope.getSelectedOption());
						$timeout(function() { anchorElement.focus(); });
						scope.hideDropDown();
					} else if (event.which == 46 && !scope.multipleSelection) { // delete
																				// button
						if (scope.allowRemove == 'false' || scope.allowRemove == false) return;
						scope.resetValue();
					} else if (event.which == 8 && scope.multipleSelection) { // backspace
																				// button
						if (!inputElement.val() && scope.getSelectedOption()) scope.getSelectedOption().pop();
						$timeout(searchInput);
					} else {
						$timeout(searchInput);
					}					
					
					scope.$digest();
					event.stopPropagation();
				});
				
				inputElement.bind('focus blur', function(event) {
					scope.isInputFocussed = (event.type == 'focus');
					if (!scope.multipleSelection) return;
					if (scope.isInputFocussed) {
						
						var width = listWidth = listElement.innerWidth();
						var lastSelectedOption = listElement.find('li.last-selected-option');
						if (lastSelectedOption.length !== 0) {
							width -= lastSelectedOption.position().left;
							width -= lastSelectedOption.outerWidth(true);
							width -= 20;
						}
						if (width < 100) width = (listWidth - 20);
						inputElement.outerWidth(width);
						
						return;
					}
					inputElement.css('width', '0px');					
				});
				
				// if the drop down is scrolled to the bottom of the element,
				// then it should fetch next page set of elements
				dropDownElement.bind('scroll', function() {
					
					if (scope.infiniteScrolling == "false" || scope.infiniteScrolling == false) return;
					if (dropDownElement.scrollTop() + dropDownElement.innerHeight() >= dropDownElement[0].scrollHeight) {
						scope.search(); // if the user scrolls to the end of the
										// drop down, then loads the next user
										// data
					}
				});
			};			
			
			var initWatches = function() {
				scope.$on('$destroy', unbindEvents);
			};
			
			
			/**
			 * initializes the drop down linkFn
			 */
			var dropDownElement, isDropDownShown = false, initalLoading = true;
			var init = function() {
				constructDropDown(); // constructs the drop down html
				bindAutoCompleteEvents(); // bind the required events to the
											// drop down
				initWatches();		// intializes the watches for the drop down
			};
			
			init();
		};
	
		return {
				restrict: 'E',
				template: templateFn,				
				scope: {
					name: '@',
					searchUrl: '@',
					model: '=ngModel', 
					options: '=',
					searchField: '@',
					displayField: '@',
					valueField: '@',
					required: '@',
					ngRequired: '=',
					ngDisabled: '=',
					selMultiple: '@',
					allowFreeText: '@',
					mandatoryQuery: '@',
					hideEmptyDropDown: '@',
					selectedItem: '=',
					allowRemove: '@',
					infiniteScrolling: '@',
					onResponse: '='
				},
				link: linkFn,
				controller: controllerFn,
				require: ['?^form', '?ngModel']
			};
	}]).directive('loading', function() {		
	
		return function(scope, element, attrs) {
			
			var template = $('<div class="spinner-container"><div class="spinner"></div></div>');
			var spinner = template.find('.spinner');
			// position the spinner element according to the parent
			var positionSpinner = function() {
				
				var styles = { top: element.offset().top, 
				               height: element.outerHeight(), 
				               left: element.offset().left, 
				               width: element.outerWidth() 
				             };
				
				
				if (styles.height < 35 || styles.width < 35) {
					spinner.css({ height: 20, width: 20 });
				}
				template.css(styles);
			};
			
			scope.$watch(function() { return scope.$eval(attrs.loading); }, function(value) {
					
				if (value) {
					positionSpinner();
					$('body').append(template);
				} else {
					template.detach();
				}
			});
			
			scope.$on('destroy', function() {
				template.remove();
			});
		};	
	});