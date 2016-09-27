<?php
	class CompanyDao extends BaseDao {
		
		private $logger;
		public function __construct()  {
			$this->logger = Logger::getLogger("CompanyDao");
		}

		function retrieveAllCompanies($filter) {

			$query = "SELECT `id` as id, `name` as name, `email` as email, `address_line1` as address_line1, `address_line2` as address_line2,
					`address_line3` as address_line3, `city` as city, `state` as state, `country` as country, `postalcode` as postal, 
					`phone1` as phone1, `phone2` as phone2, `mobile` as mobile, `fax` as fax 
					FROM `company` WHERE  id > 0 ";
			$temp = "";
			if (!empty($filter)) {
				if (isset($filter->name)) $temp = $temp." and name LIKE '".$filter->name."%'";
				if (strlen($temp) > 0) {
					$query = $query." AND ".substr($temp, 4);
				}
			}
			return $this->getList($query, 'Company');
		}
		
		function retrieveRegisteredCompanies($filter, $pageNo, $length) {
		
			$query = "SELECT cmp.`id` as id, cmp.`name` as name, cmpr.activation_from as activation_from, cmpr.activation_to as activation_to
					FROM `company` cmp INNER JOIN company_registration cmpr ON cmp.id = cmpr.company_id
					WHERE cmp.id > 0";
			
			$temp = "";
			if (!empty($filter)) {
				if (isset($filter->name)) $temp = $temp." and name LIKE '".$filter->name."%'";
				if (strlen($temp) > 0) {
					$query = $query." AND ".substr($temp, 4);
				}
			}
			
			$query = $query." ORDER BY cmp.name";
			if (!empty($pageNo)) {
				$query = $query." LIMIT ".$length." OFFSET ". ($pageNo * $length);
			}
			return $this->getList($query, 'Company');
		}
		
		function retrieveActiveCompanies($filter) {
		
			$query = "SELECT cmp.`id` as id, cmp.`name`, cmpr.activation_from, cmpr.activation_to as name
					FROM `company` cmp INNER JOIN company_registration cmpr 
					WHERE cmp.id = cmpr.company_id AND cmp.id > 0 AND cmpr.activation_from < ? AND cmpr.activation_to > ?";
				
			$temp = "";
			if (!empty($filter)) {
				if (isset($filter->name)) $temp = $temp." and name LIKE '".$filter->name."%'";
				if (strlen($temp) > 0) {
					$query = $query." AND ".substr($temp, 4);
				}
			}
			return $this->getList($query, 'Company');
		}
		
		function createCompany($company) {
		
			$query = "INSERT INTO `company` (`name`, `email`, `address_line1`, `address_line2`,	`address_line3`, 
					`city`, `state`, `country`, `postalcode`, `phone1`, `phone2`, `mobile`, `fax`, 
					`CreatedDate`, `ModifiedDate`, `CreatedBy`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
			$params = array("name", "email", "address_line1", "address_line2", "address_line3", "city", "state", "country", 
					"postalcode", "phone1", "phone2", "mobile", "fax", 
					"createdDate", "modifiedDate", "createdBy", "modifiedBy");
			return $this->create($query, $company, $params);
		}

		function createActivationDetail($companyActivation) {
		
			$query = "INSERT INTO `company_registration` (`company_id`, `name`, `host`, `auth`,	`activation_from`, `activation_to`, `CreatedDate`, `ModifiedDate`, `CreatedBy`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
			$params = array("company_id", "dbname", "host", "auth", "activation_from", "activation_to", "createdDate", "modifiedDate", "createdBy", "modifiedBy");
			return $this->create($query, $companyActivation, $params);
		}
		
		function retrieveCompany($companyId) {

			$query = "SELECT cmp.`id` as id, cmp.`name` as name, cmp.`email` as email, cmp.`address_line1` as address_line1, cmp.`address_line2` as address_line2,
					cmp.`address_line3` as address_line3, cmp.`city` as city, cmp.`state` as state, cmp.`country` as country, cmp.`postalcode` as postal, 
					cmp.`phone1` as phone1, cmp.`phone2` as phone2, cmp.`mobile` as mobile, cmp.`fax` as fax,
					cmp.`CreatedDate` as createdDate, cmp.`ModifiedDate` as modifiedDate, cmp.`CreatedBy` as createdBy, 
					cmp.`ModifiedBy` as modifiedBy FROM `company` cmp WHERE id=".$companyId;
			return $this->getSingleObject($query, 'Company', array($companyId));
		}

		function getCompanyActivationByCompanyId($companyId) {

			$query = "SELECT cmp.`id` as id, cmp.`name` as name, cmpr.activation_from as activation_from, cmpr.activation_to as activation_to,
					cmpr.host as host, cmpr.name as dbname, cmpr.auth as auth,
					cmpr.`CreatedDate` as createdDate, cmpr.`ModifiedDate` as modifiedDate, cmpr.`CreatedBy` as createdBy, 
					cmpr.`ModifiedBy` as modifiedBy FROM `company` cmp INNER JOIN company_registration cmpr ON cmp.id = cmpr.company_id
					WHERE cmp.id=".$companyId;
			return $this->getSingleObject($query, 'Company', array($companyId));
		}
		
		function retrieveCompanyByEmail($companyEmail) {
		
			$query = "SELECT cmp.`id` as id, cmp.`name` as name, cmp.`email` as email, cmp.`address_line1` as address_line1, cmp.`address_line2` as address_line2,
					cmp.`address_line3` as address_line3, cmp.`city` as city, cmp.`state` as state, cmp.`country` as country, cmp.`postalcode` as postal,
					cmp.`phone1` as phone1, cmp.`phone2` as phone2, cmp.`mobile` as mobile, cmp.`fax` as fax,
					cmp.`CreatedDate` as createdDate, cmp.`ModifiedDate` as modifiedDate, cmp.`CreatedBy` as createdBy,
					cmp.`ModifiedBy` as modifiedBy FROM `company` cmp WHERE cmp.email=".$companyEmail;
			return $this->getSingleObject($query, 'Company', array($companyEmail));
		}

		function updateCompany($company) {

			$query = "UPDATE `company` SET `name` = ?, `email` = ?, `address_line1` = ?, `address_line2` = ?, `address_line3` = ?, `city` = ?, 
					`state` = ?, `country` = ?, `postalcode` = ?, `phone1` = ?, `phone2` = ?, `mobile` = ?, `fax` = ?,
					`ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ? ";
			$params = array("name", "email", "address_line1", "address_line2", "address_line3", "city", "state", "country",
							"postalcode", "phone1", "phone2", "mobile", "fax", "modifiedDate", "modifiedBy", "id");
			return  $this->update($query, $role, $params);
		}
		
		function updateActivationDetail($companyActivation) {
		
			$query = "UPDATE `company_registration` SET `name` = ?, `host` = ?, `auth` = ?, `activation_from` = ?, `activation_to` = ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("dbname", "host", "auth", "activation_from", "activation_to", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $companyActivation, $params);
		}
	}
?>