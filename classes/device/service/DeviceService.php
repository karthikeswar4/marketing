<?php

	class DeviceService {

		private $deviceDao;
		private $userDao;
		private $roleDao;
		private $logger;
		public function __construct()  {
			$this->deviceDao = new DeviceDao();
			$this->userDao = new UserDao();
			$this->roleDao = new RoleDao();
			$this->logger = Logger::getLogger("DeviceService");
		}

		function createDevice($device) {
			
			if (empty($device)) throw new ValidationException("Device cannot be empty");
			if (empty($device->company_id)) throw new ValidationException("Company Id is mandatory");
			if (empty($device->user_name)) throw new ValidationException("User Nameis Mandatory");
			//if (empty($device->phone_no)) throw new ValidationException("Phone Number is Mandatory");
			if (empty($device->device_imei)) throw new ValidationException("Device Imei is Mandatory");
			
			$existingDevice = $this->deviceDao->retrieveDeviceByUserName($device->user_name);
			if (null != $existingDevice) throw new ValidationException("User has been already registered.");
			
			$existingDevice = $this->deviceDao->retrieveDeviceByImei($device->device_imei);
			if (null != $existingDevice) throw new ValidationException("Device has been already registered.");
			
			$user = $this->userDao->retrieveUserByUsernameOREmail($device->user_name);
			if (null == $user || empty($user)) throw new ValidationException("User Does not exists.");
			if ($device->password != $user->password) throw new ValidationException("User Password does not match.");

			$params = array();
			$params[] = "activation_key";
			$device = Util::addDefaultObjecKeys($device, $params);
			$device->activation_key = Util::generateRandomString();
			
			return $this->deviceDao->createDevice($device);
		}

		function activateDevice($device) {
			
			if (empty($device)) throw new ValidationException("Device cannot be empty");
			if (empty($device->activation_key)) throw new ValidationException("Device cannot be empty");
			$existingDevice = $this->deviceDao->retrieveDevice($device->id);
			if ($device->activation_key != $existingDevice->activation_key) {
				throw new ValidationException("Invalid activation Key");
			}
			
			$user = $this->userDao->retrieveUserByUsernameOREmail($device->user_name);
			if (null == $user || empty($user)) throw new ValidationException("User Does not exists.");
			if ($device->password != $user->password) throw new ValidationException("User Password does not match.");
				
			$device = Util::addDefaultObjecKeys($device, array("user_id", "device_id"));
			$device->company_id = $existingDevice->company_id;
			$device->user_id = $user->id;
			$device->device_id = $device->id;
			return $this->deviceDao->activateDevice($device);
			
		}
	}
?>