<?php
class AccountService {
	
	private $accountDao;
	private $leadDao;
	function __construct() {
		$this->accountDao = new AccountDao();
		$this->leadDao = new LeadDao();
	}
	
	function createAccount($account) {
		
		if (empty($account)) throw new ValidationException('Account cannot be empty.');
		$account = Util::addDefaultObjecKeys($account, array("company_id"));
		$account->company_id = MarketingUtil::getCompanyId($account);
		$account = $this->accountDao->createAccount($account);
		return $account;
	}

	function updateAccount($account) {
		
		if (empty($account)) throw new ValidationException('Account cannot be empty.');
		if (empty($account->id)) throw new ValidationException('AccountId cannot be empty.');
		$account = Util::addDefaultObjecKeys($account);
		$account = $this->accountDao->updateAccount($account);
		return $account;
	}
	
	function getAllAccounts($filter) {
		return $this->accountDao->getAllAccounts($filter, MarketingUtil::getCompanyId($filter));
	}

	function getAccount($accountId) {
		
		if (empty($accountId)) throw new ValidationException('LeadId cannot be empty.');
		return $this->accountDao->getAccount($accountId);
	}
}

?>