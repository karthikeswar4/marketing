<?php
class CampaignCtrl {
	
	private $campaignService;
	function __construct() {
		$this->campaignService = new CampaignService();
	}
	
	/**
	 * @secured
	 * @transactional
	 */
	function createCampaign($request) {
		$job = $this->campaignService->createCampaign($request);
		return $job;
	}

	/**
	 * @secured
	 * @transactional
	 */
	function updateCampaign($request) {
		$job = $this->campaignService->updateCampaign($request);
		return $job;
	}
	
	/**
	 * @secured
	 */
	function getAllCampaigns($request) {
		$jobs = $this->campaignService->getAllCampaigns($request);
		return $jobs;
	}

	/**
	 * @secured
	 */
	function getCampaign($request) {
		return $this->campaignService->getCampaign($_GET["record_id"]);
	}

	/**
	 * @secured
	 * @transactional
	 */
	function closeCampaign($request) {
		return $this->campaignService->closeCampaign($request->campaign_id);
	}
}
?>