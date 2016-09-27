<?php
class ImportService {
	
	private $importDao;
	private $logger;
	function __construct() {
		$this->logger = Logger::getLogger("ImportService");
		$this->importDao = new ImportDao();
	}
	
	function importLeads($importId) {
		
		$leadService = new LeadService();
		$import = $this->importDao->getLeadImport($importId);
		$headers = json_decode($import->headers);
		$association = json_decode($import->association);
		
		$reader = new ExcelReader();
		$fullLocation = MarketingUtil::getImportBaseLocation().$import->location;
		$worksheet = $reader->getExcelWorkBook($fullLocation);
		$start = 2;
		$length = 10;
		$rows = $reader->getWorkSheetRows($worksheet, $start, $length);
		$total = 0;
		$processed = 0;
		while(count($rows) > 0) {
			
			$total += count($rows);
			foreach ($rows as $row) {
				$lead = $this->mapFields($association, $row);
				try {
					$lead = Util::addDefaultObjecKeys($lead, array("company_id"));
					$lead->company_id = MarketingUtil::getCompanyId($lead);
					
					$lead->lead_company = Util::addDefaultObjecKeys($lead->lead_company, array("company_id"));
					$lead->lead_company->company_id = $lead->company_id;
					
					$lead = $leadService->createLead($lead, $import->company_id);
					$this->logger->info("Creating Lead: " + $lead->id + " -> "  + print_r($rows, true));
					$processed++;
				} catch(Exception $e) {
					$this->logger->error("Error Creating Lead:" + print_r($rows, true), $e);
				}
			}
			
			$start = $start + $length;
			$rows = $reader->getWorkSheetRows($worksheet, $start, $length);
		}
		$lead = $this->importDao->updateLeadImport($import);
		return $lead;
	}
	
	function mapFields($fields, $row) {
		
		$lead = new Lead();
		$leadCompany = new LeadCompany();
		$lead->lead_company = $leadCompany;
		foreach($fields as $key => $val) {
			switch ($val) {
				
				case 'company_id':
				case 'status':
				case 'lead_company_id':
				case 'source':
				case 'reference':
				case 'additional_info':
					$lead->$val = $row[$key];
					break;
					
				case 'lead_company_name':
				case 'industry':
				case 'description':
				case 'contact_person':
				case 'designation':
				case 'phone1':
				case 'phone2':
				case 'address_line1':
				case 'address_line2':
				case 'address_line3':
				case 'city':
				case 'state':
				case 'country':
				case 'pincode':
				case 'mailid':
				case 'website':
				case 'latitude':
				case 'longitude':
					$leadCompany->$val = $row[$key];
					break;
			}
		}
		
		return $lead;
	}
	
}

?>