<?php
class LeadCompanyService {
	
	private $logger;
	private $leadCompanyDao;
	function __construct() {
		$this->logger = Logger::getLogger("LeadCompanyService");
		$this->leadCompanyDao = new LeadCompanyDao();
	}
	
	function getAllLeadCompanies($filter) {
		return $this->leadCompanyDao->getAllLeadsCompany($filter, MarketingUtil::getCompanyId($filter));
	}
}

?>