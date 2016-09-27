<?php
	class ImportDao extends BaseDao {
		
		function createLeadImport($import) { 

			$query = "INSERT INTO `lead_imports` (`company_id`, `type`, `file_name`, `location`, `additional_info`, `CreatedDate`, `CreatedBy`, `ModifiedDate`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

			$params = array("company_id", "type", "file_name", "location", "additional_info", "createdDate", "createdBy", "modifiedDate", "modifiedBy");
			return $this->create($query, $import, $params);
		}
		
		function getLeadImport($importId) {
			$query = "SELECT id, `company_id`, `type`, `file_name`, `location`, `additional_info`, `headers`, `association`,
					`CreatedDate`, `CreatedBy`, `ModifiedDate`, `ModifiedBy` FROM lead_imports WHERE id = $importId";
			return $this->getSingleObject($query, 'Import');
		}
		
		function updateLeadImport($import) { 
				
			$query = "update `lead_imports` set `type`= ?, `file_name`= ?, `location`= ?, `additional_info`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("type", "file_name", "location", "additional_info", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $import, $params);
		}
	
		function updateLeadImportHeaders($import) { 
				
			$query = "update `lead_imports` set `headers`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("headers", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $import, $params);
		}

		function updateLeadImportMapping($import) { 
				
			$query = "update `lead_imports` set `association`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("association", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $import, $params);
		}
	}
?>