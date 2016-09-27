<?php
	class OpportunityDao extends BaseDao {
		
		function getAllOpportunities($filter, $company_id) { 
				
			$query = "SELECT  lead.`id` as id,  lead.`company_id` as company_id, lead.`status` as status, lead.`account_id` as account_id, lead.`hold_status` as hold_status, lead.`lead_company_id` as lead_company_id,
				lead.`CreatedDate` as createdDate, lead.`CreatedBy` as createdBy, lead.`ModifiedDate` as modifiedDate, lead.`ModifiedBy` as modifiedBy 
				FROM `opportunities` lead INNER JOIN leads_company cmp on cmp.id = lead.lead_company_id WHERE lead.company_id = $company_id";

			if (!empty($filter->opportunity_id)) $query .= " and lead.id = $filter->opportunity_id";
			if (!empty($filter->status)) $query .= " and lead.status = $filter->status";
			if (!empty($filter->company_name)) $query .= " and cmp.lead_company_name LIKE '$filter->company_name%'";
			if (!empty($filter->phone)) $query .= " and (cmp.phone1 LIKE '$filter->phone%' OR cmp.phone1 LIKE '$filter->phone%')";
			
			$query = $query." order by lead.CreatedDate";
			return $this->getList($query, 'Opportunity');
		}

		function createOpportunity($lead) { 

// 			`contacteddate`=:contactDate,  `status`=:status,  `lostreason`=:lostReason,
// 			`proposalnumber`=:proposalNo,  `proposalsubmitdate`=:proposalSubmitDate,
			$query = "INSERT INTO `opportunities` (`company_id`, `status`, `source`, `reference`, `additional_info`, `lead_company_id`, `CreatedDate`, `CreatedBy`, `ModifiedDate`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

			$params = array("company_id", "status", "source", "reference", "additional_info", "lead_company_id", "createdDate", "createdBy", "modifiedDate", "modifiedBy");
			return $this->create($query, $lead, $params);
		}
		
		function getOpportunity($leadId) {
			$query = "SELECT id, `company_id`, `account_id`, `status`, `hold_status`, `source`, `reference`, `additional_info`, `lead_company_id`, 
					`CreatedDate`, `CreatedBy`, `ModifiedDate`, `ModifiedBy` FROM opportunities WHERE id = $leadId";
			return $this->getSingleObject($query, 'Opportunity');
		}
		
		function updateOpportunity($opportunity) { 
				
			$query = "update `opportunities` set `lead_company_id`= ?, `status`= ?, `source`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("lead_company_id",  "status", "source", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $opportunity, $params);
		}

		function updateOpportunityStatus($opportunity) { 
				
			$query = "update `opportunities` set `status`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("status", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $opportunity, $params);
		}
		
		function wonOpportunityStatus($opportunity) { 
				
			$query = "update `opportunities` set `status`= ?, `account_id`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("status", "account_id", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $opportunity, $params);
		}
		
		function holdOpportunityStatus($opportunity) {
		
			$query = "update `opportunities` set `status`= ?, `hold_status`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("status", "hold_status", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $opportunity, $params);
		}
		
		function getOpportunityStats($companyId, $userId) {
			$query = "SELECT  count(oppor.id) as count, oppor.`status` as status FROM `opportunities` oppor
			WHERE oppor.company_id = $companyId and oppor.CreatedBy = $userId group by oppor.`status`";
			return $this->getList($query, 'DashboardStats');
		}
		
	}
?>