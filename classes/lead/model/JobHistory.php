<?php 
	class JobHistory { 

		function __construct() { 
			$this->id = null; 
			$this->jobID = null; 
			$this->updateDetail = null; // what the update done for a job
			$this->updateTime = null; 
			$this->update = null; 
			 
		} 
		
		function setId($id) { 
			$this->id = $id; 
		} 
		function setJobID($jobID) { 
			$this->jobID = $jobID; 
		} 
		function setUpdateDetail($updateDetail) { 
			$this->updateDetail = $updateDetail; 
		} 
		function setUpdateTime($updateTime) { 
			$this->updateTime = $updateTime; 
		} 
		function setUpdate($update) { 
			$this->update = $update; 
		} 
		
		function getId() { 
			return $this->id; 
		} 
		function getJobID() { 
			return $this->jobID; 
		}
		function getUpdateDetail() { 
			return $this->updateDetail; 
		}
		function getUpdateTime() { 
			return $this->updateTime; 
		}		
		function getUpdate() { 
			return $this->update; 
		}		
		
	}
?>