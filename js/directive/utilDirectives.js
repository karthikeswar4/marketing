angular.module('app').directive('fixedContainer', [function() {
	
	return {
		restrict: 'A',
		controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
			
			function isElementInViewport (element) {
				
				var rect = element.getBoundingClientRect();

				var offset = getOffset();
				var windowWidth = ((window.innerWidth || document.documentElement.clientWidth) + offset.left - offset.right);
				var windowHeight = (window.innerHeight || document.documentElement.clientHeight) + offset.top - offset.bottom;
				
				var visible = {};
				visible.top = rect.top >= offset.top && rect.top <= windowHeight;
				visible.left =  rect.left >= offset.left && rect.left <= windowWidth;
				visible.bottom =  rect.bottom >= offset.bottom && rect.bottom <= windowHeight;
				visible.right =  rect.right >= offset.right && rect.right <= windowWidth;
				
				visible.hidden = ((rect.top < offset.top && rect.bottom < offset.bottom) 
									|| (rect.left < offset.left && rect.right < offset.right)
									|| (rect.left > windowWidth && rect.right > windowWidth)
									|| (rect.top > windowHeight && rect.top > windowHeight)
									);
				
				return visible;
			}

			var element = $element[0];
			this.isElementViewable = function() {
				return isElementInViewport(element);
			};
			
			var fixedAttr = $scope.$eval($attrs.fixedAttr) || {};
			var getOffset = function() {
				
				if (!fixedAttr.topOffset) fixedAttr.topOffset = 0;
				if (!fixedAttr.bottomOffset) fixedAttr.bottomOffset = 0;
				if (!fixedAttr.leftOffset) fixedAttr.leftOffset = 0;
				if (!fixedAttr.rightOffset) fixedAttr.rightOffset = 0;
				
				return {
					top: Number(fixedAttr.topOffset), 
					bottom: Number(fixedAttr.bottomOffset), 
					left: Number(fixedAttr.leftOffset), 
					right: Number(fixedAttr.rightOffset), 
				}
			}
			
			var getOrientation = function() {
				if (!fixedAttr.orientation) fixedAttr.orientation = 'TOP';
				return fixedAttr.orientation.toUpperCase();
			}
			
			this.getElementPosition = function() {
				return {
					rect: element.getBoundingClientRect(),
					offset: getOffset(),
					orientation: getOrientation(),
					width: $element.width()
				}
			}
		}]
	}
}]).directive('fixedBar', ['$timeout', function($timeout) {
	
	return {
		restrict: 'A',
		require: '^fixedContainer',
		link: function(scope, element, attrs, fixedContainerCtrl) {
			
			var scrollParent = element.scrollParent();
			var clientRect = element[0].getBoundingClientRect();
			
			var dummyElement = $("<div class='dummy-fixed-bar col-md-12'></div>");
			var setDefaultPosition = function() {
				element.addClass('fixed-bar-inactive');
				dummyElement.css('height', '0');
				element.removeClass('fixed-bar-active');
				element.css({ 'top': '',
					'bottom': '',
					'left': '',
					'right': '',
					'position': '',
					'width':''
				});
			};
			
			var setDummyElementHeight = function(element) {
				dummyElement.css('height', element.outerHeight(true) + 15);
			};
			
			var positionElement = function(event) {
				element.before(dummyElement);
				var elementVisible = fixedContainerCtrl.isElementViewable();
				if (!elementVisible.hidden) {
					
					element.removeClass('fixed-bar-inactive');
					var position = fixedContainerCtrl.getElementPosition();
					var width
					
					switch(position.orientation) {
					case 'TOP':
						if (!elementVisible.top) {
							element.css({ 'position': 'fixed', 'top': position.offset.top, 'left': position.rect.left, 'width': position.width });
							element.addClass('fixed-bar-active');
							setDummyElementHeight(element);
						} else {
							setDefaultPosition();
						}
						break;
					case 'LEFT':
						if (!elementVisible.left) {
							element.css({ 'position': 'fixed', 'left': position.offset.left, 'top': position.rect.top, 'width': position.width });
							element.addClass('fixed-bar-active');
							setDummyElementHeight(element);
						} else {
							setDefaultPosition();
						}
						break;
					case 'BOTTOM':
						if (!elementVisible.bottom) {
							element.css({ 'position': 'fixed', 'bottom': position.offset.bottom, 'left': position.rect.left, 'width': position.width });
							element.addClass('fixed-bar-active');
							setDummyElementHeight(element);
						} else {
							setDefaultPosition();
						}
						break;
					case 'RIGHT':
						if (!elementVisible.right) {
							element.css({ 'position': 'fixed', 'right': position.offset.right, 'top': position.rect.top, 'width': position.width });
							element.addClass('fixed-bar-active');
							setDummyElementHeight(element);
						} else {
							setDefaultPosition();
						}
						break;
					}
					
				} else {
					setDefaultPosition();
				}
			};
			
			var registerEvents = function() {
				scrollParent.on('scroll', positionElement);
				$(window).on('scroll', positionElement);
				$(window).on('resize', positionElement);
			};
			
			scope.$on('$destroy', function() {
				scrollParent.off('scroll', positionElement);
				$(window).off('scroll', positionElement);
				$(window).off('resize', positionElement);
				$(iframe).remove();
			});
			
			var resizeListener = function(eve) {
			    try {
			     /* var evt = document.createEvent('UIEvents');
			      evt.initUIEvent('resize', true, false, window, 0);
			      window.dispatchEvent(evt);*/
			      
			    // create and dispatch the event
			      var event = new CustomEvent("resize", {
			        detail: { windowresize: true }
			      });
			      window.dispatchEvent(event);
			      console.log(eve);
			      
			    } catch(e) {}
			};
			
			var iframe;
			var createIframe = function() {
				iframe = document.createElement('iframe');
				iframe.id = "hacky-scrollbar-resize-listener";
				iframe.style.cssText = 'height: 0; background-color: transparent; margin: 0; padding: 0; overflow: hidden; border-width: 0; position: absolute; width: 100%;';
				iframe.onload = function() {
					iframe.contentWindow.removeEventListener('resize', resizeListener);
					iframe.contentWindow.addEventListener('resize', resizeListener);
				};
				return iframe;
			}
			
			var registerResizeEventListener = function() {
				createIframe();
				document.body.appendChild(iframe);
			};
			
			$timeout(function() {
				positionElement();
				registerEvents();
				registerResizeEventListener();
			});
		}			
	}
}]).directive('number', ['$rootScope', function($rootScope) {
	
	return {
		require: "?ngModel",
		link: function(scope, element, attrs, ngModelController) {
			
			element.on('keypress', function(event) {
				var key =  (event.keyCode ? event.keyCode : event.which);
				var value = element.val(), numericalValue = Number(value);
				var keyChar = String.fromCharCode(key);
				if (key >= 48 && key <= 57) {
					return true;
				}
				event.preventDefault();
			});
		}
	}
}]).directive('numberFormat', ['$rootScope', function($rootScope) {
	
	return {
		require: "?ngModel",
		link: function(scope, element, attrs, ngModelController) {
			
			var userPref = "de-DE";
			if ($rootScope.store && $rootScope.store.userInfo && $rootScope.store.userInfo.user_preferences) {
				userPref = $rootScope.store.userInfo.user_preferences.user_locale.replace("_","-");
			}
			
			var localeNumber = Number(1234567.89).toLocaleString(userPref);
			var decimalPoint = localeNumber.charCodeAt(localeNumber.length - 3);
			var decimalPointCharacter = String.fromCharCode(decimalPoint);
			var maxValue = Number(attrs.max);
			var minValue = Number(attrs.min);
			var allowDecimal = attrs.allowDecimal != "false";
			var localeFormat = attrs.localeFormat != "false";
			var fractionDigits = Number(attrs.fractionDigits || (allowDecimal ? "2" : "0"));
			maxValue = isNaN(maxValue) ? null : maxValue;
			minValue = isNaN(minValue) ? null : minValue;
			fractionDigits = (isNaN(fractionDigits) ? (allowDecimal ? 2 : 0) : fractionDigits);
			
			element.on('keypress', function(event) {
				var key =  (event.keyCode ? event.keyCode : event.which);
				var value = element.val(), numericalValue = Number(value);
				var keyChar = String.fromCharCode(key);
				if (isValidValue(value) && ((key == 45 && (!value || (value && value.toString().indexOf("-") == -1)))
						|| (key == decimalPoint && (!value || (value && value.toString().indexOf(decimalPointCharacter) == -1))) 
						|| (key >= 48 && key <= 57))
						&& (fractionDigits > 0 || (fractionDigits <= 0 && keyChar != decimalPointCharacter))
						&& ((!allowDecimal && keyChar != decimalPointCharacter) || allowDecimal)) {
					element.data('oldValue', value);
					return true;
				}
				event.preventDefault();
			});
			
			var isValidValue = function(value) {
				var numericalValue = Number(value), fractionValue = "", preValue = value, fractionIndex = value.indexOf(decimalPointCharacter);
				if (fractionIndex != -1) {
					fractionValue = value.substr(fractionIndex + 1);
					preValue = value.substr(0, fractionIndex);
				}
				return !((value && maxValue != null && numericalValue > maxValue) || (value && minValue != null && numericalValue < minValue)
						|| (fractionValue && fractionDigits && fractionValue.length > fractionDigits) || preValue.length > 15)
			};
			
			var getNormalizedNumberValue = function(value) {
				var retVal = Number(getNormalizedStringValue(value));
				return isNaN(retVal) ? Number(0) : retVal;
			};
			
			var getNormalizedStringValue = function(value) {
				if (!value) return "0";
				if (decimalPointCharacter == ".") {
					if (String(value).indexOf(",") != -1) value = value.replace(/\,/g,"");
				} else {
					if (String(value).indexOf(".") != -1) value = value.replace(/\./g,"");
					if (String(value).indexOf(",") != -1) value = value.replace(/\,/g,".");
				}
				return value;
			};
			
			element.on('keyup', function(event) {
				var value = element.val();
				var numericalValue = getNormalizedNumberValue(value), fractionValue = "", fractionIndex = value.indexOf(decimalPointCharacter);
				if (fractionIndex != -1) fractionValue = value.substr(fractionIndex + 1);
				var keyCode =  (event.keyCode ? event.keyCode : event.which);
				var oldvalue = element.data('oldValue');
				// comma - 188, dot - 190, dot in  numberpad - 110  => if the user presses decimal point character
				if ((keyCode == 188 || keyCode == 190) && (value.indexOf(decimalPointCharacter) == (value.length - 1))) {
					if (oldvalue == "-") element.val(oldvalue);
					return;
				} else if ((keyCode == 46 || keyCode == 8) && (value.indexOf(decimalPointCharacter) == (value.length - 1))) {
					// delete - 46 / backspace - 8 => if the end contains the decimal point
					element.val( value.substr(0, value.indexOf(decimalPointCharacter)));
				} else if ((keyCode >= 96 && keyCode <= 105) && (isNaN(numericalValue) || !isValidValue(value))) {
					// 96 - 105 for numbers
					element.val( oldvalue == "-" ? "" : oldvalue);
				} else if (keyCode == 109) {
					// 109 -(minus)
					if (value.indexOf("-") != 0) element.val(oldvalue);
					
				} else if (value != "-" && (isNaN(numericalValue) || !isValidValue(value))) {
					var oldvalue = element.data('oldValue');
					element.val( oldvalue == "-" ? "" : oldvalue);
				} else {
					event.preventDefault();
					return;
				}
				updateModelValue();
				//if (ngModelController) ngModelController.$setViewValue(element.val());
				if (scope.$root && !scope.$root.$$phase) scope.$digest();
			});
			
			element.on('blur', function(event) {
				var value = element.val();
				if (value === null || value === undefined || value === "") {
					updateModelValue();
					if (scope.$root && !scope.$root.$$phase) scope.$digest();
					return;
				}
				if (!value) value = getDefaultValue(value);
				var strvalue = getNormalizedStringValue(value).toString(), newValue = "";
				for (var index = 0, length = strvalue.length; index < length; index++) {
					var strval = strvalue.charAt(index);
					if (index != 0 && strval == "-") continue;
					newValue += strval;
				}
				if (newValue == "-" || !isValidValue(newValue)) newValue = "";
				var valueToSet = Number(newValue);
				valueToSet = getLocaleFormattedValue(valueToSet);
				element.val(valueToSet);
				updateModelValue();
				//if (ngModelController) ngModelController.$setViewValue(element.val());
				if (scope.$root && !scope.$root.$$phase) scope.$digest();
			});
			
			element.on('focus', function(event){
				var value = element.val();
				if(!value) return;
				
				if (decimalPointCharacter == ".") {
					//remove ,
					value = value.replace(/\,/g,"");
				}else {
					//remove .
					value = value.replace(/\./g,"");
				}
				
				element.val(value);
				updateModelValue();			
				//if (ngModelController) ngModelController.$setViewValue(element.val());
				if (scope.$root && !scope.$root.$$phase) scope.$digest();
			});
			
			var padZero = function(l,c) {
				return Array(l + 1).join("0");
			}
			
			var updateModelValue = function() {
				if (!ngModelController) return; 
				var value = element.val();
				ngModelController.$setViewValue(value);
				setModelValidity(value);
			}
			
			var setModelValidity = function(value) {
				if (!ngModelController) return; 
				var numberVal = Number(value);
				ngModelController.$validate();
			}
			
			var getDefaultValue = function(value) {
				if (value == null || value == undefined) return "";
				if (!value) return "0" + (allowDecimal && fractionDigits > 0 ? (decimalPointCharacter + padZero(fractionDigits)): "");
				return value;
			}
			
			var getLocaleFormattedValue = function(value) {
				if (!localeFormat || value == undefined || value == null) return value;
				return value.toLocaleString(userPref, { minimumFractionDigits: fractionDigits });
			}
			
			if (!ngModelController) return;
			ngModelController.$parsers.push(function(value) {
				if (value === null || value === undefined || value === "") {
					setModelValidity(0);
					return;
				}
				value = Number(getNormalizedNumberValue(value).toFixed(fractionDigits));
				setModelValidity(value);
				return value;
			});
			
			ngModelController.$formatters.push(function(value) {
				if (!value) {
					value = getDefaultValue(value);
					return value;
				}
				value = Number(Number(value).toFixed(fractionDigits));
				var valueToSet = value;
				if (allowDecimal) {
					valueToSet = value.toString().indexOf(".") < 0 && fractionDigits > 0 ? (value.toString() + "." + padZero(fractionDigits)) : value.toString();
				}
				valueToSet = Number(valueToSet);
				var localValue = getLocaleFormattedValue(valueToSet);
				return localValue;
			});
			
			ngModelController.$validators.required = function(modelValue, viewValue) {
				if (!element.attr('required')) return true;
				var value = getValue(modelValue, viewValue);
				return value != null && value != undefined && value != "" && !isNaN(value);
			};
			
			var getValue = function(modelValue, viewValue) {
				var isModelValueNull = (modelValue == null || modelValue == undefined);
				var isViewValueNull = (viewValue == null || viewValue == undefined);
				if (isModelValueNull && isViewValueNull) return "0";
				if (isModelValueNull && !isViewValueNull) return viewValue || 0;
				return modelValue || 0;
			};
			
			ngModelController.$validators.min = function(modelValue, viewValue) {
				if (minValue == null || modelValue === null || modelValue === undefined || modelValue === "") return true;
				var numberVal = Number(getValue(modelValue, viewValue));
				return  !isNaN(numberVal) && numberVal >= minValue;
			};
			ngModelController.$validators.max = function(modelValue, viewValue) {
				if (maxValue == null || modelValue === null || modelValue === undefined || modelValue === "") return true;
				var numberVal = Number(getValue(modelValue, viewValue));
				return  !isNaN(numberVal) && numberVal <= maxValue;
			};
		}
	}
	
}]).directive('currencyFormat', ['$rootScope', function($rootScope) {
	
	return {
		require: "?ngModel",
		link: function(scope, element, attrs, ngModelController) {
			
			var userPref = "de-DE";
			if ($rootScope.store && $rootScope.store.userInfo && $rootScope.store.userInfo.user_preferences) {
				userPref = $rootScope.store.userInfo.user_preferences.user_locale.replace("_","-");
			}
			
			var localeNumber = Number(1234567.89).toLocaleString(userPref);
			var decimalPoint = localeNumber.charCodeAt(localeNumber.length - 3);
			var decimalPointCharacter = String.fromCharCode(decimalPoint);
			var maxValue = Number(attrs.max);
			var minValue = Number(attrs.min);
			var numberDigits = Number(attrs.numberLength || "-1");
			var fractionDigits = Number(attrs.decimal || "1");
			numberDigits = isNaN(numberDigits) ? null : numberDigits;
			maxValue = isNaN(maxValue) ? null : maxValue;
			minValue = isNaN(minValue) ? null : minValue;
			fractionDigits = isNaN(fractionDigits) ? "1" : fractionDigits;
			
			element.on('keypress', function(event) {
				var key =  (event.keyCode ? event.keyCode : event.which);
				var value = element.val(), numericalValue = Number(value);
				var keyChar = String.fromCharCode(key);
			    if (isValidValue(value) && ((key == 45 && (!value || (value && value.toString().indexOf("-") == -1)))
			    		|| (key == decimalPoint && (!value || (value && value.toString().indexOf(decimalPointCharacter) == -1))) 
			    		|| (key >= 48 && key <= 57))) {
			    	element.data('oldValue', value);
			    	return true;
			    }
			    event.preventDefault();
			});

			var isValidValue = function(value) {
				var numericalValue = Number(value), fractionValue = "", fractionIndex = value.indexOf(decimalPointCharacter);
				if (fractionIndex != -1) fractionValue = value.substr(fractionIndex + 1);
				if (numberDigits && ((fractionIndex == -1 && value.length >= numberDigits) || (fractionIndex != -1 && value.substr(0, fractionIndex).length >= numberDigits))) {
					return false;
				}
				return !((maxValue != null && numericalValue > maxValue) || (minValue != null && numericalValue < minValue) || (fractionValue && fractionDigits && fractionValue.length > fractionDigits))
			};
			
			element.on('blur', function(event) {
				var value = element.val();
				if (!value) return;
				var strvalue = value.toString(), newValue = "";

				for (var index = 0, length = strvalue.length; index < length; index++) {
					var strval = strvalue.charAt(index);
					if (index != 0 && strval == "-") continue;
					newValue += strval;
				}
				if (newValue == "-") newValue = "";
				var temp = newValue;
				if (decimalPointCharacter != ".") {
					temp = newValue.replace(/\,/g, ".");
				}
					
				value = Number(Number(temp).toFixed(fractionDigits));
				
				var valueToSet = value.toString().indexOf(".") < 0 ? (value.toString() + ".0") : value.toString();
				valueToSet = Number(valueToSet);
				element.val(valueToSet.toLocaleString(userPref, { minimumFractionDigits: fractionDigits }));
				if (ngModelController) ngModelController.$setViewValue(element.val());
				if (scope.$root && !scope.$root.$$phase) scope.$digest();
			});
			
			element.on('focus', function(event){
				var value = element.val();
				if(!value) return;
				
				if(decimalPointCharacter == "."){
					//remove ,
					value = value.replace(/\,/g,"");
				}else {
					//remove .
					value = value.replace(/\./g,"");
				}
				
				element.val(value);
				element.select();
				
				if (ngModelController) ngModelController.$setViewValue(element.val());
				if (scope.$root && !scope.$root.$$phase) scope.$digest();
			});
			
			ngModelController.$parsers.push(function(value) {
				if (!value) return 0.0;
				if(decimalPointCharacter == "."){
					if (String(value).indexOf(",") != -1) value = value.replace(/\,/g,"");
				}else {
					if (String(value).indexOf(".") != -1) value = value.replace(/\./g,"");
					if (String(value).indexOf(",") != -1) value = value.replace(/\,/g,".");
				}
				
				value = Number(Number(value).toFixed(fractionDigits));
				return value;
			});
			
			ngModelController.$formatters.push(function(value) {
				if (!value) return "0"+decimalPointCharacter+"0";
				value = Number(Number(value).toFixed(fractionDigits));
				var valueToSet = value.toString().indexOf(".") < 0 ? (value.toString() + ".0") : value.toString();
				valueToSet = Number(valueToSet);
				return valueToSet.toLocaleString(userPref, { minimumFractionDigits: fractionDigits });
			});
		}
	}
	
}]).directive('toggleSlide', [function() {
	
	var linkFn = function(scope, element, attrs) {
		var show = "<i class='glyphicon glyphicon-chevron-down'></i>";
		var hide = "<i class='glyphicon glyphicon-chevron-up'></i>";
		var targetElement = $(attrs.toggleSlide);
		element.on('click', function() {
			targetElement.slideToggle("slow", function() {
				element.html(targetElement.is(":visible") ? hide : show );
			});
		});
		
		element.html(targetElement.is(":visible") ? hide : show );
	};
	
	return {
		link: linkFn
	}
}]).directive('formControl', [function() {
	
	var linkFn = function(scope, element, attrs, ngModelController) {
		var formGroup = element.closest('.form-group');
		var getFormGroup = function() {
			if (!formGroup || formGroup.length == 0) formGroup = element.closest('.form-group');
			return formGroup;
		};
		
		element.on('focus', function() {
			getFormGroup().addClass('is-focussed');
		});
		
		element.on('blur', function() {
			getFormGroup().removeClass('is-focussed');
		});
		
		var toggleClass = function(value) {
			if (value === "" || value === undefined || value === null) {
				getFormGroup().removeClass('has-field-value');
			} else if (element.get(0).nodeName == "SELECT" && value === "?") {
					getFormGroup().removeClass('has-field-value');
			} else {
				getFormGroup().addClass('has-field-value');
			}
		}
		
		if (!ngModelController) return;
		scope.$watch(function() { return ngModelController.$modelValue }, function(value) {
			toggleClass(value);
		});
	};
	
	return {
		restrict: 'C',
		require: '?ngModel',
		link: linkFn
	}
}]).directive('autoCompleteControl', [function() {
	
	var linkFn = function(scope, element, attrs) {
		var formGroup = element.closest('.form-group');
		var getFormGroup = function() {
			if (!formGroup || formGroup.length == 0) formGroup = element.closest('.form-group');
			return formGroup;
		};
		
		element.on('focus', function() {
			getFormGroup().addClass('is-focussed');
		});
		element.on('blur', function() {
			getFormGroup().removeClass('is-focussed');
		});
	};
	
	return {
		restrict: 'C',
		link: linkFn
	}
}]).directive('datePicker',['$parse', '$timeout', function($parse, $timeout) {
	return {
		require: 'ngModel',
		link : function(scope, element, attrs, ngModel) {
			
			var positionDatePicker = function(date, inputElement, event) {
				$timeout(function() {
					if (attrs.datePickerPosition == 'top') {
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
				return dateFormatter.formatDate(getFormattedDate(value), (attrs.datePicker || 'Y-m-d'));
			});
			
			ngModel.$formatters.push(function(value) {
				return dateFormatter.formatDate(getFormattedDate(value), 'd/m/Y');
			});	
			
			var setter = $parse(attrs.ngModel).assign;
			scope.$watch(attrs.ngModel, function(newValue) {
				var value = dateFormatter.formatDate(getFormattedDate(newValue), (attrs.datePicker || 'Y-m-d')) || undefined;
				if (value == newValue) return;
				setter(scope, value);
			});
		}
	}
}]).directive('dateTimePicker',['$parse', function($parse) {
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
				return dateFormatter.formatDate(getFormattedDate(value), (attrs.dateTimePicker || 'Y-m-d H:i'));
			});
			
			ngModel.$formatters.push(function(value) {
				return dateFormatter.formatDate(getFormattedDate(value), 'd/m/Y h:ia');
			});	
			
			var setter = $parse(attrs.ngModel).assign;
			scope.$watch(attrs.ngModel, function(newValue) {
				var value = dateFormatter.formatDate(getFormattedDate(newValue), (attrs.datePicker || 'Y-m-d H:i')) || undefined;
				if (value == newValue) return;
				setter(scope, value);
			});
		}
	}
}]).directive('menuChange',['$rootScope', '$state', function($rootScope, $state) {
	return {
		link : function(scope, element, attrs, ngModel) {
			
			var checkState = function(toState) {
				var state = scope.menu.state;
				if (!state) return;
				
				if (state != toState.name) return;
				element.parents('.collapse').addClass("in");
			};
			
			var initWatches = function() {
				var watch = $rootScope.$on('$stateChangeSuccess', function(event, toState, toStateParams) {
					checkState(toState);
				});
				
				scope.$on('$destroy', function() {
					watch();
				});
			};
			
			var init = function() {
				initWatches();
				checkState($state.$current);
			};
			
			init();
		}
	}
}]).directive('fileSelection', ["$timeout", function($timeout) {
	var templateFn = function() {
		var template = 
		'	<div class="browse-file-component input-group full-width">' +
		'		<input class="form-control file-chooser-input" type="text" ng-model="fileselection.name" readonly>' +
		'		<button class="input-group-addon btn btn-primary browse-button" ng-click="browseFile()" translate="BROWSE" style="min-width: 75px;"></button>' +
		'		<input class="ng-hide file-chooser" type="file" ng-model="importData.importfile">' +
		'	</div>';
		
		return template;
	};
	
	var linkFn = function(scope, el, attrs, ngModel) {
		
		var setViewValue = function(event) {
			var file = (event && event.target && event.target.files) ? event.target.files[0] : ""; 
			ngModel.$setViewValue(file);
			ngModel.$render();
			scope.fileselection = file;
		};
		
		var initWatches = function() {
			
			var fileChooserInput = el.find('input[type=text].file-chooser-input');
			var fileChooser = el.find('input[type=file].file-chooser');
			if (ngModel) {
				scope.$watch(function() { return ngModel.$modelValue }, function(value) {
					if (value) return; 
					fileChooser.val('');
//					fileChooserInput.val('');
					setViewValue();
				});
			}
			
			//change event is fired when file is selected
			el.find('input[type=file].file-chooser').bind('change', function(event) {
				scope.$apply(function() {
					setViewValue(event);
				});
			});
			
			var browseButton = el.find('button.browse-button'), lastStatus = false;
			var resizeButtons = function() {
				lastStatus = fileChooserInput.is(":visible");
				if (!lastStatus) return;
				$timeout(function() {
					var width = browseButton.outerWidth(true) || 0;
					var height = fileChooserInput.height() || 0;
					fileChooserInput.css('width', 'calc(100% - ' + Math.max(width, 75) + 'px)');
					browseButton.height(height);
				});
			};
			
			scope.$watch(function() { return browseButton.outerWidth(true); }, resizeButtons)
			scope.$watch(function() { 
				var currentStatus = fileChooserInput.is(":visible");
				if (!currentStatus) setTimeout(function() { resizeButtons(); });
				return currentStatus;
			}, resizeButtons);
			$(window).resize(resizeButtons);
			resizeButtons();
		};
		
		scope.browseFile = function() {
			$timeout(function() {
				el.find('input[type=file].file-chooser').click();
			}, 10);
		};
		
		var init = function() {
			scope.fileselection = {};
			initWatches();
			scope.form_modal = ngModel;
		};
		
		init();
	}
	
	return {
		require : 'ngModel',
		template: templateFn,
		link : linkFn,
		scope: true
	};
}]).directive('pieChart', [function() {
	
	var defaultOptions = {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie'
		},
		pane: {
			size: '10%'
		},
		tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				showInLegend: true,
				dataLabels: {
					enabled: true,
					distance: 1,
//					format: '<b>{point.name}</b>: {point.percentage:.1f} %',
					format: '{point.percentage:.1f} %',
					style: {
						color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
					}
				}
			}
		},
		series: [{
			name: 'Leads',
			colorByPoint: true,
		}]
	};
	
	var linkFn = function(scope, element, attrs) {
		
		var initChart = function() {
			var options = angular.extend(defaultOptions, scope.options);
			var chart = element.highcharts(options);
		};
		
		var updateChart = function(data) {
			var chart = element.highcharts();
			chart.series[0].setData(data);
		};
		
		var initWatches = function() {
			
			scope.$watch('pieChart', function(value) {
				updateChart(value || []);
			});
		};
		
		var init = function() {
			initWatches();
			initChart();
		};
		
		init();
	};
	
	return {
		link : linkFn,
		scope: {
			pieChart: '=',
			options: '='
		}
	};
	
}]);