<?php
	class TaskDao extends BaseDao {
		
		function getAllTasks($filter, $companyId) { 
				
			$query = "SELECT  lead.`id` as id, lead.`company_id` as company_id, lead.`lead_id` as lead_id, lead.`opportunity_id` as opportunity_id, lead.`assigned_to` as assigned_to,
				lead.`status` as status, lead.`title` as title, lead.`due_date` as due_date, lead.`description` as description,
			  	lead.`CreatedDate` as createdDate, lead.`CreatedBy` as createdBy, lead.`ModifiedDate` as modifiedDate, lead.`ModifiedBy` as modifiedBy
			  	FROM `leads_tasks` lead WHERE lead.company_id = $companyId";

			if (!empty($filter->lead_id)) $query .= " and lead.lead_id = $filter->lead_id";
			if (!empty($filter->opportunity_id)) $query .= " and lead.opportunity_id = $filter->opportunity_id";
			$query = $query." order by lead.CreatedDate";

			return $this->getList($query, 'Task');
		}
	
		function getAllLeadOpportunityTasksById($leadId, $opportunityId, $companyId) { 
				
			$query = "SELECT  lead.`id` as id, lead.`company_id` as company_id, lead.`lead_id` as lead_id, lead.`opportunity_id` as opportunity_id, lead.`assigned_to` as assigned_to,
				lead.`status` as status, lead.`title` as title, lead.`due_date` as due_date, lead.`description` as description,
			  	lead.`CreatedDate` as createdDate, lead.`CreatedBy` as createdBy, lead.`ModifiedDate` as modifiedDate, lead.`ModifiedBy` as modifiedBy
			  	FROM `leads_tasks` lead WHERE lead.company_id = $companyId";

			if (!empty($leadId)) $query .= " and lead.lead_id = $leadId";
			if (!empty($opportunityId)) $query .= " and lead.opportunity_id = $opportunityId";
			$query = $query." order by lead.CreatedDate";
			
			return $this->getList($query, 'Task');
		}

		function createLeadTask($task) { 

			$query = "INSERT INTO `leads_tasks` (`company_id`, `lead_id`, `opportunity_id`, `assigned_to`, `status`, `title`, `due_date`, `description`, `CreatedDate`, `CreatedBy`, `ModifiedDate`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

			$params = array("company_id", "lead_id", "opportunity_id", "assigned_to", "status", "title", "due_date", "description", "createdDate", "createdBy", "modifiedDate", "modifiedBy");
			return $this->create($query, $task, $params);
		}
		
		function getLeadTask($taskId) {
			$query = "SELECT  lead.`id` as id, lead.`company_id` as company_id, lead.`lead_id` as lead_id, lead.`opportunity_id` as opportunity_id, lead.`assigned_to` as assigned_to,
				lead.`status` as status, lead.`title` as title, lead.`due_date` as due_date, lead.`description` as description,
			  	lead.`CreatedDate` as createdDate, lead.`CreatedBy` as createdBy, lead.`ModifiedDate` as modifiedDate, lead.`ModifiedBy` as modifiedBy
			  	FROM `leads_tasks` lead WHERE lead.id = $taskId";
			return $this->getSingleObject($query, 'Task');
		}

		function getMyOpenTasks($companyId, $userId) {
			$query = "SELECT  lead.`id` as id, lead.`company_id` as company_id, lead.`lead_id` as lead_id, lead.`opportunity_id` as opportunity_id, lead.`assigned_to` as assigned_to,
				lead.`status` as status, lead.`title` as title, lead.`due_date` as due_date, lead.`description` as description,
			  	lead.`CreatedDate` as createdDate, lead.`CreatedBy` as createdBy, lead.`ModifiedDate` as modifiedDate, lead.`ModifiedBy` as modifiedBy
			  	FROM `leads_tasks` lead WHERE lead.company_id = $companyId and lead.assigned_to = $userId and lead.status != 'Completed' and lead.due_date > NOW()";
			return $this->getList($query, 'Task');
		}

		function getMyOverdueTasks($companyId, $userId) {
			$query = "SELECT  lead.`id` as id, lead.`company_id` as company_id, lead.`lead_id` as lead_id, lead.`opportunity_id` as opportunity_id, lead.`assigned_to` as assigned_to,
				lead.`status` as status, lead.`title` as title, lead.`due_date` as due_date, lead.`description` as description,
			  	lead.`CreatedDate` as createdDate, lead.`CreatedBy` as createdBy, lead.`ModifiedDate` as modifiedDate, lead.`ModifiedBy` as modifiedBy
			  	FROM `leads_tasks` lead WHERE lead.company_id = $companyId and lead.assigned_to = $userId and lead.status != 'Completed' and lead.due_date < NOW()";
			return $this->getList($query, 'Task');
		}

		function getMyCalendarTasks($filter, $userId) {
			$query = "SELECT  lead.`id` as id, lead.`company_id` as company_id, lead.`lead_id` as lead_id, lead.`opportunity_id` as opportunity_id, lead.`assigned_to` as assigned_to,
				lead.`status` as status, lead.`title` as title, lead.`due_date` as due_date, lead.`description` as description,
			  	lead.`CreatedDate` as createdDate, lead.`CreatedBy` as createdBy, lead.`ModifiedDate` as modifiedDate, lead.`ModifiedBy` as modifiedBy
			  	FROM `leads_tasks` lead WHERE lead.assigned_to = $userId";
			
			if (!empty($filter->start_date))$query .= " and lead.due_date > '$filter->start_date'";
			if (!empty($filter->end_date))$query .= " and lead.due_date < '$filter->end_date'";
			return $this->getList($query, 'Task');
		}
		
		function updateLeadTask($leadTask) { 
				
			$query = "update `leads_tasks` set `assigned_to` = ?, `status`= ?, `title`= ?, `due_date`= ?, `description`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("assigned_to", "status", "title", "due_date", "description", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $leadTask, $params);
		}
		
		function updateLeadTaskToOpportunity($leadId, $opportunityId) {
		
			$query = "update `leads_tasks` set `lead_id`= null, `opportunity_id`= ? WHERE lead_id = ?";
			$object = array();
			$object["lead_id"] = $leadId;
			$object["opportunity_id"] = $opportunityId;
			$params = array("opportunity_id", "lead_id");
			return $this->update($query, (object) $object, $params);
		}
	}
?>