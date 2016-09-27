<?php
class ContactCtrl {
	
	private $ContactService;
	function __construct() {
		$this->ContactService = new ContactService();
	}
	
	/**
	 * @secured
	 * @transactional
	 */
	function createContact($request) {
		$job = $this->ContactService->createContact($request);
		return $job;
	}

	/**
	 * @secured
	 * @transactional
	 */
	function updateContact($request) {
		$job = $this->ContactService->updateContact($request);
		return $job;
	}
	
	/**
	 * @secured
	 */
	function getAllContacts($request) {
		$jobs = $this->ContactService->getAllContacts($request);
		return $jobs;
	}

	/**
	 * @secured
	 */
	function getContact($request) {
		$jobs = $this->ContactService->getContact($_GET["record_id"]);
		return $jobs;
	}
}
?>