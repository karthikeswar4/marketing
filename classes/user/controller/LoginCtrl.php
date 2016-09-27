<?php
class LoginCtrl {
	
	private $userService;
	function __construct() {
		$this->userService = new UserService();
	}
	
	function authenticate() {
		return $this->userService->authenticate();
	}
	
	function doLogin($request) {
	
		if (empty($request->username)) {
			throw new ValidationException('User Name cannot be empty.');
		}
		if (empty($request->password)) {
			throw new ValidationException('Password cannot be empty.');
		}
		$user = $this->userService->login($request->username, $request->password);
		if (empty($user)) {
			throw new ValidationException('Invalid Username/Password.');
		}
		Util::setLoggedInUser($user);
		return $user;
	}
	
	function getLoggedInUser() {
		return Util::getLoggedInUser();
	}
	
	/**
	 * @secured
	 */
	function logout() {
		if (!isset($_SESSION[Util::$USER_SESSION_KEY])) {
			unset($_SESSION[Util::$USER_SESSION_KEY]);
			throw new ValidationException("User is not Authenticated");
		}
		unset($_SESSION[Util::$USER_SESSION_KEY]);
		return;
	}
}
?>