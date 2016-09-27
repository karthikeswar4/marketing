<?php

	class EmployeeService {

		private $employeeDao;
		public function __construct()  {
			$this->employeeDao = new EmployeeDao();
		}

		function getAllEmployees($filter) {
			return $this->employeeDao->retrieveAllEmployees($filter);
		}

		function getEmployeesByName($filter) {
			return $this->employeeDao->getEmployeesByName($filter);
		}
		
		function getEmployee($employeeId) {
			if (empty($employeeId)) throw new ValidationException("LoanId cannot be empty");
			return $this->employeeDao->retrieveEmployee($employeeId);
		}
		
		function createEmployee($employee) {
			
			if (empty($employee)) throw new ValidationException("Loan cannot be empty");
			if (empty($employee->name)) throw new ValidationException("Employee Name is mandatory");
			if (empty($employee->phone)) throw new ValidationException("Phone is mandatory");
			if (empty($employee->address)) throw new ValidationException("Address is mandatory");
			if (empty($employee->designation)) throw new ValidationException("Designation is mandatory");
			return $this->employeeDao->createEmployee($employee);
		}
		
		function updateEmployee($employee) {
			if (empty($employee)) throw new ValidationException("Loan cannot be empty");
			if (empty($employee->id)) throw new ValidationException("Id is mandatory");
			if (empty($employee->name)) throw new ValidationException("Employee Name is mandatory");
			if (empty($employee->phone)) throw new ValidationException("Phone is mandatory");
			if (empty($employee->address)) throw new ValidationException("Address is mandatory");
			if (empty($employee->designation)) throw new ValidationException("Designation is mandatory");
			return $this->employeeDao->updateEmployee($employee);
		}
	}
?>