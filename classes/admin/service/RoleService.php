<?php

	class RoleService {

		private $roleDao;
		private $logger;
		public function __construct()  {
			$this->roleDao = new RoleDao();
			$this->logger = Logger::getLogger("RoleService");
		}

		function getAllRoles($filter) {
			
			$companyId = $this->getCompanyId();
			return $this->roleDao->retrieveAllRoles($filter, $companyId);
		}
		
		private function getCompanyId($filter = null) {
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
		
		function getAllRoleItems() {
			$companyId = $this->getCompanyId();
			if ($companyId == -1) {
				return $this->roleDao->getAllRoleItems();
			} else {
				return $this->roleDao->getAllRoleItemsByCompanyId($companyId);
			}
		}
		
		function getRole($roleId) {
			if (empty($roleId)) throw new ValidationException("RoleId cannot be empty");
			return $this->roleDao->retrieveRole($roleId);
		}
		
		function createRole($role) {
			
			if (empty($role)) throw new ValidationException("Role cannot be empty");
			if (empty($role->name)) throw new ValidationException("Role Name is mandatory");
			if (empty($role->role_items_list)) throw new ValidationException("Atleast one Role Items should be selected");
			
			$role->company_id = $this->getCompanyId();
			$existingRole = $this->roleDao->retrieveRoleByNameAndCompanyId($role->name, $role->company_id);
			if (null != $existingRole)  throw new ValidationException("Role with same name already exists");
			return $this->roleDao->createRole($role);
		}
		
		function updateRole($role) {
			if (empty($role)) throw new ValidationException("Role cannot be empty");
			if (empty($role->id)) throw new ValidationException("Role Id is mandatory");
			if (empty($role->name)) throw new ValidationException("Role Name is mandatory");
			if (empty($role->role_items_list)) throw new ValidationException("Atleast one Role Items should be selected");
			$existingRole = $this->roleDao->retrieveRoleByNameAndCompanyId($role->name, $role->company_id);
			if (null != $existingRole && $existingRole->id != $role->id) {
				throw new ValidationException("Role with same name already exists");
			}
			return $this->roleDao->updateRole($role);
		}
		
		function getCompanyRoleAssociations($company_id) {
			$roleItems = $this->roleDao->retrieveRoleAssociationsByCompanyId($company_id);
			$role = new Role();
			$role->company_id = $company_id;
			$ritem = array();
			foreach ($roleItems as $key => $val) {
				$ritem[] = $val->associated_role_id;
			}
			$role->role_items_list = $ritem;
			return $role;
		}		
		function createCompanyRoleAssociations($role) {
			
			if (empty($role)) throw new ValidationException("Role cannot be empty");
			if (empty($role->company_id)) throw new ValidationException("Role Company Id is mandatory");
			if (empty($role->role_items_list)) throw new ValidationException("Atleast one Role Items should be selected");
			
			$existingRole = $this->roleDao->retrieveRoleAssociationsByCompanyId($role->company_id);
			if (null != $existingRole)  throw new ValidationException("Company Associations already exists");
			
			$roles = $this->getRoleAssociationItems($role->company_id, $role->role_items_list);
			$roleItems = $this->roleDao->createCompanyRoleAssociations($roles, $role->company_id);
			$items = new Role();
			$items->company_id = $role->company_id;
			foreach ($roleItems as $key => $val) {
				$ritem = array();
				$items.push($val->associated_role_id);
			}
			return $items;
		}
		
		function updateCompanyRoleAssociations($role) {
			if (empty($role)) throw new ValidationException("Role cannot be empty");
			if (empty($role->company_id)) throw new ValidationException("Role Company Id is mandatory");
			if (empty($role->role_items_list)) throw new ValidationException("Atleast one Role Items should be selected");
			
			$roleItems = $this->getRoleAssociationItems($role->company_id, $role->role_items_list);
			$this->roleDao->updateCompanyRoleAssociations($roleItems, $role->company_id);
			return $this->getCompanyRoleAssociations($role->company_id);
		}
		
		function getRoleAssociationItems($company_id, $role_items_list) {
			$items = array();
			foreach ($role_items_list as $key => $val) {
				$itemData = array();
				$itemData["company_id"] = $company_id;
				$itemData["role_id"] = $val;
				$itemData["createdDate"] = null;
				$itemData["createdBy"] = null;
				$itemData["modifiedDate"] = null;
				$itemData["modifiedBy"] = null;
				$items[] = (object) $itemData;
			}
			
			return $items;
		}
	}
?>