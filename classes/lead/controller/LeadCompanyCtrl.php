<?php
class LeadCompanyCtrl {
	
	private $logger;
	private $leadCompanyService;
	function __construct() {
		$this->logger = Logger::getLogger("LeadCompanyCtrl");
		$this->leadCompanyService = new LeadCompanyService();
	}
	
	/**
	 * @secured
	 */
	function getAllLeadCompanies($request) {
		return $this->leadCompanyService->getAllLeadCompanies($request);
	}

	/**
	 * @secured
	 */
	function searchValue() {
		return $this->leadCompanyService->getFieldByName($_GET['field'], $_GET['q']);
	}
}
?>