<?php 
	class Role extends BaseModel { 
		public $company_id = null; 
		public $associated_role_id = null; 
		public $name = null;
		public $description = null;
		public $role_items_list = null;
	}
?>