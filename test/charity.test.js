const { ethers } = require("hardhat"); // Use ethers from Hardhat for compatibility
const { expect } = require("chai");

let charity;
let owner;
let admin;
let nonAdmin;

beforeEach(async () => {
    [owner, admin, nonAdmin] = await ethers.getSigners();
    const Charity = await ethers.getContractFactory("Charity");
    charity = await Charity.deploy(); // Use deploy() instead of deployContract()
    await charity.waitForDeployment(); // Wait for deployment

    if (!(await charity.isAdmin(admin.address))) {
        await charity.addAdmin(admin.address);
    }
});

describe("Campaign creation", function () {
    it("Should create a campaign", async function () {
        const title = "Test Campaign";
        const description = "This is a test campaign.";
        const recipient = owner.address;
        const goal = ethers.parseEther("100"); // Updated for ethers v6

        await charity.createCampaign(title, description, recipient, goal);

        const campaign = await charity.getCampaign(0); // Fetch campaign details as a struct
        expect(campaign.title).to.equal(title);
        expect(campaign.description).to.equal(description);
        expect(campaign.recipient).to.equal(recipient);
        expect(campaign.goal).to.equal(goal);
        expect(campaign.totalDonated).to.equal(0);
        expect(campaign.isCompleted).to.be.false;
    });
});

describe("Donation", function () {
    it("Should allow donation to a campaign", async function () {
        const title = "Test Campaign";
        const description = "This is a test campaign.";
        const recipient = owner.address;
        const goal = ethers.parseEther("100");

        await charity.createCampaign(title, description, recipient, goal);

        const amount = ethers.parseEther("50");
        await charity.donate(0, { value: amount });

        const campaign = await charity.getCampaign(0);
        expect(campaign.totalDonated).to.equal(amount);

        const donationAmount = await charity.getDonationAmountByDonor(0, owner.address);
        expect(donationAmount).to.equal(amount);
    });
});

it("Should release funds when goal is met", async function () {
    const [owner, donor, recipient] = await ethers.getSigners();

    const title = "Test Campaign";
    const description = "This is a test campaign.";
    const goal = ethers.parseEther("50");

    await charity.connect(owner).createCampaign(title, description, recipient.address, goal);

    const amount = ethers.parseEther("50");
    await charity.connect(donor).donate(0, { value: amount });

    // Check campaign state before releasing funds
    const campaignBefore = await charity.getCampaign(0);
    expect(campaignBefore.totalDonated).to.equal(amount);
    expect(campaignBefore.isCompleted).to.be.false;

    // Get recipient's balance before releasing funds
    const recipientBalanceBefore = await ethers.provider.getBalance(recipient.address);
    const balanceBefore = BigInt(recipientBalanceBefore);

    // Release funds
    await charity.connect(owner).releaseFunds(0);

    // Check campaign state after releasing funds
    const campaignAfter = await charity.getCampaign(0);
    expect(campaignAfter.isCompleted).to.be.true;
    expect(campaignAfter.totalDonated).to.equal(amount); // totalDonated remains the same

    // Get recipient's balance after releasing funds
    const recipientBalanceAfter = await ethers.provider.getBalance(recipient.address);
    const balanceAfter = BigInt(recipientBalanceAfter);

    // Calculate the difference
    const balanceDifference = balanceAfter - balanceBefore;

    // Ensure the recipient received the correct amount
    expect(balanceDifference.toString()).to.equal(amount.toString());
});

describe("Campaign cancellation", function () {
    it("Should cancel a campaign", async function () {
        const title = "Test Campaign";
        const description = "This is a test campaign.";
        const recipient = owner.address;
        const goal = ethers.parseEther("100");

        await charity.createCampaign(title, description, recipient, goal);

        await charity.cancelCampaign(0);

        const campaign = await charity.getCampaign(0);
        expect(campaign.isCompleted).to.be.true;
    });
});

describe("Admin management", function () {
    it("Should add and remove admin", async function () {
      // Check if the admin is already an admin
      const isAlreadyAdmin = await charity.isAdmin(admin.address);
      if (!isAlreadyAdmin) {
        await charity.addAdmin(admin.address); // Add admin only if not already added
      }
  
      let isAdmin = await charity.isAdmin(admin.address);
      expect(isAdmin).to.be.true;
  
      await charity.removeAdmin(admin.address);
  
      const isAdminAfterRemoval = await charity.isAdmin(admin.address);
      expect(isAdminAfterRemoval).to.be.false;
    });
  });
