<?php

	class DeviceCtrl {
		private $deviceService;
		private $logger;
		function __construct() {
			$this->logger = Logger::getLogger("DeviceCtrl");
			$this->deviceService = new DeviceService();
		}

		function registerDevice($request) {
			return $this->deviceService->createDevice($request);
		}

		function activateDevice($request) {
			return $this->deviceService->activateDevice($request);
		}
	}
?>