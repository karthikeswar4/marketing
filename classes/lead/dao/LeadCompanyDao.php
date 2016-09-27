<?php
	class LeadCompanyDao extends BaseDao {
		
		function getAllLeadsCompany($filter, $company_id) { 
				
			$conn = DBConnection::getConnection();	
			$query = "SELECT  leadcom.`id` as id,  leadcom.`company_id` as company_id,  leadcom.`lead_company_name` as lead_company_name,  leadcom.`industry` as industry,  leadcom.`description` as description, 
				leadcom.`contact_person` as contact_person, leadcom.`designation` as designation, leadcom.`phone1` as phone1, leadcom.`phone2` as phone2, leadcom.`address_line1` as address_line1,  
				leadcom.`address_line2` as address_line2, leadcom.`address_line3` as address_line3, leadcom.`city` as city, leadcom.`state` as state, leadcom.`country` as country, leadcom.`pincode` as pincode, 
				leadcom.`mailid` as mailid,	leadcom.`website` as website, leadcom.`source` as source, leadcom.`additional_info` as additional_info,  leadcom.`latitude` as latitude, leadcom.`longitude` as longitude, 
				leadcom.`CreatedDate` as createdDate, leadcom.`CreatedBy` as createdBy, leadcom.`ModifiedDate` as modifiedDate, leadcom.`ModifiedBy` as modifiedBy FROM `leads_company` leadcom
				WHERE leadcom.company_id = $company_id";
			
			if (!empty($filter->phone)) $query = $query." and leadcom.phone like %$filter->phone%";
			if (!empty($filter->company_name)) {
				$query = $query." and leadcom.lead_company_name like '$filter->company_name%'";
			}
			if (!empty($filter->state)) $query = $query." and leadcom.state like '$filter->state%'";
			if (!empty($filter->country)) $query = $query." and leadcom.country like '$filter->country%'";
			if (!empty($filter->industry)) $query = $query." and leadcom.industry like '$filter->industry%'";
			if (!empty($filter->contact_person)) $query = $query." and leadcom.contact_person like '$filter->contact_person%'";
			$query = $query." order by leadcom.CreatedDate";
			return $this->getList($query, 'LeadCompany');
		}

		function createLeadCompany($leadCompany) {
			
			$query = "INSERT INTO `leads_company` (`company_id`, `lead_company_name`, `industry`, `description`, `contact_person`, `designation`, `phone1`, 
				`phone2`, `address_line1`,	`address_line2`, `address_line3`, `city`, `state`, `country`, `pincode`, `mailid`, `website`,
				`latitude`, `longitude`, `CreatedDate`, `CreatedBy`, `ModifiedDate`, `ModifiedBy`)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
			
			$params = array("company_id", "lead_company_name", "industry", "description", "contact_person", "designation", "phone1", 
				"phone2", "address_line1",	"address_line2", "address_line3", "city", "state", "country", "pincode", "mailid", "website",
				"latitude", "longitude", "createdDate", "createdBy", "modifiedDate", "modifiedBy");
			
			return $this->create($query, $leadCompany, $params);
		}

		function getLeadCompany($leadCompanyId) {
			$query = "SELECT id, company_id, lead_company_name, industry, description, contact_person, designation, phone1, 
				phone2, address_line1,	address_line2, address_line3, city, state, country, pincode, mailid, website,
				latitude, longitude, createdDate, createdBy, modifiedDate, modifiedBy FROM leads_company WHERE id = $leadCompanyId";
			return $this->getSingleObject($query, 'LeadCompany');
		}
		
		function updateLeadCompany($lead) {
				
			$query = "update `leads_company` set `lead_company_name` = ?, `industry` = ?, `description` = ?, `contact_person` = ?, `designation`= ?, `phone1`= ?, `phone2`= ?,  
					`address_line1` = ?, `address_line2` = ?, `address_line3` = ?, `city` = ?, `state` = ?, `country` = ?, `pincode` = ?, `mailid` = ?, `website` = ?,
					`latitude` = ?, `longitude` = ?, `ModifiedDate` = ?, `ModifiedBy` = ?  where id = ?";
			
			$params = array("lead_company_name", "industry", "description", "contact_person", "designation", "phone1",
					"phone2", "address_line1",	"address_line2", "address_line3", "city", "state", "country", "pincode", "mailid", "website",
					"latitude", "longitude", "modifiedDate", "modifiedBy", "id");

			return $this->update($query, $lead, $params);
		}
		
		function getFieldByName($fieldName, $fieldValue) {
		
			$query = "select distinct($fieldName) as lead_company_name from leads_company where $fieldName is not null";
			if (!empty($fieldValue)) $query = $query." and $fieldName like '$fieldValue%'";
			return $this->getList($query, 'LeadCompany');
		}
	}
?>