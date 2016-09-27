<?php
	class AccountDao extends BaseDao {
		
		function getAllAccounts($filter, $company_id) { 
				
			$conn = DBConnection::getConnection();	
			$query = "SELECT  account.`id` as id,  account.`company_id` as company_id, account.`status` as status,
				account.`CreatedDate` as createdDate, account.`CreatedBy` as createdBy, account.`ModifiedDate` as modifiedDate, account.`ModifiedBy` as modifiedBy 
				FROM `accounts` account WHERE account.company_id = $company_id";

			$query = $query." order by account.CreatedDate";
			return $this->getList($query, 'Account');
		}

		function createAccount($account) { 
			$query = "INSERT INTO `accounts` (`company_id`, `status`, `additional_info`, `CreatedDate`, `CreatedBy`, `ModifiedDate`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?, ?)";

			$params = array("company_id", "status", "additional_info", "createdDate", "createdBy", "modifiedDate", "modifiedBy");
			return $this->create($query, $account, $params);
		}
		
		function getAccount($accountId) {
			$query = "SELECT id, `company_id`, `status`, `additional_info`,
					`CreatedDate`, `CreatedBy`, `ModifiedDate`, `ModifiedBy` FROM accounts WHERE id = $accountId";
			return $this->getSingleObject($query, 'Account');
		}
		
		function updateAccount($account) { 
				
			$query = "update `accounts` set `status`= ?, `additional_info`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("status", "additional_info", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $account, $params);
		}
	}
?>