<?php
/**
 * Simple exception
 *
 * @category Netresearch
 * @package  JsonMapper
 * @author   Christian Weiske <christian.weiske@netresearch.de>
 * @license  OSL-3.0 http://opensource.org/licenses/osl-3.0
 * @link     http://www.netresearch.de/
 */
class ForbiddenException extends Exception
{
	// Redefine the exception so message isn't optional
	public function __construct($message, Exception $previous = null) {
		parent::__construct ($message, 403, $previous);
	}
	
	// custom string representation of object
	public function __toString() {
		return __CLASS__ . ": [{$this->code}]: {$this->message}\n";
	}
}
?>
