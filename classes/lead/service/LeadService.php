<?php
class LeadService {
	
	private $logger;
	private $taskDao;
	private $leadDao;
	private $leadCompanyDao;
	private $contactDao;
	private $importDao;
	private $importService;
	private $opportunityDao;
	function __construct() {
		$this->logger = Logger::getLogger("LeadService");
		$this->leadDao = new LeadDao();
		$this->leadCompanyDao = new LeadCompanyDao();
		$this->contactDao = new ContactDao();
		$this->taskDao = new TaskDao();
		$this->opportunityDao = new OpportunityDao();
		$this->importDao = new ImportDao();
		$this->importService = new ImportService();
	}
	
	function createLead($lead, $companyId = 0) {
		
		if (empty($lead)) throw new ValidationException('Lead cannot be empty.');
		if (empty($lead->lead_company) && empty($lead->lead_company_id)) {
			throw new ValidationException('Company Information cannot be empty.');
		}
		
		if (empty($lead->lead_company) || empty($lead->lead_company->id)) {
			$lead->lead_company = Util::addDefaultObjecKeys($lead->lead_company);
			$this->leadCompanyDao->createLeadCompany($lead->lead_company);
		}

		$lead->lead_company_id = $lead->lead_company->id;
		$lead->status = LeadStatus::CREATED;
		$lead = Util::addDefaultObjecKeys($lead, array("company_id"));
		if (isset($companyId) && $companyId != 0) {
			$lead->company_id = $companyId;
		} else {
			$lead->company_id = MarketingUtil::getCompanyId($lead);
		}
		$lead = $this->leadDao->createLead($lead);
		return $lead;
	}

	function updateLead($lead) {
		
		if (empty($lead)) throw new ValidationException('Lead cannot be empty.');
		if (empty($lead->id)) throw new ValidationException('LeadId cannot be empty.');
		
		$this->logger->info("Updating Lead: ". $lead->id);
		if (empty($lead->lead_company) && empty($lead->lead_company_id)) {
			throw new ValidationException('Company Information cannot be empty.');
		}
		
		$lead->lead_company = Util::addDefaultObjecKeys($lead->lead_company);
		$this->leadCompanyDao->updateLeadCompany($lead->lead_company);
		$lead = Util::addDefaultObjecKeys($lead);
		$lead = $this->leadDao->updateLead($lead);
		return $lead;
	}
	
	function getAllLeads($filter) {
		$leads = $this->leadDao->getAllLeads($filter, MarketingUtil::getCompanyId($filter));
		return $leads;
	}

	function getLead($leadId) {
		
		if (empty($leadId)) throw new ValidationException('LeadId cannot be empty.');
		$lead = $this->leadDao->getLead($leadId);
		
		if (empty($lead)) throw new ValidationException('LeadId is invalid.');
		$lead->lead_company = $this->leadCompanyDao->getLeadCompany($lead->lead_company_id);
		return $lead;
	}

	function getMyLeads() {
		return $this->leadDao->getMyLeads(MarketingUtil::getCompanyId(), Util::getLoggedInUser()->id);
	}
	
	function getLeadStatistics() {
		$leadList =  $this->leadDao->getLeadStatistics(MarketingUtil::getCompanyId(), Util::getLoggedInUser()->id);
		$opprList =  $this->opportunityDao->getOpportunityStats(MarketingUtil::getCompanyId(), Util::getLoggedInUser()->id);
		return array_merge($leadList, $opprList);
	}
	
	private function moveLeadToOpportunity($lead) {
		
		if (empty($lead)) throw new ValidationException('Lead cannot be empty.');
		
		$leadId = $lead->id;
		$this->logger->info("moveLeadToOpportunity Lead: ". $leadId);
		$lead->status = LeadStatus::PROPOSAL;
		
		$this->logger->info("Creating Opportunity: ". $leadId);
		$opportunity = $this->opportunityDao->createOpportunity($lead);
		$this->taskDao->updateLeadTaskToOpportunity($leadId, $opportunity->id);
		
		$this->logger->info("Deleting Lead: ". $leadId);
		$this->leadDao->deleteLead($leadId);
		return $opportunity;
	}
	
