<?php
class CampaignService {
	
	private $campaignDao;
	private $leadDao;
	function __construct() {
		$this->campaignDao = new CampaignDao();
		$this->leadDao = new LeadDao();
	}
	
	function createCampaign($campaign) {
		
		if (empty($campaign)) throw new ValidationException('Campaign cannot be empty.');
		
		$campaign = Util::addDefaultObjecKeys($campaign, array("company_id", "status"));
		$campaign->company_id = MarketingUtil::getCompanyId($campaign);
		$campaign->status = CampaignStatus::CREATED;
		$campaign = $this->campaignDao->createCampaign($campaign);
		return $campaign;
	}

	function updateCampaign($campaign) {
		
		if (empty($campaign)) throw new ValidationException('Campaign cannot be empty.');
		if (empty($campaign->id)) throw new ValidationException('Campaign Id cannot be empty.');
		$campaign = Util::addDefaultObjecKeys($campaign);
		$campaign = $this->campaignDao->updateCampaign($campaign);
		return $campaign;
	}
	
	function getAllCampaigns($filter) {
		return $this->campaignDao->getAllCampaigns($filter, MarketingUtil::getCompanyId());
	}

	function getCampaign($campaignId) {
		
		if (empty($campaignId)) new ValidationException('Campaign Id cannot be empty.');
		$campaign = $this->campaignDao->getCampaign($campaignId);
		$campaign = Util::addDefaultObjecKeys($campaign, array("leads"));
		$campaign->leads = $this->leadDao->getLeadsByCampaignId($campaignId, MarketingUtil::getCompanyId($campaign));
		return $campaign;
	}

	function closeCampaign($campaignId) {
		
		if (empty($campaignId)) new ValidationException('Campaign Id cannot be empty.');
		$campaign = $this->campaignDao->getCampaign($campaignId);
		if (CampaignStatus::IN_PROGRESS != $campaign->status && CampaignStatus::CREATED != $campaign->status) {
			throw new ValidationException("Campaign should be created or Inprogres status");
		}
		
		$campaign = Util::addDefaultObjecKeys($campaign);
		$campaign->status = CampaignStatus::CLOSED;
		$this->campaignDao->closeCampaign($campaign);
		return $campaign;
	}
}
?>