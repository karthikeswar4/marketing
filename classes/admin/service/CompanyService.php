<?php

	class CompanyService {

		private $companyDao;
		private $userDao;
		private $roleDao;
		private $logger;
		public function __construct()  {
			$this->companyDao = new CompanyDao();
			$this->userDao = new UserDao();
			$this->roleDao = new RoleDao();
			$this->logger = Logger::getLogger("RoleService");
		}

		function getAllCompanies($filter) {
			return $this->companyDao->retrieveAllCompanies($filter);
		}
		
		function getAllRoleItems() {
			return $this->companyDao->getAllRoleItems();
		}
		
		function getCompanyById($companyId) {
			if (empty($companyId)) throw new ValidationException("CompanyId cannot be empty");
			return $this->companyDao->retrieveCompany($companyId);
		}

		function getCompanyActivationByCompanyId($companyId) {
			if (empty($companyId)) throw new ValidationException("CompanyId cannot be empty");
			return $this->companyDao->getCompanyActivationByCompanyId($companyId);
		}

		function createActivationDetail($request) {
			if (empty($request)) throw new ValidationException("Company Activation Details cannot be empty");
			if (empty($request->company_id)) throw new ValidationException("Company Id cannot be empty");
			if (empty($request->activation_from)) throw new ValidationException("Activation From Date cannot be empty");
			if (empty($request->activation_to)) throw new ValidationException("Activation To Date cannot be empty");
			$activationDetail = $this->companyDao->createActivationDetail($request);
			$company = $this->companyDao->retrieveCompany($request->company_id);
			$adminRole = $this->createAdminRole($request->company_id);
			$user = $this->userDao->retrieveUserByEmail($company->email);
			if (null == $user) {
				$userObj = $this->createUserObject($company);
				$userObj->role = $adminRole->id;
				$this->userDao->createUser($userObj);
			}
			return $activationDetail;
		}
		
		function createAdminRole($companyId, $reset = false) {
			if ($reset) {
				$this->roleDao->deleteRoleByCompanyId($companyId);
			}
			$company = $this->companyDao->retrieveCompany($companyId);
			$adminRole = $this->roleDao->retrieveRoleByNameAndCompanyId("Administrator", $companyId);
			if ($adminRole == null) {
				$roleItems = $this->roleDao->getAllRoleItemsByCompanyId($company->id);
				$adminRole = $this->constructCompanyAdminRole($company, $roleItems);
				return $this->roleDao->createRole($adminRole);
			}
			return $adminRole;
		}
		
		private function createUserObject($company) {
			$user = new User();
			$user->company_id = $company->id;
			$user->firstname = $company->name;
			$user->email = $company->email;
			$user->address_line1 = $company->address_line1;
			$user->address_line2 = $company->address_line2;
			$user->address_line3 = $company->address_line3;
			$user->city = $company->city;
			$user->state = $company->state;
			$user->country = $company->country;
			$user->pincode = $company->postalcode;
			$user->mobile = $company->mobile;
			$user->imageLocation = $company->image_location;
			$user->password = "1234";
			return $user;
		}

		private function constructCompanyAdminRole($company, $roleItems) {
			$newRole = new Role();
			$newRole->company_id = $company->id;
			$newRole->name = "Administrator";
			$newRole->description = "Created Automatically upon Activation";
			
			$roleItemsObject = array();
			foreach ($roleItems as $key => $role) {
				
				$roleItem = array();
				$roleItem["id"] = $role->id;
				$roleItem["name"] = $role->name;
				$roleItem["code"] = $role->code;
				if ($role->view) $roleItem["view"] = true;
				if ($role->create) $roleItem["create"] = true;
				if ($role->update) $roleItem["update"] = true;
				if ($role->delete) $roleItem["delete"] = true;
				$roleItemsObject[] = (object) $roleItem;
			}
			$newRole->role_items_list = json_encode($roleItemsObject);
			return $newRole;
		}
		
		function updateActivationDetail($request) {
			if (empty($request)) throw new ValidationException("Company Activation Details cannot be empty");
			if (empty($request->id)) throw new ValidationException("Activation Id Activation From Date cannot be empty");
			if (empty($request->activation_from)) throw new ValidationException("Activation From Date cannot be empty");
			if (empty($request->activation_to)) throw new ValidationException("Activation To Date cannot be empty");
			return $this->companyDao->updateActivationDetail($request);
		}

		function listRegisteredCompany($filter, $pageNo, $length) {
			return $this->companyDao->retrieveRegisteredCompanies($filter, $pageNo, $length);
		}
		
		function createCompany($company) {
			
			if (empty($company)) throw new ValidationException("Company cannot be empty");
			if (empty($company->name)) throw new ValidationException("Company Name is mandatory");
			if (empty($company->email)) throw new ValidationException("Company Email is Mandatory");
			if (empty($company->address_line1)) throw new ValidationException("Address Line1 is Mandatorys");
			if (empty($company->city)) throw new ValidationException("City is Mandatory");
			if (empty($company->state)) throw new ValidationException("State is Mandatory");
			if (empty($company->country)) throw new ValidationException("Country is Mandatory");
			if (empty($company->phone1)) throw new ValidationException("Phone Number is Mandatory");
			$existingCompany = $this->companyDao->retrieveCompanyByEmail($company->email);
			if (null != $existingCompany) throw new ValidationException("A Company has been already registered with this email.");
			return $this->companyDao->createCompany($company);
		}
		
		function updateRole($role) {
			if (empty($role)) throw new ValidationException("Role cannot be empty");
			if (empty($role->id)) throw new ValidationException("Role Id is mandatory");
			if (empty($role->name)) throw new ValidationException("Role Name is mandatory");
			if (empty($role->role_items_list)) throw new ValidationException("Atleast one Role Items should be selected");
			return $this->companyDao->updateRole($role);
		}
	}
?>