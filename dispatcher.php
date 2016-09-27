<?php
	
ini_set("display_errors", 1);
ini_set("log_errors", true);
ini_set('error_log', 'error_log.log');
error_reporting(E_ALL);
require_once(dirname(__FILE__).'/classes/init.php');
class Dispatcher {
	
	private static $logger;
	private static $instance;
	
	private function __construct() {
		set_error_handler(array($this, 'errHandle'));
		register_shutdown_function(array($this, 'fatalErrorShutdownHandler'));
	}
	
	public static function getInstance() {
		if (isset(self::$instance) && !empty(self::$instance)) {
			return self::$instance;
		}
		self::$instance = new Dispatcher();
		Logger::configure(dirname(__FILE__)."/classes/resources/logging.xml");
		self::$logger = Logger::getLogger("Dispatcher");
		return self::$instance;
	}
	
	function errHandle($errNo, $errStr, $errFile, $errLine) {
		$msg = "$errStr in $errFile on line $errLine";
		header('HTTP/1.1 500 Internal Server Error');
		self::$logger->error("Script Error", $msg);
		throw new ErrorException($msg, $errNo);
	}
	
	function fatalErrorShutdownHandler() {
		$last_error = error_get_last();
		
		/* [E_ERROR] => 1
		 * [E_WARNING] => 2
		 * [E_PARSE] => 4
		 * [E_NOTICE] => 8
		 * [E_CORE_ERROR] => 16
		 * [E_CORE_WARNING] => 32
		 * [E_COMPILE_ERROR] => 64
		 * [E_COMPILE_WARNING] => 128
		 * [E_USER_ERROR] => 256
		 * [E_USER_WARNING] => 512
		 * [E_USER_NOTICE] => 1024
		 * [E_ALL] => 2047
		 * [TRUE] => 1
		 */
		
		if ($last_error['type'] === E_ERROR || $last_error['type'] === E_WARNING || $last_error["type"] == E_COMPILE_ERROR) {
			header('HTTP/1.1 500 Internal Server Error');
			$this->errHandle(E_ERROR, $last_error['message'], $last_error['file'], $last_error['line']);
		}
	}
	
	private function checkSession() {
		$user = Util::getLoggedInUser();
		if (!isset($user) || empty($user)) {
			throw new ForbiddenException("User is not authenticated.");
		}
		return true;
	}
	
	private function invokeService() {
		
		$url = $_REQUEST['url'];
		try {
			
			$request_body = file_get_contents('php://input');
			$contentType = null;
			if (isset($_SERVER["CONTENT_TYPE"])) $contentType = $_SERVER["CONTENT_TYPE"];
			if (strpos($contentType, "application/x-www-form-urlencoded") === 0 
					|| strpos($contentType, "application/x-www-form-urlencoded") !== false) {
				$request_data = array();
				foreach($_POST as $key => $value) {
					$request_data[$key] = $value;
				}
				$request_body = (object) $request_data;
			} else if (strpos($contentType, "application/json") === 0 
					|| strpos($contentType, "application/json") !== false) {
				$request_data = json_decode($request_body, true);
				$mapper = new JsonMapper();
				$req_array = array();
				$req_array = $mapper->mapObject($request_data);
				$request_body = (object) $req_array;
			}
			
			$arguments = array($request_body);
			$urlParts = explode('/', $url);
			$classname = "";
			$methodName = "";
			if ($urlParts[0] == 'attachment') {
				
				$classname = ucfirst($urlParts[1]).'Ctrl';
				$methodName = $urlParts[2];
				
				$attachment_data = array();
				foreach($_FILES as $key => $value) {
					$attachment_data[$key] = $value;
				}
				
				$mapper = new JsonMapper();
				$attachment_data = $mapper->mapObject($attachment_data);
				$arguments[] = $attachment_data;
				
			} else if ($urlParts[0] == 'secured') {
				
				$this->checkSession();
				$classname = ucfirst($urlParts[1]).'Ctrl';
				$methodName = $urlParts[2];
				
			} else if (count($urlParts) >= 2) {
				$classname = ucfirst($urlParts[0]).'Ctrl';
				$methodName = $urlParts[1];
			}
			
			if (empty($classname) || empty($methodName)) return "Invalid Url";
			
			
			$reflectionClass = new ReflectionClass($classname);
			$reflectionMethod = $reflectionClass->getMethod($methodName);
			$annotations = $this->getMethodAnnotations($reflectionMethod);
			$isTransactional = $this->isTransactional($annotations);
			if ($this->isSecured($annotations) && !$this->checkSession()) {
				throw new ValidationException("Illegal Access to the method / Invalida URL.");
			}
			
			$conn = null;
			try {

				if ($isTransactional) DBConnection::startTransaction();
				$instance = $reflectionClass->newInstance();
				$response = $reflectionMethod->invokeArgs($instance, $arguments);
				if ($isTransactional) DBConnection::commitTransaction();
				return $response;
				
			} catch (Exception $e) {
				if ($isTransactional) DBConnection::rollbackTransaction();
				throw $e;
			}
			
		} catch (ForbiddenException $exception) {
			self::$logger->error("The service requires authentication".$url, $exception);
			header('HTTP/1.1 403 ForbiddenException');
			print_r($exception->getMessage());
		} catch (ErrorException $exception) {
			self::$logger->error("Exception while invoking ".$url, $exception);
			header('HTTP/1.1 500 Internal Server Error');
			print_r($exception->getMessage());
		} catch (Error $exception) {
			self::$logger->error("Exception while invoking ".$url, $exception);
			header('HTTP/1.1 500 Internal Server Error');
			print_r($exception->getMessage());
		} catch (Exception $exception) {
			self::$logger->error("Exception while invoking ".$url, $exception);
			header('HTTP/1.1 500 Internal Server Error');
			print_r($exception->getMessage());
		}
	}
	
	function dispatch() {
		ob_start();
		session_start();
		self::$logger->info("Invoking Service Start::" .$_REQUEST['url']);
		$value = $this->invokeService();
		self::$logger->info("Invoking Service End::" .$_REQUEST['url']);
		if (isset($value)) {
			if (is_object($value) || is_array($value)) {
				header('Content-Type: application/json');
				echo json_encode($value);
			} else {
				header('Content-Type: text/plain');
				echo $value;
			}
		}
		ob_end_flush();
	}
	
	private function getAnnotations($doc) {
		preg_match_all('#@(.*?)\n#s', $doc, $annotations);
		return $annotations[0];
	}
	
	private function getMethodAnnotations($reflectionMethod) {
		$methodDocComment = $reflectionMethod->getDocComment();
		return $this->getAnnotations($methodDocComment);
	}
	
	/* private function isSecured($reflectionMethod) {
		$methodDocComment = $reflectionMethod->getDocComment();
		$annotations = $this->getAnnotations($methodDocComment);
		foreach ($annotations as $value) {
			if (trim($value) == "@secured") {
				return true;
			}
		}
		return false;
	} */

	private function isSecured($annotations) {
		if (empty($annotations) || sizeof($annotations) == 0) return false;
		foreach ($annotations as $value) {
			if (trim($value) == "@secured") {
				return true;
			}
		}
		return false;
	}
	
	private function isTransactional($annotations) {
		if (empty($annotations) || sizeof($annotations) == 0) return false;
		foreach ($annotations as $value) {
			if (trim($value) == "@transactional") {
				return true;
			}
		}
		return false;
	}
}

Dispatcher::getInstance()->dispatch();

?>