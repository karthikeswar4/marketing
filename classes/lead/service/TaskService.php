<?php
class TaskService {
	
	private $taskDao;
	function __construct() {
		$this->taskDao = new TaskDao();
	}
	
	function createLeadTask($lead) {
		
		if (empty($lead)) throw new ValidationException('Lead cannot be empty.');
		
		$lead = Util::addDefaultObjecKeys($lead, array("company_id"));
		$lead->company_id = MarketingUtil::getCompanyId($lead);
		$lead = $this->taskDao->createLeadTask($lead);
		return $lead;
	}

	function updateLeadTasks($task) {
		
		if (empty($task)) throw new ValidationException('Task cannot be empty.');
		if (empty($task->id)) throw new ValidationException('TaskId cannot be empty.');
		
		$task = Util::addDefaultObjecKeys($task);
		$task = $this->taskDao->updateLeadTask($task);
		return $task;
	}
	
	function getAllTasks($filter) {
		$leads = $this->taskDao->getAllTasks($filter, MarketingUtil::getCompanyId($filter));
		return $leads;
	}

	function getTask($taskId) {
		
		if (empty($taskId)) throw new ValidationException('LeadId cannot be empty.');
		return $this->taskDao->getLeadTask($taskId);
	}

	function getMyOpenTasks() {
		return $this->taskDao->getMyOpenTasks(MarketingUtil::getCompanyId(), Util::getLoggedInUser()->id);
	}

	function getMyOverdueTasks() {
		return $this->taskDao->getMyOverdueTasks(MarketingUtil::getCompanyId(), Util::getLoggedInUser()->id);
	}
	
	function getMyCalendarTasks($filter) {
		return $this->taskDao->getMyCalendarTasks($filter, Util::getLoggedInUser()->id);
	}
	
	function getAllLeadTasksByLeadId($leadId, $companyId) {
		$filter = array();
		$filter["lead_id"] = $leadId;
		$leads = $this->taskDao->getAllTasks((object) $filter, $companyId);
		return $leads;
	}
	
	function getAllLeadOpportunityTasks($leadId = null, $opportunityId = null, $companyId) {
		$leads = $this->taskDao->getAllLeadOpportunityTasksById($leadId, $opportunityId, $companyId);
		return $leads;
	}

	function getAllTasksByOpportunity($leadId, $companyId) {
		$filter = array();
		$filter["opportunity_id"] = $leadId;
		$leads = $this->taskDao->getAllTasks((object) $filter, $companyId);
		return $leads;
	}
}

?>