angular.module('app').directive('materialUpgrade', ['$timeout', function($timeout) {
	
	return function (scope, element, attrs) {
		$timeout(function() {
			componentHandler.upgradeAllRegistered();
		});
	}
}]).directive('materialModel', ['$timeout', function($timeout) {
	
	return {
		require: 'ngModel',
		link: function (scope, element, attrs, ngModelController) {
			
			var wrapper = element.closest('.mdl-js-textfield')[0];
			if (!wrapper) return;
			var renderer = ngModelController.$render;
			ngModelController.$render = function() {
				renderer();
				if (wrapper.MaterialTextfield) wrapper.MaterialTextfield.checkDirty();
			}
		}
	}	
}]).directive('materialCheckModel', ['$timeout', function($timeout) {
	
	return {
		require: '?ngModel',
		link: function (scope, element, attrs, ngModelController) {
			
			var wrapper = element.closest('.mdl-js-checkbox')[0];
			$timeout(function() {
				if (wrapper.MaterialCheckbox) wrapper.MaterialCheckbox.checkToggleState();
			});
			
			if (!wrapper || !ngModelController) return;
			var renderer = ngModelController.$render;
			ngModelController.$render = function() {
				renderer();
				$timeout(function() {
					if (wrapper.MaterialCheckbox) wrapper.MaterialCheckbox.checkToggleState();
				});
			}
		}
	}	
}]).directive('materialRadioModel', ['$timeout', function($timeout) {
	
	return {
		require: '?ngModel',
		link: function (scope, element, attrs, ngModelController) {
			
			var wrapper = element.closest('.mdl-js-radio')[0];
			$timeout(function() {
				if (wrapper.MaterialRadio) wrapper.MaterialRadio.checkToggleState();
			});
			
			if (!wrapper || !ngModelController) return;
			var renderer = ngModelController.$render;
			ngModelController.$render = function() {
				renderer();
				$timeout(function() {
					if (wrapper.MaterialRadio) wrapper.MaterialRadio.checkToggleState();
				});
			}
		}
	}	
}]).directive('materialRequired', ['$timeout', function($timeout) {
	
	return {
		require: ['^form', 'ngModel'],
		link: function (scope, element, attrs, controllers) {
			
			var wrapper = element.closest('.mdl-js-textfield');
			if (!wrapper) return;
			
			var formController = controllers[0], ngModelController = controllers[1];
			var validateValue = function() {
				if (!formController.$submitted) return;
				var value = ngModelController.$modelValue;
				wrapper.removeClass('is-invalid');
				wrapper.removeClass('material-invalid');
				if (!value) {
					wrapper.addClass('is-invalid material-invalid');
					wrapper.attr('title', 'Field is mandatory');
					return;
				}
				var pattern = attrs.materialPattern;
				if (pattern && !new RegEx(pattern).test(value)) {
					wrapper.addClass('is-invalid material-invalid');
					wrapper.attr('title', 'Value is invalid');
					return;
				}
				wrapper.removeAttr('title');
			};
			
			scope.$watch(attrs.ngModel, validateValue);
			scope.$watch(formController.$name +'.$submitted', validateValue)
		}
	}	
}]).directive('materialFile',[function() {
	  return {
		require : 'ngModel',
		link : function(scope, element, attrs, ngModel) {
		  	
			if (element.attr('type') !== 'file') return;
			
		  	var setViewValue = function(event) {
				ngModel.$setViewValue(event.target.files[0]);
				ngModel.$render();
			};
			
			//change event is fired when file is selected
		  	element.bind('change', function(event) {
				scope.$apply(function() {
					setViewValue(event);
				});
			});
		}
	}
}]).directive('materialDownload',[function() {
	return {
		link : function(scope, element, attrs, ngModel) {
			var link = $("<a target='_blank' style='display: none'></a>");
			$(document.body).append(link);
			element.bind('click', function(event) {
				var location = scope.$eval(attrs.materialDownload);
				if (!location) return;
				link.attr('href', location);
				link[0].click();				
			});
		}
	}
}]).directive('materialDate',['$parse', '$timeout', function($parse, $timeout) {
	return {
		require: 'ngModel',
		link : function(scope, element, attrs, ngModel) {
			
			var positionDatePicker = function(date, inputElement, event) {
				$timeout(function() {
					if (attrs.materialDatePosition == 'top') {
						var docHeight = $(document.body).height();
						var datepickerElement = $(event.currentTarget);
						var elementOffset = inputElement.offset();
						var datepickerHeight = datepickerElement.height();
						datepickerElement.css({top: (elementOffset.top - datepickerHeight - 25)});
					}
				});
			};
			
			var dateTimePicker = element.datetimepicker({
				format:'d/m/Y',
				timepicker:false,
				closeOnDateSelect:true,
				onShow: positionDatePicker
			});
			
			var dateFormatter = new DateFormatter();
			var getFormattedDate = function(value) {
				var date = dateFormatter.parseDate(value, 'd/m/Y');
				if (!date || (date && date.getFullYear() == 1899)) date = Date.parse(value);
				if (isNaN(date)) {
					date = dateFormatter.parseDate(value, 'd/m/Y');
				} else {
					date = new Date(date);
				}
				return date;
			}
			
			ngModel.$parsers.push(function(value) {
				return dateFormatter.formatDate(getFormattedDate(value), (attrs.materialDate || 'Y-m-d'));
			});
			
			ngModel.$formatters.push(function(value) {
				return dateFormatter.formatDate(getFormattedDate(value), 'd/m/Y');
			});	
			
			var setter = $parse(attrs.ngModel).assign;
			scope.$watch(attrs.ngModel, function(newValue) {
				var value = dateFormatter.formatDate(getFormattedDate(newValue), (attrs.materialDate || 'Y-m-d')) || undefined;
				if (value == newValue) return;
				setter(scope, value);
			});
		}
	}
}]).directive('materialDateTime',['$parse', function($parse) {
	return {
		require: 'ngModel',
		link : function(scope, element, attrs, ngModel) {
			var dateTimePicker = element.datetimepicker({
				step: 15,
				format:'d/m/Y H:ia',
				closeOnDateSelect:true
			});
			
			var dateFormatter = new DateFormatter();
			var getFormattedDate = function(value) {
				var date = dateFormatter.parseDate(value, 'd/m/Y H:i');
				if (!date || (date && date.getFullYear() == 1899)) date = Date.parse(value);
				if (isNaN(date)) {
					date = dateFormatter.parseDate(value, 'd/m/Y h:ia');
				} else {
					date = new Date(date);
				}
				return date;
			}
			
			ngModel.$parsers.push(function(value) {
				return dateFormatter.formatDate(getFormattedDate(value), (attrs.materialDateTime || 'Y-m-d H:i'));
			});
			
			ngModel.$formatters.push(function(value) {
				return dateFormatter.formatDate(getFormattedDate(value), 'd/m/Y h:ia');
			});	
			
			var setter = $parse(attrs.ngModel).assign;
			scope.$watch(attrs.ngModel, function(newValue) {
				var value = dateFormatter.formatDate(getFormattedDate(newValue), (attrs.materialDate || 'Y-m-d H:i')) || undefined;
				if (value == newValue) return;
				setter(scope, value);
			});
		}
	}
}]);