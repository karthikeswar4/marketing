<?php
class AccountCtrl {
	
	private $accountService;
	function __construct() {
		$this->accountService = new AccountService();
	}
	
	/**
	 * @secured
	 * @transactional
	 */
	function createOpportunity($request) {
		$job = $this->accountService->createAccount($request);
		return $job;
	}

	/**
	 * @secured
	 * @transactional
	 */
	function updateOpportunity($request) {
		$job = $this->accountService->updateAccount($request);
		return $job;
	}
	
	/**
	 * @secured
	 */
	function getAllOpportunities($request) {
		$jobs = $this->accountService->getAllAccounts($request);
		return $jobs;
	}
}
?>