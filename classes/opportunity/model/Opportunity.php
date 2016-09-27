<?php 
	class Opportunity extends BaseModel { 

		public $company_id = null;
		public $account_id = null;
		public $status = null;
		public $hold_status = null;
		public $lead_company_id = null; 
		public $source = null;
		public $reference = null;
		public $additional_info = null;
		public $lead_company = null;
	}
?>