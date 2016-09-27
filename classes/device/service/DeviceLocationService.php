<?php

	class DeviceLocationService {

		private $deviceLocationDao;
		private $userDao;
		private $roleDao;
		private $logger;
		public function __construct()  {
			$this->deviceLocationDao = new DeviceLocationDao();
			$this->userDao = new UserDao();
			$this->roleDao = new RoleDao();
			$this->logger = Logger::getLogger("DeviceLocationService");
		}

		function syncDeviceLocation($latLng) {
			$deviceId = 1;
			if (isset($latLng->device_id)) {
				$deviceId = $latLng->device_id;
			}
			$lastLocation = $this->deviceLocationDao->retrieveLastDeviceLocation($deviceId);
			if (isset($lastLocation) && !empty($lastLocation)
					&& round($lastLocation->latitude, 5) == round($latLng->latitude, 5) 
					&& round($lastLocation->longitude, 5) == round($latLng->longitude, 5)) {
				return $lastLocation;
			}
			
			$deviceLocation = new DeviceLocation();
			$deviceLocation->latitude = round($latLng->latitude, 5);
			$deviceLocation->longitude = round($latLng->longitude, 5);
			$deviceLocation->device_id = $deviceId;
			$deviceLocation->company_id = 1;
			return $this->deviceLocationDao->createDeviceLocation($deviceLocation);
		}

		function syncPhoneCall($phoneCall) {
			
			$deviceId = 1;
			$deviceLocation->device_id = $deviceId;
			$deviceLocation->company_id = 1;
			return $this->deviceLocationDao->syncPhoneCall($phoneCall);
		}

		function retrieveLastDeviceLocationByUserId($userId) {
			if (empty($userId)) throw new ValidationException("UserId cannot be empty");
			return $this->deviceLocationDao->retrieveLastDeviceLocationByUserId($userId);
		}

		function getDeviceLocationsByUserId($userId, $offset = 0, $limit = 0) {
			if (empty($userId)) throw new ValidationException("UserId cannot be empty");
			return $this->deviceLocationDao->retrieveDeviceLocationsByUserId($userId, $offset, $limit);
		}

		function getAllUserCallLogs($userId, $offset = 0, $limit = 0) {
			if (empty($userId)) throw new ValidationException("UserId cannot be empty");
			return $this->deviceLocationDao->getAllUserCallLogs($userId, $offset, $limit);
		}
		
		function createCompany($company) {
			
			if (empty($company)) throw new ValidationException("Company cannot be empty");
			if (empty($company->name)) throw new ValidationException("Company Name is mandatory");
			if (empty($company->email)) throw new ValidationException("Company Email is Mandatory");
			if (empty($company->address_line1)) throw new ValidationException("Address Line1 is Mandatorys");
			if (empty($company->city)) throw new ValidationException("City is Mandatory");
			if (empty($company->state)) throw new ValidationException("State is Mandatory");
			if (empty($company->country)) throw new ValidationException("Country is Mandatory");
			if (empty($company->phone1)) throw new ValidationException("Phone Number is Mandatory");
			$existingCompany = $this->deviceLocationDao->retrieveCompanyByEmail($company->email);
			if (null != $existingCompany) throw new ValidationException("A Company has been already registered with this email.");
			return $this->deviceLocationDao->createCompany($company);
		}
		
		function updateRole($role) {
			if (empty($role)) throw new ValidationException("Role cannot be empty");
			if (empty($role->id)) throw new ValidationException("Role Id is mandatory");
			if (empty($role->name)) throw new ValidationException("Role Name is mandatory");
			if (empty($role->role_items_list)) throw new ValidationException("Atleast one Role Items should be selected");
			return $this->deviceLocationDao->updateRole($role);
		}
	}
?>