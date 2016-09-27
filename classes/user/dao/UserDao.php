<?php

	class UserDao extends BaseDao {

		function retrieveUserByUsername($username) {

			$query = "SELECT `id` as id, `company_id` as company_id, `username` as username, `password` as password, `first_name` as firstname,
					`last_name` as lastname, `address1` as street, `address3` as state, `address2` as city, `pincode` as pincode,
					`mobile` as mobile, `email` as email, `image_location` as imageLocation, `role` as role, `CreatedDate` as createdDate, `ModifiedDate` as modifiedDate,
					`CreatedBy` as createdBy, `ModifiedBy` as modifiedBy FROM `users` WHERE  username='".$username."'";
			return $this->getSingleObject($query, 'User');
		}

		function retrieveUserByUsernameOREmail($username) {

			$query = "SELECT `id` as id, `company_id` as company_id, `username` as username, `password` as password, `first_name` as firstname,
					`last_name` as lastname, `address1` as address1, `address3` as address3, `address2` as address2, `city` as city, `state` as state,
					`country` as country, `pincode` as pincode,	`mobile` as mobile, `email` as email, `image_location` as imageLocation, `role` as role,
					`CreatedDate` as createdDate, `ModifiedDate` as modifiedDate,
					`CreatedBy` as createdBy, `ModifiedBy` as modifiedBy FROM `users` WHERE  username='".$username."' OR email='".$username."'";
			return $this->getSingleObject($query, 'User', array($username, $username));
		}

		function retrieveAllUsers($filter, $company_id) {
		
			$query = "SELECT `id` as id, `company_id` as company_id, `username` as username, `password` as password, `first_name` as firstname,
					`last_name` as lastname, `address1` as address1, `address3` as address3, `address2` as address2, `city` as city, `state` as state,
					`country` as country, `pincode` as pincode,	`mobile` as mobile, `email` as email, `image_location` as imageLocation, `role` as role,
					`CreatedDate` as createdDate, `ModifiedDate` as modifiedDate,
					`CreatedBy` as createdBy, `ModifiedBy` as modifiedBy FROM `users` WHERE  company_id = '".$company_id."'";
				
			$temp = "";
			if (!empty($filter)) {
				if (isset($filter->name)) $temp = $temp." and (first_name LIKE '".$filter->name."%' OR last_name LIKE '".$filter->name."%')";
				if (strlen($temp) > 0) {
					$query = $query." AND ".substr($temp, 4);
				}
			}

			$query = $query." ORDER BY first_name";
			return $this->getList($query, 'User');
		}

		function getAllUsersAutoSuggest($filter, $company_id) {
		
			$query = "SELECT `id` as id, `company_id` as company_id, `username` as username, `first_name` as firstname
					FROM `users` WHERE  company_id = '".$company_id."'";
				
			$temp = "";
			if (!empty($filter)) {
				if (isset($filter->name)) $temp = $temp." and (first_name LIKE '".$filter->name."%' OR last_name LIKE '".$filter->name."%')";
				if (strlen($temp) > 0) {
					$query = $query." AND ".substr($temp, 4);
				}
			}

			$query = $query." ORDER BY first_name";
			return $this->getList($query, 'User');
		}

		function retrieveUser($userId) {

			$query = "SELECT `id` as id, `company_id` as company_id, `username` as username, `password` as password, `first_name` as firstname,
					`last_name` as lastname, `address1` as address1, `address3` as address3, `address2` as address2, `city` as city, `state` as state,
					`country` as country, `pincode` as pincode,	`mobile` as mobile, `email` as email, `image_location` as imageLocation, `role` as role,
					`CreatedDate` as createdDate, `ModifiedDate` as modifiedDate,
					`CreatedBy` as createdBy, `ModifiedBy` as modifiedBy FROM `users` WHERE  ID='".$userId."'";
			return $this->getSingleObject($query, 'User');
		}
		
		function retrieveUserByEmail($email) {

			$query = "SELECT `id` as id, `company_id` as company_id, `username` as username, `password` as password, `first_name` as firstname,
					`last_name` as lastname, `address1` as address1, `address3` as address3, `address2` as address2, `city` as city, `state` as state,
					`country` as country, `pincode` as pincode,	`mobile` as mobile, `email` as email, `image_location` as imageLocation, `role` as role,
					`CreatedDate` as createdDate, `ModifiedDate` as modifiedDate, `CreatedBy` as createdBy, `ModifiedBy` as modifiedBy FROM `users`
					WHERE  email='".$email."'";
			return $this->getSingleObject($query, 'User', array($email));
		}

		function createUser($user) {

			$query = "INSERT INTO  `users`(`company_id`, `first_name`, `last_name`, `username`, `password`, `email`, `mobile`,
					`address1`, `address2`, `address3`, `city`, `state`, `country`, `pincode`, `image_location`, `role`,
					`CreatedDate`, `ModifiedDate`, `CreatedBy`, `ModifiedBy`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
			$params = array("company_id", "firstname", "lastname", "username", "password", "email", "mobile", 
					"address1", "address2", "address3", "city", "state", "country", "pincode", "imageLocation", "role", 
					"createdDate", "modifiedDate", "createdBy", "modifiedBy");
			return $user =  $this->create($query, $user, $params);
		}

		function updateUser($user) {

			$query = "UPDATE `users`SET `first_name` = ?, `last_name` = ?, `username` = ?, `password` = ?, `email` = ?, `mobile` = ?,
					`address1` = ?, `address2` = ?, `address3` = ?, `city` = ?, `state` = ?, `country` = ?, `pincode` = ?, `image_location` = ?, `role` = ?,
					`ModifiedDate` = ?, `ModifiedBy` = ? WHERE id = ?";
			$params = array("firstname", "lastname", "username", "password", "email", "mobile", "address1", "address2", "address3", "city", "state", "country", "pincode", 
					"imageLocation", "role", "modifiedDate", "modifiedBy", "id");
			return $user =  $this->create($query, $user, $params);
		}
	}
?>