<?php
	class Util {

		static $USER_SESSION_KEY = "marketing";
		static $RANDOM_GENERATOR_KEY = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		static $RANDOM_OTP_GENERATOR = '0123456789';
		private static function getLogger() {
			return Logger::getLogger("Util");
		}
		static function getBaseUrl($atRoot=FALSE, $atCore=FALSE, $parse=FALSE) {

			if (isset($_SERVER['HTTP_HOST'])) {
				$http = isset($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off' ? 'https' : 'http';
				$hostname = $_SERVER['HTTP_HOST'];
				$dir =  str_replace(basename($_SERVER['SCRIPT_NAME']), '', $_SERVER['SCRIPT_NAME']);

				$core = preg_split('@/@', str_replace($_SERVER['DOCUMENT_ROOT'], '', realpath(dirname(__FILE__))), NULL, PREG_SPLIT_NO_EMPTY);
				$core = $core[0];

				$tmplt = $atRoot ? ($atCore ? "%s://%s/%s/" : "%s://%s/") : ($atCore ? "%s://%s/%s/" : "%s://%s%s");
				$end = $atRoot ? ($atCore ? $core : $hostname) : ($atCore ? $core : $dir);
				$base_url = sprintf( $tmplt, $http, $hostname, $end );
			}
			else $base_url = 'http://localhost/';

			if ($parse) {
				$base_url = parse_url($base_url);
				if (isset($base_url['path'])) if ($base_url['path'] == '/') $base_url['path'] = '';
			}

			return $base_url;
		}

		static function getLoggedInUser() {
			if (!isset($_SESSION[self::$USER_SESSION_KEY]) || empty($_SESSION[self::$USER_SESSION_KEY])) return null;
			if (is_object($_SESSION[self::$USER_SESSION_KEY])) {
				return $_SESSION[self::$USER_SESSION_KEY];
			}

			$mapper = new JsonMapper();
			$user = $mapper->map(json_decode($_SESSION[self::$USER_SESSION_KEY]), new User());
			return $user;
		}

		static function setLoggedInUser($user) {
			if (!isset($user) || empty($user)) throw new ValidationException("Invalid user");
			$_SESSION[Util::$USER_SESSION_KEY] = json_encode($user);
		}
		
		static function addDefaultObjecKeys($object, $params = array()) {
			$object2 = array();
			$object2["id"] = null;
			$object2["createdBy"] = 0;
			$object2["createdDate"] = null;
			$object2["modifiedBy"] = 0;
			$object2["modifiedDate"] = null;
			foreach ($params as $val) {
				$object2[$val] = null;
			}
			if (empty($object) || is_null($object)) return (object) $object2;
			return (object) array_merge($object2, (array) $object);
		}
		
		static function generateRandomString($length = 10) {
			return substr(str_shuffle(str_repeat(self::$RANDOM_GENERATOR_KEY, ceil($length/strlen(self::$RANDOM_GENERATOR_KEY)) )), 1, $length);
		}
		
		static function generateRandomOTP($length = 5) {
			return substr(str_shuffle(str_repeat(self::$RANDOM_OTP_GENERATOR, ceil($length/strlen(self::$RANDOM_OTP_GENERATOR)) )), 1, $length);
		}
		
		private static function constructImageContent ($tag, $uid) {
			
			if (empty($tag)) return "";
			$eol = PHP_EOL;
			$contentId = self::generateRandomString(10);
			$source = $tag->getAttribute('src');
			
			$source = ltrim($source, "\\\"");
			$source = rtrim($source, "\\\"");
			$imdata = "";
			if (strpos($source, 'http') === 0) {
				$im = file_get_contents($source);
				$imdata = base64_encode($im);
			} else if (strpos($source, "data:") === 0) {
				$position = strpos($source, ",");
				$imdata = substr($source, $position + 1);;
			}
			
			$msg = "Content-Location: CID: contentLocation".$eol;
			$msg .= "Content-ID: <".$contentId.">".$eol;
			$msg .= "Content-Type: IMAGE/JPEG".$eol;
			$msg .= "Content-Transfer-Encoding: BASE64".$eol.$eol;
			$msg .= $imdata.$eol.$eol;
			$msg .= "--".$uid.$eol;
			
			$tag->setAttribute('src', "cid:$contentId");
			return $msg;
		}
		
		static function sendMail($to, $from, $subject, $messages, $attachment = null, $filename = null, $cc = null, $bcc = null) {
		
			if (empty($to)) throw new ValidationException("Invalid to Email address");
			$eol = PHP_EOL;
		
			$content = chunk_split(base64_encode($attachment));
			$uid = md5(uniqid(time()));
			$header = "From: <".$from.">".$eol;
			$header .= "MIME-Version: 1.0".$eol;
			$header .= "Content-Type: multipart/mixed; boundary=\"".$uid."\"";
		
			$message = "--".$uid.$eol;
			
			libxml_use_internal_errors(true);
			$doc = new DOMDocument();
			$messages = "<wrapper>$messages</wrapper>";
			if (!$doc->loadHTML($messages)) {
				$errors ="";
				foreach (libxml_get_errors() as $error) {
					$errors .= $error;
				}
				throw new ValidationException($errors);
			}
			$tags = $doc->getElementsByTagName('img');
			foreach ($tags as $tag) {
				$message .= self::constructImageContent($tag, $uid);
			}
			$messages = substr($doc->saveXML($doc->getElementsByTagName('wrapper')->item(0)), 9, -10);
			$messages = str_replace(array("\"\\&quot;","\\&quot;\""), "\"",$messages);
			
			$message .= "Content-type:text/html; charset=iso-8859-1".$eol;
			$message .= "Content-Transfer-Encoding: 7bit".$eol.$eol;
			$message .= $messages.$eol.$eol;
			if (isset($attachment) && !empty($attachment)) {
				$message .= "--".$uid.$eol;
				$message .= "Content-Type: application/octet-stream; name=\"".$filename."\"".$eol; // use different content types here
				$message .= "Content-Transfer-Encoding: base64".$eol;
				$message .= "Content-Disposition: attachment; filename=\"".$filename."\"".$eol.$eol;
				$message .= $content.$eol.$eol;
			}
			$message .= "--".$uid."--".$eol;
			
			$tousers = explode(',', $to);
			foreach ($tousers as $val) {
				if (!preg_match('/^([a-z0-9]+([_\.\-]{1}[a-z0-9]+)*){1}([@]){1}([a-z0-9]+([_\-]{1}[a-z0-9]+)*)+(([\.]{1}[a-z]{2,6}){0,3}){1}$/i', $val)) {
					throw new ValidationException("Invalid To Email Address $val");
				}
			}
		
			if (mail ( $to, $subject, $message, $header )) {
				return true;
			} else {
				$error = "Failed to send Message to $to, headers $header, subject $subject, message $message ->$eol due to following error:";
				$error .= print_r(error_get_last(), true);
				throw new ValidationException($error);
			}
		}
		
		/**
		 * recursively create a long directory path
		 */
		static function createPath($path, $base = false) {
			
			$logger = self::getLogger();
			if (is_dir($path)) return true;
			$path = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $path);
			$path = rtrim($path, DIRECTORY_SEPARATOR);
			$paths = explode(DIRECTORY_SEPARATOR, $path);
			$lastIndex = sizeof($paths) - 1;
			$cPath = "";
			if (!$base) $cPath = BASE_DIR;
			$index = -1;
			foreach ($paths as $key => $value) {
				$index++;
				$logger->debug('->'.$value);
				if ($index == 0 && strpos($value, ":") !== false) continue;
				
				if ($index == $lastIndex && strpos($value, ".") !== false) {
					return;
				}
				if ($value == "..") {
					$dIndex = strripos($cPath, DIRECTORY_SEPARATOR);
					$cPath = substr($cPath, 0, $dIndex);
					$logger->debug($cPath);
					continue;
				} else {
					$cPath = $cPath.DIRECTORY_SEPARATOR.$value;
				}
				
				if (!is_file($cPath) && !file_exists($cPath)) {
					$logger->debug('MakeDir:'.$cPath);
					mkdir($cPath);
				}
			}
		}
		
		/**
		 * @param tmpLocation
		 * @param fullLocation
		 */
		static function moveFile($tmpLocation, $fullLocation) {
			
			$logger = self::getLogger();
			$logger->debug('Moving file from :'.$tmpLocation.' to '.$fullLocation);
			self::createPath($fullLocation, true);
			$dIndex = strripos($fullLocation, DIRECTORY_SEPARATOR);
			$basePath = substr($fullLocation, 0, $dIndex);
			$baseFileName = substr($fullLocation, $dIndex);
		
			$fSuffixPos = strripos($baseFileName, ".");
			$baseNamePrefix = substr($baseFileName, 0, $fSuffixPos);
			$baseNameSuffix = substr($baseFileName, $fSuffixPos);
		
			$prefix = 1;
			while (file_exists($fullLocation)) {
				$fullLocation = $basePath.$baseNamePrefix."_".$prefix.$baseNameSuffix;
				$prefix++;
				$logger->debug('Checking file:'.$fullLocation);
			}
			move_uploaded_file($tmpLocation, $fullLocation);
			$logger->debug('Successfully Moving file from :'.$tmpLocation.' to '.$fullLocation);
			return $fullLocation;
		}
	}
?>