<?php

	class EmployeeCtrl {
		private $employeeService;
		function __construct() {
			$this->employeeService = new EmployeeService();
		}

		function getAllEmployees($request) {
			$employees = $this->employeeService->getAllEmployees($request);
			return $employees;
		}
		
		function getEmployeesByName($request) {
			$employees = $this->employeeService->getEmployeesByName($_GET["q"]);
			return $employees;
		}
		
		function getEmployee($request) {
			$employee = $this->employeeService->getEmployee($_GET['loanId']);
			return $employee;
		}

		function createEmployee($request) {
			$request = Util::addDefaultObjecKeys($request);
			$request = $this->employeeService->createEmployee($request);
			return $request;
		}

		function updateEmployee($request) {
			$request = $this->employeeService->updateEmployee($request);
			return $request;
		}
	}
?>