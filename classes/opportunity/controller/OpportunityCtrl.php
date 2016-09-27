<?php
class OpportunityCtrl {
	
	private $opportunityService;
	function __construct() {
		$this->opportunityService = new OpportunityService();
	}
	
	/**
	 * @secured
	 * @transactional
	 */
	function createOpportunity($request) {
		$job = $this->opportunityService->createOpportunity($request);
		return $job;
	}

	/**
	 * @secured
	 * @transactional
	 */
	function updateOpportunity($request) {
		$job = $this->opportunityService->updateOpportunity($request);
		return $job;
	}
	
	/**
	 * @secured
	 */
	function getAllOpportunities($request) {
		$jobs = $this->opportunityService->getAllOpportunities($request);
		return $jobs;
	}

	/**
	 * @secured
	 */
	function getAllLeadTasksByLead($request) {
		return $this->opportunityService->getAllLeadTasksByLeadId($_GET["lead_id"], $_GET["company_id"]);
	}

	/**
	 * @secured
	 */
	function getAllLeadTasks($request) {
		return $this->opportunityService->getAllLeadTasksByLeadId($_GET["lead_id"], $_GET["company_id"]);
	}
	
	/**
	 * @secured
	 */
	function getOpportunity($request) {
		$jobs = $this->opportunityService->getOpportunity($_GET["record_id"]);
		return $jobs;
	}

	/**
	 * @secured
	 * @transactional
	 */
	function submitOpportunity($request) {
		return $this->opportunityService->submitOpportunity($request);
	}

	/**
	 * @secured
	 * @transactional
	 */
	function holdOpportunity($request) {
		return $this->opportunityService->holdOpportunity($request);
	}
	
	/**
	 * @secured
	 * @transactional
	 */
	function wonOpportunity($request) {
		return $this->opportunityService->wonOpportunity($request);
	}

	/**
	 * @secured
	 * @transactional
	 */
	function lostOpportunity($request) {
		return $this->opportunityService->lostOpportunity($request);
	}

	/**
	 * @secured
	 * @transactional
	 */
	function backToNegotiation($request) {
		return $this->opportunityService->backToNegotiation($request);
	}
}
?>