<?php
class OpportunityService {
	
	private $opportunityDao;
	private $accountDao;
	private $leadDao;
	private $leadCompanyDao;
	function __construct() {
		$this->opportunityDao = new OpportunityDao();
		$this->leadDao = new LeadDao();
		$this->leadCompanyDao = new LeadCompanyDao();
		$this->accountDao = new AccountDao();
	}
	
	function createOpportunity($opportunity) {
		
		if (empty($opportunity)) throw new ValidationException('Opportunity cannot be empty.');
		if (empty($opportunity->lead_company_id)) throw new ValidationException('Company Information cannot be empty.');
		
		$opportunity = Util::addDefaultObjecKeys($opportunity, array("company_id"));
		$opportunity = $this->opportunityDao->createOpportunity($opportunity);
		return $opportunity;
	}

	function updateOpportunity($opportunity) {
		
		if (empty($opportunity)) throw new ValidationException('Opportunity cannot be empty.');
		if (empty($opportunity->id)) throw new ValidationException('OpportunityId cannot be empty.');
		
		if (empty($opportunity->lead_company) && empty($opportunity->lead_company_id)) {
			throw new ValidationException('Company Information cannot be empty.');
		}
		
		$opportunity->lead_company = Util::addDefaultObjecKeys($opportunity->lead_company);
		$this->leadCompanyDao->updateLeadCompany($opportunity->lead_company);
		$opportunity = Util::addDefaultObjecKeys($opportunity);
		$opportunity = $this->opportunityDao->updateOpportunity($opportunity);
		return $opportunity;
	}
	
	function getAllOpportunities($filter) {
		$leads = $this->opportunityDao->getAllOpportunities($filter, MarketingUtil::getCompanyId($filter));
		return $leads;
	}

	function getOpportunity($opportunityId) {
		
		if (empty($opportunityId)) throw new ValidationException('OpportunityId cannot be empty.');
		$opportunity = $this->opportunityDao->getOpportunity($opportunityId);
		if (empty($opportunity)) throw new ValidationException("Invalid Opportunity Id");
		$opportunity->lead_company = $this->leadCompanyDao->getLeadCompany($opportunity->lead_company_id);
		return $opportunity;
	}
	
	function getAllLeadTasksByLeadId($opportunityId, $companyId = -1) {
		return $this->opportunityDao->getAllLeadTasksByLeadId($opportunityId, $companyId);
	}

	function submitOpportunity($request) {
		$opportunity = $this->opportunityDao->getOpportunity($request->id);
		$status = $opportunity->status;
		$toStatus = $status;
		if (LeadStatus::QUALIFIED == $status) {
			$opportunity->status = LeadStatus::REQ_ANALYSIS;
		} else if (LeadStatus::REQ_ANALYSIS == $status) {
			$opportunity->status = LeadStatus::PROPOSAL;
		} else if (LeadStatus::PROPOSAL == $status) {
			$opportunity->status = LeadStatus::NEGOTIATION;
		}
		
		$this->opportunityDao->updateOpportunityStatus($opportunity);
		return $opportunity;
	}

	function holdOpportunity($request) {
		$opportunity = $this->opportunityDao->getOpportunity($request->id);
		if ($opportunity->status == LeadStatus::HOLD) {
			$opportunity->status = $opportunity->hold_status;
			$opportunity->hold_status = null;
			if (empty($opportunity->status)) $opportunity->status = LeadStatus::QUALIFIED;
		} else {
			$opportunity->hold_status = $opportunity->status; 
			$opportunity->status = LeadStatus::HOLD;
		}
		$this->opportunityDao->holdOpportunityStatus($opportunity);
		return $opportunity;
	}

	function wonOpportunity($request) {
		$opportunity = $this->opportunityDao->getOpportunity($request->id);
		$opportunity->status = LeadStatus::WON;
		if (empty($opportunity->account_id) && empty($request->account_id)) {
			$account = array();
			$account["company_id"] = $opportunity->company_id;
			$account = Util::addDefaultObjecKeys($account);
			$account = $this->accountDao->createAccount($account);
			$opportunity->account_id = $account->id;
		} else if (empty($opportunity->account_id) && !empty($request->account_id)) {
			$opportunity->account_id = $request->account_id;
		}
		$this->opportunityDao->wonOpportunityStatus($opportunity);
		return $opportunity;
	}

	function lostOpportunity($request) {
		$opportunity = $this->opportunityDao->getOpportunity($request->id);
		$opportunity->status = LeadStatus::LOST;
		$this->opportunityDao->updateOpportunityStatus($opportunity);
		return $opportunity;
	}
	
	function backToNegotiation($request) {
		$opportunity = $this->opportunityDao->getOpportunity($request->id);
		$opportunity->status = LeadStatus::NEGOTIATION;
		$this->opportunityDao->updateOpportunityStatus($opportunity);
		return $opportunity;
	}
	
	function getFieldByName($fieldName, $fieldValue) {
		if (empty($fieldName)) {
			throw new ValidationException('FieldName cannot be empty.');
		}
		return $this->opportunityDao->getFieldByName($fieldName, $fieldValue);
	}
}

?>