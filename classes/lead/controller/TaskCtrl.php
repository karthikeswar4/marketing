<?php
class TaskCtrl {
	
	private $taskService;
	function __construct() {
		$this->taskService = new TaskService();
	}
	
	/**
	 * @secured
	 * @transactional
	 */
	function createTask($request) {
		return $this->taskService->createLeadTask($request);
	}

	/**
	 * @secured
	 * @transactional
	 */
	function updateTask($request) {
		return $this->taskService->updateLeadTasks($request);
	}
	
	/**
	 * @secured
	 */
	function getAllTasksByLead($request) {
		$companyId = MarketingUtil::getCompanyId($request);
		if (isset($_GET["company_id"]) && !empty($_GET["company_id"])) $companyId = $_GET["company_id"];
		return $this->taskService->getAllLeadTasksByLeadId($_GET["lead_id"], $companyId);
	}

	/**
	 * @secured
	 */
	function getAllTasksByOpportunity($request) {
		$companyId = -1;
		if (isset($_GET["company_id"]) && !empty($_GET["company_id"])) $companyId = $_GET["company_id"];
		return $this->taskService->getAllTasksByOpportunity($_GET["opportunity_id"], $companyId);
	}

	/**
	 * @secured
	 */
	function getAllLeadTasks($request) {
		$companyId = -1;
		if (isset($_GET["company_id"]) && !empty($_GET["company_id"])) $companyId = $_GET["company_id"];
		return $this->taskService->getAllLeadTasksByLeadId($request, $companyId);

	}
	/**
	 * @secured
	 */
	function getAllLeadOpportunityTasks($request) {
		$companyId = MarketingUtil::getCompanyId($request);
		$leadId = null;
		$opportunityId = null;
		if (isset($_GET["company_id"]) && !empty($_GET["company_id"])) $companyId = $_GET["company_id"];
		if (isset($_GET["lead_id"]) && !empty($_GET["lead_id"])) $leadId = $_GET["lead_id"];
		if (isset($_GET["opportunity_id"]) && !empty($_GET["opportunity_id"])) $opportunityId = $_GET["opportunity_id"];
		return $this->taskService->getAllLeadOpportunityTasks($leadId, $opportunityId, $companyId);
	}
	
	/**
	 * @secured
	 */
	function getTask() {
		return $this->taskService->getTask($_GET["record_id"]);
	}

	/**
	 * @secured
	 */
	function getMyOpenTasks($request) {
		return $this->taskService->getMyOpenTasks();
	}
	
	/**
	 * @secured
	 */
	function getMyOverdueTasks($request) {
		return $this->taskService->getMyOverdueTasks();
	}
	
	/**
	 * @secured
	 */
	function getMyCalendarTasks($request) {
		return $this->taskService->getMyCalendarTasks($request);
	}
}
?>