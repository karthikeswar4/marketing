<?php

	class RoleCtrl {
		private $roleService;
		private $logger;
		function __construct() {
			$this->logger = Logger::getLogger("CompanyCtrl");
			$this->roleService = new RoleService();
		}

		/**
		 * @secured
		 */
		function getAllRoles($request) {
			$user = $this->roleService->getAllRoles($request);
			return $user;
		}
	
		/**
		 * @secured
		 */
		function getAllRoleItems($request) {
			$user = $this->roleService->getAllRoleItems($request);
			return $user;
		}
		
		/**
		 * @secured
		 */
		function getRole($request) {
			$user = $this->roleService->getRole($_GET['id']);
			return $user;
		}

		/**
		 * @secured
		 * @transactional
		 */
		function createRole($request) {
			$request = Util::addDefaultObjecKeys($request);
			$request = $this->roleService->createRole($request);
			return $request;
		}

		/**
		 * @secured
		 * @transactional
		 */
		function updateRole($request) {
			$request = $this->roleService->updateRole($request);
			return $request;
		}

		/**
		 * @secured
		 */
		function getCompanyRoleAssociations($request) {
			$request = $this->roleService->getCompanyRoleAssociations($_GET["id"]);
			return $request;
		}

		/**
		 * @secured
		 * @transactional
		 */
		function createCompanyRoleAssociations($request) {
			$request = Util::addDefaultObjecKeys($request);
			$request = $this->roleService->createCompanyRoleAssociations($request);
			return $request;
		}

		/**
		 * @secured
		 * @transactional
		 */
		function updateCompanyRoleAssociations($request) {
			$request = $this->roleService->updateCompanyRoleAssociations($request);
			return $request;
		}
	}
?>