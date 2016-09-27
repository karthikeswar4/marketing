<?php
	abstract class BaseDao {

		private function mapObjectProperties($object, $data, $colMetaInfo = null) {
			foreach ($data as $key => $value) {
				if (!property_exists($object, $key)) continue;
				if (isset($colMetaInfo) && isset($colMetaInfo[$key])
						&& ((!isset($colMetaInfo[$key]["native_type"]) && $colMetaInfo[$key]["len"] == 1)
							|| (isset($colMetaInfo[$key]["native_type"]) && 
								(($colMetaInfo[$key]["native_type"] == "TINY" && $colMetaInfo[$key]["len"] == 1)
								|| ($colMetaInfo[$key]["native_type"] == "BIT" && $colMetaInfo[$key]["len"] == 1))))) {
					$object->$key = ($value == "1" || $value == 1);
					continue;
				}
				$object->$key = $value;
			}
			return $object;
		}

		protected function mapObject($objectType, $result) {

			$colMetaInfo = $this->getColumnMetaInfo($result);
			$reflectionClass = new ReflectionClass($objectType);
			if (($data = $result->fetch()) !== false) {
				$instance = $reflectionClass->newInstance();
				return $this->mapObjectProperties($instance, $data, $colMetaInfo);
			}
			return null;
		}

		protected function mapObjectList($objectType, $result) {

			$colMetaInfo = $this->getColumnMetaInfo($result);
			$reflectionClass = new ReflectionClass($objectType);
			$objectLists = array();
			while (($data = $result->fetch()) !== false) {
				$instance = $reflectionClass->newInstance();
				array_push($objectLists, $this->mapObjectProperties($instance, $data, $colMetaInfo));
			}
			return $objectLists;
		}

		private function getColumnMetaInfo($result) {
			$colCount = $result->columnCount();
			$colMetaInfo = array();
			for ($index = 0; $index < $colCount; $index++) {
				$metaInfo = $result->getColumnMeta($index);
				$colMetaInfo[$metaInfo["name"]] = $metaInfo;
			}
			return $colMetaInfo;
		}
		
		private function getPreparedStmtForQuery($conn, $query, $params) {
			$stmt = $conn->prepare($query);
			if (isset($params) && !empty($params)) {
				foreach ($params as $key => $val) {
					$stmt->bindValue($key + 1, $val);
				}
			}
			return $stmt;
		}

		protected function getSingleObject($query, $objectType, $params = null) {
			$conn = DBConnection::getConnection();
// 			$stmt = $this->getPreparedStmtForQuery($conn, $query, $params);
// 			$result = $stmt->fetch();
			$result = $conn->query($query);
			return $this->mapObject($objectType, $result);
		}

		protected function getList($query, $objectType, $params = null) {
			$conn = DBConnection::getConnection();
// 			$stmt = $this->getPreparedStmtForQuery($conn, $query, $params);
// 			$result = $stmt->fetchAll();
			$result = $conn->query($query);
			return $this->mapObjectList($objectType, $result);
		}

		private function setDefaultValues($object, $create) {
			if (!isset($object) || empty($object)) return;
			$date = date("Y-m-d H:i:s");
			//$date = (new DateTime())->format('Y-m-d H:i:s');
			$user = Util::getLoggedInUser();
			$userId = -1;
			if (isset($user) && isset($user->id)) $userId = $user->id;

			if (property_exists($object, 'modifiedDate')) $object->modifiedDate = $date;
			if (property_exists($object, 'modifiedBy')) $object->modifiedBy = $userId;
			if (!$create) return;
			if (property_exists($object, 'createdDate')) $object->createdDate = $date;
			if (property_exists($object, 'createdBy')) $object->createdBy = $userId;
		}

		private function bindParams($stmt, $object, $params) {
			if (!isset($params) || empty($params) || !isset($object)) return;
			foreach ($params as $key => $val) {
				$value = null;
				if (property_exists($object, $val)) $value = $object->$val;
				if (is_bool($value)) $value = $value ? 1 : 0;
				$stmt->bindValue($key + 1, $value);
			}
		}

		private function save($query, $object, $params = null, $create = false) {
			$conn = DBConnection::getConnection();
			$created = false;
			if (!$conn->inTransaction()) {
				/* $conn->beginTransaction();
				$created = true; */
				throw new ValidationException("Trying to execute Transaction context in non transactional way");
			}
			$stmt = $conn->prepare($query);
			$this->setDefaultValues($object, $create);
			$this->bindParams($stmt, $object, $params);
			$stmt->execute();
			if ($create && property_exists($object, 'id')) $object->id = $conn->lastInsertId();
			/* if ($created) $conn->commit(); */
			return $object;
		}

		protected function update($query, $object, $params = null) {
			return $this->save($query, $object, $params, false);
		}

		protected function create($query, $object, $params = null) {
			return $this->save($query, $object, $params, true);
		}
		
		protected function execute($query, $object = null, $params = null, $create = false) {
			$conn = DBConnection::getConnection();
			$created = false;
			if (!$conn->inTransaction()) {
				/* $conn->beginTransaction();
				$created = true; */
				throw new ValidationException("Trying to execute Transaction context in non transactional way");
			}
			$stmt = $conn->prepare($query);
			$this->setDefaultValues($object, $create);
			$this->bindParams($stmt, $object, $params);
			$stmt->execute();
			/* if ($created) $conn->commit(); */
			return $object;
		}
		
		protected function executeBatch($query, $object = null, $params = null, $create = false) {
			$conn = DBConnection::getConnection();
			$created = false;
			if (!$conn->inTransaction()) {
				/* $conn->beginTransaction();
				$created = true; */
				throw new ValidationException("Trying to execute Transaction context in non transactional way");
			}
			$stmt = $conn->prepare($query);
			foreach ($object as $key => $val) {
				$this->setDefaultValues($val, $create);
				$this->bindParams($stmt, $val, $params);
				$stmt->execute();
			}
			/* if ($created) $conn->commit(); */
			return $object;
		}
	}
?>