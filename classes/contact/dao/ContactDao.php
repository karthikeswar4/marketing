<?php
	class ContactDao extends BaseDao {
		
		function getAllContacts($filter, $company_id) { 
				
			$query = "SELECT contact.id, contact.company_id, contact.lead_company_id, cmp.lead_company_name, cmp.industry, cmp.description, cmp.contact_person, cmp.designation, cmp.phone1,
				cmp.phone2, cmp.address_line1,	cmp.address_line2, cmp.address_line3, cmp.city, cmp.state, cmp.country, cmp.pincode, cmp.mailid, cmp.website,
				cmp.latitude, cmp.longitude, contact.createdDate, contact.createdBy, contact.modifiedDate, contact.modifiedBy 
				FROM lead_contacts contact INNER JOIN leads_company cmp ON contact.lead_company_id = cmp.id and contact.company_id = $company_id";

			if (!empty($filter->company_name)) $query .= " and cmp.lead_company_name LIKE '$filter->company_name%'";
			if (!empty($filter->phone)) $query .= " and (cmp.phone1 LIKE '$filter->phone%' OR cmp.phone1 LIKE '$filter->phone%')";
			
			$query = $query." order by contact.CreatedDate";
			return $this->getList($query, 'Contact');
		}

		function createContact($contact) { 

			$query = "INSERT INTO `lead_contacts` (`company_id`, `lead_company_id`, `CreatedDate`, `CreatedBy`, `ModifiedDate`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?)";

			$params = array("company_id", "lead_company_id", "createdDate", "createdBy", "modifiedDate", "modifiedBy");
			return $this->create($query, $contact, $params);
		}
		
		function getContact($contactId) {
			
			$query = "SELECT contact.id, contact.company_id, contact.lead_company_id, cmp.lead_company_name, cmp.industry, cmp.description, cmp.contact_person, cmp.designation, cmp.phone1,
				cmp.phone2, cmp.address_line1,	cmp.address_line2, cmp.address_line3, cmp.city, cmp.state, cmp.country, cmp.pincode, cmp.mailid, cmp.website,
				cmp.latitude, cmp.longitude, contact.createdDate, contact.createdBy, contact.modifiedDate, contact.modifiedBy 
				FROM lead_contacts contact INNER JOIN leads_company cmp ON contact.lead_company_id = cmp.id
				WHERE contact.id = $contactId";
			return $this->getSingleObject($query, 'Contact');
		}
		
		function updateContact($opportunity) {
				
			$query = "update `lead_contacts` set `lead_company_id`= ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("lead_company_id", "modifiedDate", "modifiedBy", "id");
			return $this->update($query, $opportunity, $params);
		}
	}
?>