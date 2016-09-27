<?php

	class UserCtrl {
		private $userService;
		function __construct() {
			$this->userService = new UserService();
		}

		/**
		 * @secured
		 */
		function getAllUsers($request) {
			$user = $this->userService->getAllUsers($request);
			return $user;
		}
		
		function getAllUsersAutoSuggest($request) {
			$user = $this->userService->getAllUsersAutoSuggest($request);
			return $user;
		}

		/**
		 * @secured
		 */
		function getUser($request) {
			$user = $this->userService->getUser($_GET['userId']);
			return $user;
		}

		/**
		 * @secured
		 * @transactional
		 */
		function createUser($request) {
			$user = $this->userService->createUser($request);
			return $user;
		}

		/**
		 * @secured
		 * @transactional
		 */
		function updateUser($request) {
			$user = $this->userService->updateUser($request);
			return $user;
		}
	}
?>