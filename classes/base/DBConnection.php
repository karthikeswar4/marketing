<?php

	use \PDO;
	
	class DBConnection {
		
		private static $connection;
		/* private static $dbname = 'isjset_marketing';
		private static $username = 'isjset_marketing';
		private static $password = 'india2012'; */
		private static $dbname = 'marketing';
		private static $username = 'root';
		private static $password = '';
		static function getConnection() { 
		
			if (empty(self::$connection ))  {
				self::$connection = new PDO('mysql:host=localhost;dbname='.self::$dbname, self::$username, self::$password);
				self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			}
            return self::$connection;
		}
		
		static function startTransaction() {
			$conn = self::getConnection();
			$conn->beginTransaction();
		}
		
		static function commitTransaction() {
			$conn = self::getConnection();
			if ($conn->inTransaction()) {
				$conn->commit();
			}
		}

		static function rollbackTransaction() {
			$conn = self::getConnection();
			if ($conn->inTransaction()) {
				$conn->rollBack();
			}
		}
	}
?>