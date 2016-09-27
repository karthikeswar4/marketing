app.controller("LeadsImportController", [ '$scope', '$window', '$rootScope', '$element', '$state', 'APPServices', 'Utils', function($scope, $window, $rootScope, $element, $state, APPServices, Utils) {
	
	$scope.importFile = function() {
		if (!$scope.data.selectedFile) return;
		$scope.config.importing = true;
		var form = new FormData();
		form.append('file', $scope.data.selectedFile);
		APPServices.importFile(form).then(function(response) {
			$scope.importFields = response.data;
			formatFieldHeader($scope.importFields.headers);
			$scope.config.imported = true;
		}).finally(function() {
			$scope.config.importing = false;
		});
	};
	
	var formatFieldHeader = function(headers) {
		$scope.headers = [];
		if (!headers || headers.length == 0) return;
		var fields = [];
		headers = JSON.parse(headers);
		for (var index = 0; index < headers.length; index++) {
			fields.push({ name: headers[index] || ("Column_" + index) });
		}
		$scope.headers = fields;
	};
	
	$scope.mapImportedFile = function() {

		var fields = [];
		for (var index = 0; index < $scope.headers.length; index++) {
			var field = $scope.headers[index];
			if (fields.indexOf(field.ass_field) > -1) {
				Utils.error(field.name + ' is mapped more than once');
				return;
			} 
			if (!field.ass_field) {
				continue;
			}
			fields.push(field.ass_field);
		}
		
		Utils.showConfirmation('CONFIRM_MAP_FIELDS').then(function() {
			APPServices.mapImportedFile({ id: $scope.importFields.id, association: JSON.stringify(fields) }).then(function() {
				Utils.info('Importing leads');
				$scope.importFields = {};
				$scope.data.selectedFile = null;
				$scope.config.imported = false;
			});
		});
	};
	
	var loadLeadsFields = function() {
		$scope.leadFieldsList = {
//			LEAD_ID: "lead_id",
			TITLE: "title",
			REFERENCE: "reference",
			SOURCE: "source",
			ADDITIONAL_INFO: "additional_info",
			COMPANY_NAME: "lead_company_name",
			INDUSTRY: "industry",
			INDUSTRY_DESCRIPTION: "industry_description",
			CONTACT_PERSON: "contact_person",
			PHONE: "phone1",
			ADDRESS_LINE1: "address_line1",
			ADDRESS_LINE2: "address_line2",
			ADDRESS_LINE3: "address_line3",
			CITY: "city",
			STATE: "state",
			COUNTRY: "country",
			EMAIL_ID: "mailid",
			WEBSITE: "website"
		};
	}
	
	/**
	 * initializes the home controller
	 */
	var init = function() {
		$scope.config = {};
		$scope.data = {};
		$scope.importFields = {};
		loadLeadsFields();
	};

	var local = {};
	init();
	
} ]);