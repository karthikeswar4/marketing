<?php

	class UserService {

		private $userDao;
		private $roleDao;
		public function __construct()  {
			$this->userDao = new UserDao();
			$this->roleDao = new RoleDao();
		}

		function login($username, $password) {
			$user = $this->userDao->retrieveUserByUsernameOREmail($username);
			if (empty($user)) {
				return null;
			}

			if ($user->password == $password) {
				$roles = $this->roleDao->retrieveRoleByIdAndCompanyId($user->role, $user->company_id);
				$user->accessible_rights = json_decode($roles->role_items_list);
				return $user;
			}
			return null;
		}
		
		function authenticate() {
			if (!isset($_SESSION[Util::$USER_SESSION_KEY])) {
				throw new ValidationException("User is not Authenticated");
			}
			$user = Util::getLoggedInUser();
			$roles = $this->roleDao->retrieveRoleByIdAndCompanyId($user->role, $user->company_id);
			$user->accessible_rights = json_decode($roles->role_items_list);
			return $user;
		}
		
		private function getCompanyId($filter = null) {
			$companyId = null;
			$user = Util::getLoggedInUser();
			if (empty($user->company_id)) {
				throw new ValidationException("Invalid Company Id");
			} else if ($user->company_id == -1) {
				$companyId = ($filter != null && isset($filter->company_id)) ? $filter->company_id : -1;
			} else {
				$companyId = $user->company_id;
			}
			return $companyId;
		}

		function getAllUsers($filter) {
			return $this->userDao->retrieveAllUsers($filter, $this->getCompanyId($filter));
		}

		function getAllUsersAutoSuggest($filter) {
			return $this->userDao->getAllUsersAutoSuggest($filter, $this->getCompanyId($filter));
		}

		function getUser($userId) {
			if (empty($userId)) throw new ValidationException("UserId cannot be empty");
			return $this->userDao->retrieveUser($userId);
		}

		function createUser($user) {
			if (empty($user)) throw new ValidationException("User cannot be empty");
			if (empty($user->email)) throw new ValidationException("Email is mandatory");
			if (empty($user->username)) throw new ValidationException("User Name is mandatory");
			if (empty($user->password)) throw new ValidationException("Password is mandatory");
			if (empty($user->firstname)) throw new ValidationException("FirstName is mandatory");
			$olduser = $this->userDao->retrieveUserByUserName($user->username);
			if (!empty($olduser)) throw new ValidationException("Username already exists.");
			$user->company_id = $this->getCompanyId($user);
			return $this->userDao->createUser($user);
		}

		function updateUser($user) {
			if (empty($user)) throw new ValidationException("User cannot be empty");
			if (empty($user->email)) throw new ValidationException("Email is mandatory");
			if (empty($user->username)) throw new ValidationException("User Name is mandatory");
			if (empty($user->password)) throw new ValidationException("Password is mandatory");
			if (empty($user->firstname)) throw new ValidationException("FirstName is mandatory");
			$user->company_id = $this->getCompanyId($user);
			return $this->userDao->updateUser($user);
		}
	}
?>