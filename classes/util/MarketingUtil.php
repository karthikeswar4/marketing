<?php
	class MarketingUtil {

		static function getCompanyId($filter = null) {
			$companyId = null;
			$user = Util::getLoggedInUser();
			if (empty($user->company_id)) {
				throw new ValidationException("Invalid Company Id");
			} else if ($user->company_id == -1) {
				$companyId = ($filter != null && isset($filter->company_id)) ? $filter->company_id : -1;
			} else {
				$companyId = $user->company_id;
			}
			return $companyId;
		}
		
		static function getImportBaseLocation() {
			return BASE_DIR.DIRECTORY_SEPARATOR."..".DIRECTORY_SEPARATOR."import".DIRECTORY_SEPARATOR;
		}
		
		static function getImportLocation($location, $companyId) {
			return self::getImportBaseLocation().$companyId.DIRECTORY_SEPARATOR.$location;
		}

		static function getLeadAttachmentBaseLocation() {
			return BASE_DIR.DIRECTORY_SEPARATOR."..".DIRECTORY_SEPARATOR."import".DIRECTORY_SEPARATOR;
		}
		
		static function getLeadAttachmentLocation($location, $companyId, $leadId) {
			return self::getLeadAttachmentBaseLocation().$companyId.DIRECTORY_SEPARATOR.$leadId.DIRECTORY_SEPARATOR.$location;
		}
	}
?>