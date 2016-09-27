<?php
class ContactService {
	
	private $contactDao;
	private $leadCompanyDao;
	function __construct() {
		$this->contactDao = new ContactDao();
		$this->leadCompanyDao = new LeadCompanyDao();
	}
	
	function createContact($contact) {
		
		if (empty($contact)) throw new ValidationException('Contact cannot be empty.');
		if (empty($contact->lead_company_id)) throw new ValidationException('Company Information cannot be empty.');
		
		$contact = Util::addDefaultObjecKeys($contact, array("company_id"));
		$contact = $this->contactDao->createContact($contact);
		return $contact;
	}

	function updateContact($contact) {
		
		if (empty($contact)) throw new ValidationException('Contact cannot be empty.');
		if (empty($contact->id)) throw new ValidationException('ContactId cannot be empty.');
		$contact = Util::addDefaultObjecKeys($contact);
		
		$contactId = $contact->id;
		$companyContact = $contact;
		$companyContact->id = $contact->lead_company_id;
		$contact = $this->leadCompanyDao->updateLeadCompany($companyContact);
		$contact->id = $contactId;
		return $contact;
	}
	
	function getAllContacts($filter) {
		$leads = $this->contactDao->getAllContacts($filter, MarketingUtil::getCompanyId());
		return $leads;
	}

	function getContact($contactId) {
		
		if (empty($contactId)) new ValidationException('LeadId cannot be empty.');
		return $this->contactDao->getContact($contactId);				
	}
}
?>