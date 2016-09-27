<?php

	class User extends BaseModel {
		public $company_id = null;
		public $firstname = null;
		public $lastname = null;
		public $username = null;
		public $password = null;
		public $email = null;
		public $mobile = null;
		public $address1 = null;
		public $address2 = null;
		public $address3 = null;
		public $city = null;
		public $state = null;
		public $country = null;
		public $pincode = null;
		public $imageLocation = null;
		
		public $role = null;
		public $accessible_rights = null;
	}
?>
