angular.module('app').service("Utils", [ '$timeout', '$state', '$stateParams', '$q', '$uibModal', '$translate', function($timeout, $state, $stateParams, $q, $uibModal, $translate) {
	this.success = function(data, status, headers, config) {
		var msg;
		if (data.msg != undefined && data.msg != null) {
			msg = data.msg;
		} else {
			msg = "Record saved/updated successfully.";
		}
		this.throwMessage(msg, 'success');
	};

	this.warning = function(msg) {
		this.throwMessage(msg, 'warning');
	};

	this.info = function(msg) {
		this.throwMessage(msg, 'info');
	};

	this.error = function(data, status, headers, config) {

		if (!data && status == 403) {
			this.throwMessage("You don't have privilege for this operation.", 'error');
			return "You don't have privilege for this operation.";
		}

		if (!data) {
			this.throwMessage('Unknown Error', 'error');
			return 'Unknown Error';
		}

		var msg = '';
		if (typeof data.validationErrors != 'undefined' && data.validationErrors != null && data.validationErrors.length > 0) {
			angular.forEach(data.validationErrors, function(error, index) {
				msg += error.message;
				if (index != (data.validationErrors.length - 1))
					msg += ', '
			});
		} else {
			msg = data;
		}
		this.throwMessage(msg, 'error');
		return msg;
	}

	var notificationContainer = $('#notification'), timeoutCanceller;
	this.throwMessage = function(message, type, messageParams) {

		if (message == '' || message == null || message == undefined) {
			return;
		}

		var _this = this;
		var closeOnClick = function() {
			_this.closeNotifications();
			notificationContainer.find('.popover').off('click', closeOnClick)
		}
		
		var _msg = $translate(message, messageParams).then(function(translation) {
			/**
			 * default options for popover
			 */
			var popOverOptions = {
				trigger : "manual",
				placement : "top",
				container: '#notification',
				content : translation,
				html : true,
				template : "<div class=\"popover\"><div class=\"popover-content\" ><p ></p></div></div>"
			};
			
			_this.closeNotifications();
			var $popover = notificationContainer.popover(popOverOptions);
			var popup = notificationContainer.popover("show");

			var popoverHtml = notificationContainer.find('.popover');
			popoverHtml.addClass(type);
			popoverHtml.on('click', closeOnClick);
		});
		
		// remove fade class, inorder to prevent transition
		notificationContainer.find('.popover').removeClass('fade');
		_this.closeNotifications();
		if (timeoutCanceller) {
			$timeout.cancel(timeoutCanceller);
			timeoutCanceller = null;
		}
			
		if (type === 'success' || type === 'info' || type == 'warning') {
			timeoutCanceller = $timeout(function() {
				_this.closeNotifications();
			}, 6000);
			return;
		}
	};
	
	this.closeNotifications = function() {
		var popovers = notificationContainer.find('.popover');
		if (popovers.length !== 0) {
			// remove fade class, inorder to prevent transition
			popovers.removeClass('fade');
			notificationContainer.popover("destroy");
			popovers = notificationContainer.find('.popover');
			if (popovers.length !== 0) {
				popovers.remove();
				notificationContainer.removeAttr('aria-describedby');
			}			
		}
	};

	this.go = function(state, params) {
		$state.go(state, params);
	};

	this.toDateString = function(data, format) {

		if (!data)
			return "";

		var date;
		if (typeof data == "number") {
			date = new Date(data);
		} else {
			date = new Date(Date.parse(data));
		}
		format = format || "dd/mm/yyyy";
		return date.format(format);
	}

	this.toDate = function(data) {

		if (!data) return "";
		if (typeof data == "number") {
			return new Date(data);
		} else {
			var defaultparse = Date.parse(data);
			if (isNaN(defaultparse)) {
				return null;
			}
			return new Date(defaultparse);
		}
	}
	
	this.getFormattedDate = function(dateObj) {
		if (!dateObj) return null;
		return dateObj.getFullYear() + "/" + addZero(dateObj.getMonth() + 1) + "/" + addZero(dateObj.getDate()) + " " + addZero(dateObj.getHours()) + ":" + addZero(dateObj.getMinutes()) + ":" + addZero(dateObj.getSeconds());
	}

	function addZero(i) {
	    if (i < 10) {
	        i = "0" + i;
	    }
	    return i;
	}
	
	/**
	 * shows the confirmation dialog for the given message and returns the
	 * promise,
	 * 
	 */
	var confimDialog = $('#confirmDialog');
	this.showConfirmation = function(confirmMsg, okBtn, cancelBtn) {

		var defer = $q.defer();
		okBtn = okBtn || 'OK';
		cancelBtn = cancelBtn || 'CANCEL';
		$translate([confirmMsg, okBtn, cancelBtn]).then(function(translated) {
			
			var dialog = $("<div style='background-color: #FFF; border-radius: 5px;'>" +
					"<div style='border-bottom: 1px solid #CCC;padding: 10px;font-size: 15px;font-weight: bold;' class='header'>Confirm</div>" +
					"<div style='padding: 10px;margin-bottom: 10px;font-size: 14px;' class='content'>" + translated[confirmMsg] + "</div>" +
					"<div class='button-bar' style='text-align:right'>" +
					"<button style='margin: 7px;' class='okbutton btn btn-primary'>" + translated[okBtn] + "</button>" +
					"<button style='margin: 7px;' class='cancelbutton btn btn-primary'>" + translated[cancelBtn] + "</button></div></div>");
			
			confimDialog.html(dialog);
			var popup = confimDialog.bPopup({ 
			    speed: 350,
			    transition: 'slideDown',
			    easing: 'easeOutBack',
			    position: ['auto', 100]
			}, function() {
				confimDialog.html(dialog);
				dialog.find('.okbutton').on('click', function() {
					defer.resolve();
					popup.close();
				});
				dialog.find('.cancelbutton').on('click', function() {
					defer.reject();
					popup.close();
				});
				popup.reposition(100); 
			});
		});
		
		return defer.promise;
	};
	
	this.showLoader = function(){
		$("#progress-bar").show();
	}
	this.hideLoader = function(){
		$("#progress-bar").hide();
	}
	
	var toUpperCase = function(data) {
		if (!data || !data.toUpperCase) return data;
		return data.toUpperCase();
	}
	
	/**
	 * checks whether the two values are equal
	 */
	this.isEqualIgnoreCase = function(data1, data2, ignoreProperties) {
		
		if (toUpperCase(data1) == toUpperCase(data2) || data1 == data2) return true;
		if ((typeof data1 != "object" || typeof data2 != "object")) return toUpperCase(data1) == toUpperCase(data2);
		var isValueEmpty1 = (data1 == null || data1 == "" || data1 == undefined || $.isEmptyObject(data1)); 
		var isValueEmpty2 = (data2 == null || data2 == "" || data2 == undefined || $.isEmptyObject(data2)); 
		if (isValueEmpty1 && isValueEmpty2) return true;
		
		if (isValueEmpty1 && !isValueEmpty2) return false;
		if (!isValueEmpty1 && isValueEmpty2) return false;
		
		ignoreProperties = ignoreProperties || [];
		var keys = Object.keys(data1 || {});
		var data2Keys = Object.keys(data2 || {});
		keys = keys.concat(Object.keys(data2 || {}));
		for (var index = 0; index < keys.length; index++) {
			
			var key = keys[index];
			var value1 = toUpperCase(data1[key]);
			var value2 = toUpperCase(data2[key]);
			if (ignoreProperties.indexOf(key) != -1) continue; 
			if (value1 == value2
					|| ((value1 == null || value1 == "" || value1 == undefined) 
							&& (value2 == null || value2 == "" || value2 == undefined))) continue;
			
			var isValue1Array = Array.isArray(value1);
			var isValue2Array = Array.isArray(value2);
			if ((isValue1Array && !isValue2Array) || (!isValue1Array && isValue2Array) || (isValue1Array && isValue2Array && value1.length != value2.length)) return false;
			var retVal = false;
			if (isValue1Array && isValue2Array) {
				for (var arrIndex = 0; arrIndex < value1.length; arrIndex++) {
					retVal = this.isEqualIgnoreCase(value1[arrIndex], value2[arrIndex], ignoreProperties)
				}
			} else if (typeof value1 == "object" && typeof value2 == "object") {
				retVal = this.isEqualIgnoreCase(value1, value2, ignoreProperties)
			} else if ((typeof value1 == "string" && typeof value2 == "string") || (typeof value1 == "number" && typeof value2 == "number")) {
				retVal = (value1 == value2);
			}
			if (!retVal) {
				return false;
			}
		}
		
		return true;
	};
	
	/**
	 * opens the modal dialog for the given file and in the given scope
	 */
	this.openModalDialog = function(file, scope, size, windowClass) {

		var _this = this;
		if (!file) {
			console.error('file is mandatory to open the modal dialog');
			return;
		}

		var modalOptions = {
			templateUrl : file,
			windowClass : 'popup-modal ' + windowClass,
			backdrop : 'static',
			size : size || 'md',
			backdropClass : "bg-overlay"
		};

		if (scope) modalOptions.scope = scope;
		var modalInstance = $uibModal.open(modalOptions);
		if (!scope) return modalInstance;
		scope.modalDialogInstance = modalInstance;
		scope.closeModalDialog = function() {
			_this.closeNotifications();
			modalInstance.dismiss();
		};
		return modalInstance;
	};

} ]);