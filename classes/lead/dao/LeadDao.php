<?php
	class LeadDao extends BaseDao {
		
		function getAllLeads($filter, $company_id) { 
				
			$query = "SELECT  lead.`id` as id, lead.`title` as title, lead.`company_id` as company_id, lead.`campaign_id` as campaign_id, lead.`status` as status,  lead.`lead_company_id` as lead_company_id, lead.`assigned_to` as assigned_to,
				lead.`CreatedDate` as createdDate, lead.`CreatedBy` as createdBy, lead.`ModifiedDate` as modifiedDate, lead.`ModifiedBy` as modifiedBy FROM `leads` lead
				WHERE lead.company_id = $company_id";

			if (!empty($filter->lead_id)) $query .= " and lead.id = $filter->lead_id";
			
			$query = $query." order by lead.CreatedDate";
			return $this->getList($query, 'Lead');
		}

		function createLead($lead) { 

// 			`contacteddate`=:contactDate,  `status`=:status,  `lostreason`=:lostReason,
// 			`proposalnumber`=:proposalNo,  `proposalsubmitdate`=:proposalSubmitDate,
			$query = "INSERT INTO `leads` (`company_id`, `title`, `campaign_id`, `assigned_to`, `status`, `source`, `reference`, `additional_info`, `lead_company_id`, `CreatedDate`, `CreatedBy`, `ModifiedDate`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

			$params = array("company_id", "title", "campaign_id", "assigned_to", "status", "source", "reference", "additional_info", "lead_company_id", "createdDate", "createdBy", "modifiedDate", "modifiedBy");
			return $this->create($query, $lead, $params);
		}
		
		function getLead($leadId) {
			$query = "SELECT  lead.`id` as id, lead.`title` as title, lead.`company_id` as company_id, lead.`campaign_id` as campaign_id, lead.`status` as status,  lead.`lead_company_id` as lead_company_id, lead.`assigned_to` as assigned_to,
				lead.`CreatedDate` as createdDate, lead.`CreatedBy` as createdBy, lead.`ModifiedDate` as modifiedDate, lead.`ModifiedBy` as modifiedBy FROM `leads` lead
				WHERE lead.id = $leadId";;
			return $this->getSingleObject($query, 'Lead');
		}
		
		function updateLead($lead) { 
				
			$query = "update `leads` set `lead_company_id`= ?, `title` = ?, `assigned_to` = ?, `status`= ?, `source`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("lead_company_id", "title", "assigned_to", "status", "source", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $lead, $params);
		}
		
		function deleteLead($leadId) {
			$query = "DELETE FROM leads WHERE id = $leadId";
			return $this->execute($query);
		}
		
		function getMyLeads($companyId, $userId) {
			$query = "SELECT  lead.`id` as id,  lead.`company_id` as company_id, lead.`title` as title, lead.`status` as status,  lead.`lead_company_id` as lead_company_id, lead.`assigned_to` as assigned_to,
			lead.`CreatedDate` as createdDate, lead.`CreatedBy` as createdBy, lead.`ModifiedDate` as modifiedDate, lead.`ModifiedBy` as modifiedBy FROM `leads` lead
			WHERE lead.company_id = $companyId and lead.assigned_to = $userId";
			return $this->getList($query, 'Lead');
		}

		function getLeadsByCampaignId($campaignId, $companyId) {
			$query = "SELECT  lead.`id` as id, lead.`company_id` as company_id, lead.`campaign_id` as campaign_id, lead.`title` as title, lead.`status` as status,  lead.`lead_company_id` as lead_company_id, lead.`assigned_to` as assigned_to,
			lead.`CreatedDate` as createdDate, lead.`CreatedBy` as createdBy, lead.`ModifiedDate` as modifiedDate, lead.`ModifiedBy` as modifiedBy FROM `leads` lead
			WHERE lead.company_id = $companyId and lead.campaign_id = $campaignId";
			return $this->getList($query, 'Lead');
		}
		
		function getLeadStatistics($companyId, $userId) {
			$query = "SELECT  count(lead.id) as count, lead.`status` as status FROM `leads` lead
			WHERE lead.company_id = $companyId and lead.CreatedBy = $userId";
			return $this->getList($query, 'DashboardStats');
		}
		
		function updateLeadStatus($lead) {
		
			$query = "update `leads` set `status`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("status", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $lead, $params);
		}
		
		function holdLeadStatus($lead) {
		
			$query = "update `leads` set `status`= ?, `hold_status`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("status", "hold_status", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $lead, $params);
		}
		
		function getFieldByName($fieldName, $fieldValue) {
		
			$query = "select distinct(".$fieldName.") as field from leads where ".$fieldName." is not null";
			if (!empty($fieldValue)) $query = $query." and ".$fieldName." like '".$fieldValue."%'";
			return $this->getList($query, 'Lead');
		}
	}
?>