	function submitLead($leadId) {
		
		$this->logger->info("Submit Lead for: ". $leadId);
		if (empty($leadId)) throw new ValidationException('Lead ID cannot be empty.');
		
		$lead = $this->leadDao->getLead($leadId);
		if (empty($lead)) throw new ValidationException("Lead does not exists.");
		$status = $lead->status;
		$toStatus = $status;
		if (LeadStatus::CREATED == $status) {
			$lead->status = LeadStatus::QUALIFIED;
			$contact = Util::addDefaultObjecKeys(null, array("company_id", "lead_company_id"));
			$contact->lead_company_id = $lead->lead_company_id;
			$contact->company_id = $lead->company_id;
			$this->contactDao->createContact($contact);
		} else if (LeadStatus::QUALIFIED == $status) {
			$lead->status = LeadStatus::REQ_ANALYSIS;
		} else if (LeadStatus::REQ_ANALYSIS == $status) {
			$lead->status = LeadStatus::PROPOSAL;
			return $this->moveLeadToOpportunity($lead);
		}
	
		$this->leadDao->updateLeadStatus($lead);
		return $lead;
	}
	
	private function createImportModel($file_name, $type, $location, $companyId) {
	
		$import = new Import();
		$import->file_name = $file_name;
		$import->type = $type;
		$import->location = $location;
		$import->company_id = $companyId;
		$import = Util::addDefaultObjecKeys($import);
		return $import;
	}
	
	function importFile($request, $attachment) {
		
		$file = $attachment->file;
		$tmpLocation = $file->tmp_name;
		$fileName = $file->name;
		$type = $file->type;

		$this->logger->debug("Importing file");
		
		$companyId = MarketingUtil::getCompanyId();
		$fullLocation = Util::moveFile($tmpLocation, MarketingUtil::getImportLocation($fileName, $companyId));
		$this->logger->debug("File moved to : ". $fullLocation);
		
		try {
			
			$baseLocation = MarketingUtil::getImportBaseLocation();
			$fileLocation = substr($fullLocation, strlen($baseLocation));
			
			$import = $this->createImportModel($fileName, $type, $fileLocation, $companyId);
			$import = $this->importDao->createLeadImport($import);
			
			$this->logger->debug("Started Reading Excel : ". $fullLocation);
			$excelReader = new ExcelReader();
			$headers = $excelReader->readExcelWorkBook($fullLocation, 1, 1);
			$this->logger->debug("Finished Reading Excel : ". $fullLocation);
			if (is_null($headers) || sizeof($headers) < 0) {
				throw new ValidationException("Invalid Sheet");
			}
			
			$import->headers = json_encode($headers[0]);
			$this->importDao->updateLeadImportHeaders($import);
			
		} catch (Exception $e) {
			unlink($fullLocation);
			throw $e;
		}
		
		return $import;
	}

	function mapImportedFile($request) {
		if (empty($request)) throw new ValidationException('Lead Import Association cannot be empty.');
		$this->importDao->updateLeadImportMapping($request);
		$this->importService->importLeads($request->id);
	}

	function getCampaignLeads($request) {
		if (empty($request)) throw new ValidationException('campaign Id cannot be empty.');
		return $this->leadDao->getLeadsByCampaignId($request, MarketingUtil::getCompanyId());
	}
	
	function addAttachment($request, $attachment) {
		
		$file = $attachment->file;
		$tmpLocation = $file->tmp_name;
		$fileName = $file->name;
		$type = $file->type;
		
		$this->logger->debug("Importing file");
		
		$companyId = MarketingUtil::getCompanyId();
		$fullLocation = Util::moveFile($tmpLocation, MarketingUtil::getImportLocation($fileName, $companyId, $request->lead_id));
		$this->logger->debug("File moved to : ". $fullLocation);
		
		
	}
	
	function getFieldByName($fieldName, $fieldValue) {
		if (empty($fieldName)) {
			throw new ValidationException('FieldName cannot be empty.');
		}
		return $this->leadDao->getFieldByName($fieldName, $fieldValue);
	}
}

?>