<?php
	class DeviceLocationDao extends BaseDao {
		
		private $logger;
		public function __construct()  {
			$this->logger = Logger::getLogger("DeviceLocationDao");
		}

		function retrieveAllCompanies($filter) {

			$query = "SELECT `id` as id, `name` as name, `email` as email, `address_line1` as address_line1, `address_line2` as address_line2,
					`address_line3` as address_line3, `city` as city, `state` as state, `country` as country, `postalcode` as postal, 
					`phone1` as phone1, `phone2` as phone2, `mobile` as mobile, `fax` as fax 
					FROM `company` WHERE  id > 0 ";
			$temp = "";
			if (!empty($filter)) {
				if (isset($filter->name)) $temp = $temp." and name LIKE '".$filter->name."%'";
				if (strlen($temp) > 0) {
					$query = $query." AND ".substr($temp, 4);
				}
			}
			return $this->getList($query, 'Company');
		}
		
		function createDeviceLocation($deviceLocation) {
		
			$query = "INSERT INTO `device_location` (`device_id`, `location`, `latitude`, `longitude`,
					`CreatedDate`, `ModifiedDate`, `CreatedBy`, `ModifiedBy`)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
			$params = array("device_id", "location", "latitude", "longitude",
					"createdDate", "modifiedDate", "createdBy", "modifiedBy");
			return $this->create($query, $deviceLocation, $params);
		}
		
		function retrieveLastDeviceLocation($deviceId) {
		
			$query = "SELECT `id` as id, `device_id` as device_id, round(`location`, 5) as location, round(`latitude`, 5) as latitude,
					`longitude` as longitude FROM `device_location` WHERE device_id = ".$deviceId."
					ORDER BY CreatedDate Desc LIMIT 1";
			return $this->getSingleObject($query, 'DeviceLocation');
		}

		function retrieveLastDeviceLocationByUserId($userId) {
		
			$query = "SELECT loc.`id` as id, loc.`device_id` as device_id, round(loc.`location`, 5) as location, round(loc.`latitude`, 5) as latitude,
					loc.`longitude` as longitude FROM `device_location` loc 
					INNER JOIN `user_device` dev ON dev.device_id = loc.device_id WHERE dev.user_id = ".$userId."
					ORDER BY loc.CreatedDate Desc LIMIT 1";
			return $this->getSingleObject($query, 'DeviceLocation');
		}

		function retrieveDeviceLocationsByUserId($userId, $offset = 0, $limit = 0) {
		
			$query = "SELECT loc.`id` as id, loc.`device_id` as device_id, round(loc.`location`, 5) as location, round(loc.`latitude`, 5) as latitude,
					loc.`longitude` as longitude FROM `device_location` loc INNER JOIN `user_device` dev ON dev.device_id = loc.device_id WHERE dev.user_id = ".$userId."
					ORDER BY loc.CreatedDate ASC";
			if (!empty($limit) && $limit > 0) {
				$query .= " LIMIT ".$limit;
				if (!empty($limit) && $limit > 0) {
					$query .= ", ".$offset;
				}
			}
			return $this->getList($query, 'DeviceLocation');
		}

		function getAllUserCallLogs($userId, $offset = 0, $limit = 0) {
		
			$query = "SELECT logs.`id` as id, logs.`device_id` as device_id, logs.`state` as state, logs.`number` as number, logs.`duration` as duration,
					user.`first_name` as firstname, user.`last_name` as lastname FROM `device_call_logs` logs 
					INNER JOIN `user_device` dev ON dev.device_id = logs.device_id
					INNER JOIN `users` user ON user.id = dev.user_id
					WHERE dev.user_id = ".$userId."
					ORDER BY logs.CreatedDate ASC";
			if (!empty($limit) && $limit > 0) {
				$query .= " LIMIT ".$limit;
				if (!empty($limit) && $limit > 0) {
					$query .= ", ".$offset;
				}
			}
			return $this->getList($query, 'DeviceCallLog');
		}
	}
?>