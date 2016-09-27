<?php

	class DeviceLocationCtrl {
		private $deviceLocationService;
		private $logger;
		function __construct() {
			$this->logger = Logger::getLogger("DeviceLocationCtrl");
			$this->deviceLocationService = new DeviceLocationService();
		}

		function syncDeviceLocation($request) {
			return $this->deviceLocationService->syncDeviceLocation($request);
		}

		function syncPhoneCall($request) {
			return $this->deviceLocationService->syncPhoneCall($request);
		}
		
		/**
		 * @secured
		 */
		function retrieveLastDeviceLocationByUserId($request) {
			return $this->deviceLocationService->retrieveLastDeviceLocationByUserId($_GET["user_id"]);
		}

		/**
		 * @secured
		 */
		function getDeviceLocationsByUserId($request) {
			$offset = 0;
			$limit = 0;
			if (isset($_GET["length"])) $limit = intval($_GET["length"]);
			if (isset($_GET["page"])) $offset = intval($_GET["page"]) * $limit;
			return $this->deviceLocationService->getDeviceLocationsByUserId($_GET["user_id"], $offset, $limit);
		}

		/**
		 * @secured
		 */
		function getAllUserCallLogs($request) {
			$offset = 0;
			$limit = 0;
			if (isset($_GET["length"])) $limit = intval($_GET["length"]);
			if (isset($_GET["page"])) $offset = intval($_GET["page"]) * $limit;
			return $this->deviceLocationService->getAllUserCallLogs($_GET["user_id"], $offset, $limit);
		}
	}
?>