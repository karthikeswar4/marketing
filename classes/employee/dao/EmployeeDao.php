<?php

	class EmployeeDao extends BaseDao {

		function retrieveAllEmployees($filter) {

			$query = "SELECT `ID` as id, `name` as name, `phone` as phone, `address` as address, `place` as place, `designation` as designation, 
					`CreatedDate` as createdDate, `ModifiedDate` as modifiedDate, `CreatedBy` as createdBy, `ModifiedBy` as modifiedBy FROM `employee`";
			
			$temp = "";
			if (!empty($filter) && isset($filter)) {
				
				if (isset($filter->name)) $temp = $temp." and name = '".$filter->name."'";
				if (isset($filter->phone)) $temp = $temp." and phone like '".$filter->phone."%'";
				if (isset($filter->place)) $temp = $temp." and place like '".$filter->place."%'";
				if (isset($filter->designation)) $temp = $temp." and designation = '".$filter->designation."'";
				if (strlen($temp) > 0) {
					$query = $query." where ".substr($temp, 4);
				}
			}
					
			return $this->getList($query, 'Employee');
		}
		
		function getEmployeesByName($name) {

			$query = "SELECT `ID` as id, `name` as name FROM `employee` WHERE name like '".$name."%'";
			return $this->getList($query, 'Employee');
		}

		function retrieveEmployee($loanId) {

			$query = "SELECT `ID` as id, `name` as name, `phone` as phone, `address` as address, `place` as place, `designation` as designation, 
					`CreatedBy` as createdBy, `ModifiedBy` as modifiedBy FROM `employee` WHERE  ID='".$loanId."'";
			return $this->getSingleObject($query, 'Employee');
		}

		function createEmployee($loan) {

			$query = "INSERT INTO  `employee` (`name`, `phone`, `address`, `place`, `designation`, `CreatedDate`, `ModifiedDate`, `CreatedBy`, `ModifiedBy`) 
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
			$params = array("name", "phone", "address", "place", "designation", "createdDate", "modifiedDate", "createdBy", "modifiedBy");
			return $this->create($query, $loan, $params);
		}
		
		function updateEmployee($loan) {

			$query = "UPDATE `employee` SET `ID` = ?, `lorryID` = ?, `bankfinance` = ?, `loannumber` = ?, `amount` = ?, `emiamount` = ?, `duration` = ?, `emistartdate` = ?, `emienddate` = ?, `ModifiedDate` = ?, `ModifiedBy` = ? WHERE ID=".$loan->id;
			$params = array("id", "name", "phone", "address", "place", "designation", "modifiedDate", "modifiedBy");
			return  $this->update($query, $loan, $params);
		}
	}
?>