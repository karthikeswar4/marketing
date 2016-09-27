<?php
	class CampaignDao extends BaseDao {
		
		function getAllCampaigns($filter, $company_id) { 
				
			$query = "SELECT camp.`id`, camp.`title`, camp.`company_id`, camp.`assigned_to`, camp.`status`, camp.`campaign_start_date`, camp.`campaign_start_date`,
			camp.`additional_info`, camp.`CreatedDate`, camp.`CreatedBy`, camp.`ModifiedDate`, camp.`ModifiedBy`
			FROM `campaign` camp WHERE camp.company_id = $company_id";

			if (!empty($filter->campaign_id)) $query .= " and camp.id = $filter->campaign_id";
			
			$query = $query." order by camp.CreatedDate";
			return $this->getList($query, 'Campaign');
		}

		function createCampaign($campaign) { 

			$query = "INSERT INTO `campaign` (`company_id`, `title`, `assigned_to`, `status`, `campaign_start_date`, `campaign_end_date`, `additional_info`, 
					`CreatedDate`, `CreatedBy`, `ModifiedDate`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

			$params = array("company_id", "title", "assigned_to", "status", "campaign_start_date", "campaign_end_date", "additional_info",
							"createdDate", "createdBy", "modifiedDate", "modifiedBy");
			return $this->create($query, $campaign, $params);
		}
		
		function getCampaign($campaignId) {
			
			$query = "SELECT camp.`id`, camp.`title`, camp.`company_id`, camp.`assigned_to`, camp.`status`, camp.`campaign_start_date`, camp.`campaign_start_date`, 
					camp.`additional_info`, camp.`CreatedDate`, camp.`CreatedBy`, camp.`ModifiedDate`, camp.`ModifiedBy` 
					FROM `campaign` camp WHERE camp.id = $campaignId";
			return $this->getSingleObject($query, 'Campaign');
		}
		
		function updateCampaign($campaign) {
				
			$query = "UPDATE `campaign` SET `assigned_to` = ?, `title` = ?, `status` = ?, `campaign_start_date` = ?, `campaign_end_date` = ?, `additional_info` = ?, 
					`ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";

			$params = array("assigned_to", "title", "status", "campaign_start_date", "campaign_end_date", "additional_info",
							"modifiedDate", "modifiedBy", "id");
			
			return $this->update($query, $campaign, $params);
		}

		function closeCampaign($campaign) {
				
			$query = "UPDATE `campaign` SET `status` = ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("status", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $campaign, $params);
		}
	}
?>