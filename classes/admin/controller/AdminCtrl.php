<?php

	class AdminCtrl {
		private $logger;
		function __construct() {
			$this->logger = Logger::getLogger("AdminCtrl");
		}

		/**
		 * @secured
		 */
		function clearCache($request) {
			unlink(BASE_DIR.DIRECTORY_SEPARATOR.CACHE_FILE);
		}
	}
?>