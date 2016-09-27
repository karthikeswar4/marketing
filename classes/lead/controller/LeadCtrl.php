<?php
class LeadCtrl {
	
	private $logger;
	private $leadService;
	function __construct() {
		$this->logger = Logger::getLogger("LeadCtrl");
		$this->leadService = new LeadService();
	}
	
	/**
	 * @secured
	 * @transactional
	 */
	function createLead($request) {
		$job = $this->leadService->createLead($request);
		return $job;
	}

	/**
	 * @secured
	 * @transactional
	 */
	function updateLead($request) {
		$job = $this->leadService->updateLead($request);
		return $job;
	}
	
	/**
	 * @secured
	 */
	function getAllLeads($request) {
		$jobs = $this->leadService->getAllLeads($request);
		return $jobs;
	}

	/**
	 * @secured
	 */
	function getAllLeadTasksByLead($request) {
		return $this->leadService->getAllLeadTasksByLeadId($_GET["lead_id"], $_GET["company_id"]);
	}

	/**
	 * @secured
	 */
	function getAllLeadTasks($request) {
		return $this->leadService->getAllLeadTasksByLeadId($_GET["lead_id"], $_GET["company_id"]);
	}
	
	/**
	 * @secured
	 */
	function getLead() {
		$jobs = $this->leadService->getLead($_GET["record_id"]);
		return $jobs;
	}
	
	/**
	 * @secured
	 */
	function getMyLeads() {
		return $this->leadService->getMyLeads();
	}
	
	/**
	 * @secured
	 */
	function getLeadStatistics() {
		return $this->leadService->getLeadStatistics();
	}
	
	/**
	 * @secured
	 */
	function getLeadByLeadNumber() {
		$jobs = $this->leadService->getLeadByLeadNumber($_GET["q"]);
		return $jobs;
	}
	
	/**
	 * @secured
	 * @transactional
	 */
	function submitLead($request) {
		return $this->leadService->submitLead($_GET["lead_id"]);
	}
	
	/**
	 * @secured
	 * @transactional
	 */
	function importFile($request, $attachment) {
		return $this->leadService->importFile($request, $attachment);
	}

	/**
	 * @secured
	 * @transactional
	 */
	function mapImportedFile($request) {
		return $this->leadService->mapImportedFile($request);
	}

	/**
	 * @secured
	 */
	function getCampaignLeads($request) {
		return $this->leadService->getCampaignLeads($_GET["record_id"]);
	}
	
	/**
	 * @secured
	 * @transactional
	 */
	function addAttachment($request, $attachment) {
		return $this->leadService->addAttachment($request, $attachment);
	}
	
	/**
	 * @secured
	 */
	function searchValue() {
		return $this->leadService->getFieldByName($_GET['field'], $_GET['q']);
	}
}
?>