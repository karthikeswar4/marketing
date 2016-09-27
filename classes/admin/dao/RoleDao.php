<?php

	class RoleDao extends BaseDao {
		
		private $logger;
		public function __construct()  {
			$this->logger = Logger::getLogger("RoleDao");
		}

		function retrieveAllRoles($filter, $company_id) {

			$query = "SELECT `id` as id, `company_id` as company_id, `name` as name, `description` as description, `role_items_list` as 'role_items_list',
					`CreatedDate` as createdDate, `ModifiedDate` as modifiedDate, `CreatedBy` as createdBy, 
					`ModifiedBy` as modifiedBy FROM `company_role` WHERE company_id=".$company_id;
			
			$temp = "";
			if (!empty($filter)) {
				if (isset($filter->name)) $temp = $temp." and name LIKE '".$filter->name."%'";
				if (strlen($temp) > 0) {
					$query = $query." AND ".substr($temp, 4);
				}
			}
			
			$query = $query." ORDER BY name";
			return $this->getList($query, 'Role');
		}
		
		function getAllRoleItemsByCompanyId($companyId) {
			
			$query = "SELECT ri.`id` as id, ri.`name` as name, ri.`code` as code, ri.`view` as 'view', 
						ri.`create` as 'create', ri.`update` as 'update', ri.`delete` as 'delete'
 						FROM `role_items` ri INNER JOIN `company_role_items` cmpr ON ri.id = cmpr.role_id 
						WHERE cmpr.company_id=".$companyId;
			return $this->getList($query, 'RoleItem', array($companyId));
		}
		
		function getAllRoleItems() {
			
			$query = "SELECT `id` as id, `name` as name, `code` as code, `view` as 'view', `create` as 'create', `update` as 'update', `delete` as 'delete',
					`CreatedDate` as createdDate, `ModifiedDate` as modifiedDate, `CreatedBy` as createdBy, 
					`ModifiedBy` as modifiedBy FROM `role_items`";
			return $this->getList($query, 'RoleItem');
		}
		
		function createRole($role) {
		
			$query = "INSERT INTO `company_role` (`company_id`, `name`, `description`, `role_items_list`, `CreatedDate`, `ModifiedDate`, `CreatedBy`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
			$params = array("company_id", "name", "description", "role_items_list", "createdDate", "modifiedDate", "createdBy", "modifiedBy");
			return $this->create($query, $role, $params);
		}
		
		function retrieveRole($roleId) {

			$query = "SELECT `id` as id, `company_id` as company_id, `name` as name, `description` as description, `role_items_list` as 'role_items_list',
					`CreatedDate` as createdDate, `ModifiedDate` as modifiedDate, `CreatedBy` as createdBy, 
					`ModifiedBy` as modifiedBy FROM `company_role` WHERE id=".$roleId;
			return $this->getSingleObject($query, 'Role', array($roleId));
		}
		
		function retrieveRoleByNameAndCompanyId($rolename, $companyId) {
		
			$query = "SELECT `id` as id, `company_id` as company_id, `name` as name, `description` as description, `role_items_list` as 'role_items_list',
					`CreatedDate` as createdDate, `ModifiedDate` as modifiedDate, `CreatedBy` as createdBy,
					`ModifiedBy` as modifiedBy FROM `company_role` WHERE name='".$rolename."' AND company_id=".$companyId;
			return $this->getSingleObject($query, 'Role', array($rolename, $companyId));
		}
		
		function retrieveRoleByIdAndCompanyId($roleId, $companyId) {
		
			$query = "SELECT `id` as id, `company_id` as company_id, `name` as name, `description` as description, `role_items_list` as 'role_items_list',
					`CreatedDate` as createdDate, `ModifiedDate` as modifiedDate, `CreatedBy` as createdBy,
					`ModifiedBy` as modifiedBy FROM `company_role` WHERE id='".$roleId."' AND company_id=".$companyId;
			return $this->getSingleObject($query, 'Role', array($roleId, $companyId));
		}

		function updateRole($role) {

			$query = "UPDATE `company_role` SET `name` = ?, `description` = ?, `role_items_list` = ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id=".$role->id;
			$params = array("name", "description", "role_items_list", "modifiedDate", "modifiedBy");
			return  $this->update($query, $role, $params);
		}
		
		function retrieveRoleAssociationsByCompanyId($companyId) {
		
			$query = "SELECT `id` as id, `company_id` as company_id, `role_id` as associated_role_id,
					`CreatedDate` as createdDate, `ModifiedDate` as modifiedDate, `CreatedBy` as createdBy,
					`ModifiedBy` as modifiedBy FROM `company_role_items` WHERE company_id=".$companyId;
			return $this->getList($query, 'Role', array($companyId));
		}
		
		function createCompanyRoleAssociations($roleItems, $companyId) {

			$query = "INSERT INTO `company_role_items` (`company_id`, `role_id`, `CreatedDate`, `ModifiedDate`, `CreatedBy`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?)";
			$params = array("company_id", "role_id", "createdDate", "modifiedDate", "createdBy", "modifiedBy");
			$this->executeBatch($query, $roleItems, $params, true);
		}

		function updateCompanyRoleAssociations($roleItems, $companyId) {
			
			$this->deleteCompanyRoleAssociations($companyId);
			$this->createCompanyRoleAssociations($roleItems, $companyId);
		}
		
		function deleteCompanyRoleAssociations($companyId) {
		
			$query = "DELETE FROM `company_role_items` WHERE company_id = ?";
			$params = array("company_id");
			$object = array();
			$object["company_id"] = $companyId;
			return $this->execute($query, (object) $object, $params);
		}

		function deleteRoleByCompanyId($companyId) {
		
			$query = "DELETE FROM `company_role` WHERE company_id = ?";
			$params = array("company_id");
			$object = array();
			$object["company_id"] = $companyId;
			return $this->execute($query, (object) $object, $params);
		}

		function deleteRoleById($roleId) {
		
			$query = "DELETE FROM `company_role` WHERE id = ?";
			$params = array("id");
			$object = array();
			$object["id"] = $roleId;
			return $this->execute($query, (object) $object, $params);
		}
	}
?>