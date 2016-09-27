<?php

	class CompanyCtrl {
		private $companyService;
		private $logger;
		function __construct() {
			$this->logger = Logger::getLogger("CompanyCtrl");
			$this->companyService = new CompanyService();
		}

		/**
		 * @secured
		 * 
		 * @param unknown $request
		 * @return multitype:
		 */
		function getAllCompanies($request) {
			$user = $this->companyService->getAllCompanies($request);
			return $user;
		}
	
		/**
		 * @secured
		 */
		function getAllRoleItems($request) {
			$user = $this->companyService->getAllRoleItems($request);
			return $user;
		}
		
		/**
		 * @secured
		 */
		function getCompanyById($request) {
			$user = $this->companyService->getCompanyById($_GET['id']);
			return $user;
		}

		/**
		 * @secured
		 */
		function getCompanyActivationByCompanyId($request) {
			$user = $this->companyService->getCompanyActivationByCompanyId($_GET['id']);
			return $user;
		}

		/**
		 * @secured
		 * @transactional
		 */
		function createActivationDetail($request) {
			$user = $this->companyService->createActivationDetail($request);
			return $user;
		}

		/**
		 * @secured
		 * @transactional
		 */
		function updateActivationDetail($request) {
			$user = $this->companyService->updateActivationDetail($request);
			return $user;
		}

		/**
		 * @secured
		 * @transactional
		 */
		function registerCompany($request) {
			$request = Util::addDefaultObjecKeys($request);
			$request = $this->companyService->createCompany($request);
			return $request;
		}

		/**
		 * @secured
		 * @transactional
		 */
		function updateRole($request) {
			$request = $this->companyService->updateRole($request);
			return $request;
		}
		
		/**
		 * @secured
		 */
		function listCompany($request) {
			$request = $this->companyService->listRegisteredCompany($_GET['q'], $_GET['pgNo'], $_GET['length']);
			return $request;
		}
	}
?>