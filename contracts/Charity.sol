// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Charity{

     struct Campaign {
        string title;
        string description;
        address recipient;
        uint256 goal;
        uint256 totalDonated;
        uint256 creationTime;
        address[] donors;
        mapping(address => uint256) donations;
        bool isCompleted;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(address => bool) public isAdmin;
    uint256 public campaignCount = 1;

    constructor() {
        isAdmin[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin can perform this action");
        _;
    }

    modifier validDonation(uint256 amount) {
        require(amount > 0, "Donation must be greater than zero");
        _;
    }

    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId < campaignCount, "Campaign with this ID does not exist!");
        _;
    }

    event CampaignCreated(uint256 indexed campaignId, string title, uint256 goal, address recipient);
    event DonationReceived(uint256 indexed campaignId, address donor, uint256 amount);
    event FundsReleased(uint256 indexed campaignId, address recipient, uint256 total);

    function createCampaign(
        string memory _title,
        string memory _description,
        address _recipient,
        uint256 _goal
    ) public onlyAdmin {
        require(bytes(_title).length != 0, "Invalid title!");
        require(_recipient != address(0), "Invalid address!");
        require(_goal > 0, "Goal must be a positive value!");

        Campaign storage newCampaign = campaigns[campaignCount];
        newCampaign.creationTime = block.timestamp;
        newCampaign.description = _description;
        newCampaign.goal = _goal;
        newCampaign.isCompleted = false;
        newCampaign.recipient = _recipient;
        newCampaign.title = _title;

        emit CampaignCreated(campaignCount, _title, _goal, _recipient);

        campaignCount++;
    }

    function getCampaign(uint256 _id) public view campaignExists(_id) returns(
        string memory title,
        string memory description,
        address recipient,
        uint256 goal,
        uint256 totalDonated,
        uint256 creationTime,
        bool isCompleted
    ) {
        Campaign storage c = campaigns[_id];
        return (
            c.title,
            c.description,
            c.recipient,
            c.goal,
            c.totalDonated,
            c.creationTime,
            c.isCompleted
        );
    }

    function donate(uint256 _campaignId) public payable validDonation(msg.value) campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];

        require(campaign.isCompleted == false, "Campaign is completed!");

        if(campaign.donations[msg.sender] == 0) {
            campaign.donors.push(msg.sender);
        }

        campaign.totalDonated += msg.value;
        campaign.donations[msg.sender] += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value);

        if(campaign.totalDonated >= campaign.goal) {
            releaseFunds(_campaignId);
        }
    }

    function releaseFunds(uint256 _campaignId) internal campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];

        require(campaign.totalDonated > 0, "There is nothing to release!");
        require(campaign.isCompleted == true, "Campaign is not completed yet!");

        campaign.isCompleted == true;
        
        payable(campaign.recipient).transfer(campaign.totalDonated);

        emit FundsReleased(_campaignId, campaign.recipient, campaign.totalDonated);
    }
}