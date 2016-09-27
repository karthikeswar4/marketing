<?php
	class DeviceDao extends BaseDao {
		
		private $logger;
		public function __construct()  {
			$this->logger = Logger::getLogger("DeviceDao");
		}
		
		function createDevice($deviceLocation) {
		
			$query = "INSERT INTO `company_devices` (`company_id`, `device_imei`, `phone_no`, `sim_no`, `activation_key`,
					`CreatedDate`, `ModifiedDate`, `CreatedBy`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
			$params = array("company_id", "device_imei", "phone_no", "sim_no", "activation_key",
					"createdDate", "modifiedDate", "createdBy", "modifiedBy");
			return $this->create($query, $deviceLocation, $params);
		}
		
		function retrieveDevice($deviceId) {
		
			$query = "SELECT `id` as id, `company_id` as company_id, `phone_no` as phone_no, `device_imei` as device_imei,
					`sim_no` as sim_no, `activation_key` as activation_key FROM `company_devices` WHERE id = ".$deviceId;
			return $this->getSingleObject($query, 'Device');
		}

		function retrieveDeviceByUserId($userId) {
		
			$query = "SELECT dev.`id` as id, usrdev.`user_id` as user_id, dev.`company_id` as company_id, dev.`phone_no` as phone_no,
					dev.`sim_no` as sim_no, `activation_key` as activation_key, dev.`device_imei` as device_imei FROM `company_devices` dev 
					INNER JOIN `user_device` usrdev ON dev.id = usrdev.device_id WHERE usrdev.user_id = ".$userId;
			return $this->getSingleObject($query, 'Device');
		}

		function retrieveDeviceByUserName($username) {
		
			$query = "SELECT dev.`id` as id, usrdev.`user_id` as user_id, dev.`company_id` as company_id, dev.`phone_no` as phone_no,
					dev.`sim_no` as sim_no, `activation_key` as activation_key, dev.`device_imei` as device_imei FROM `company_devices` dev 
					INNER JOIN `user_device` usrdev ON dev.id = usrdev.device_id
					INNER JOIN `users` usr ON usr.id = usrdev.user_id
					WHERE usr.username = '".$username. "' OR usr.email = '".$username."';";
			return $this->getSingleObject($query, 'Device');
		}
		
		function retrieveDeviceByImei($imei) {
		
			$query = "SELECT dev.`id` as id, dev.`company_id` as company_id, dev.`phone_no` as phone_no, dev.`device_imei` as device_imei,
					dev.`sim_no` as sim_no, `activation_key` as activation_key FROM `company_devices` dev 
					WHERE dev.device_imei = ".$imei;
			return $this->getSingleObject($query, 'Device');
		}
		
		function activateDevice($device) {
		
			$query = "INSERT INTO `user_device` (`user_id`, `device_id`, `CreatedDate`, `ModifiedDate`, `CreatedBy`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?)";
			$params = array("user_id", "device_id", "createdDate", "modifiedDate", "createdBy", "modifiedBy");
			return $this->create($query, $device, $params);
		}
	}
?>