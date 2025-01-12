import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
import { abi } from "./abi.js";

const provider = new ethers.BrowserProvider(window.ethereum)
const contractAddress = "0x6263CD997403dBCC6A457b9594601947eb3F6Acd";
let signer;
let contract;

async function initContract() {
  if (!contract) {
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);
    await setupEventListeners();
  }
}

async function setupEventListeners() {
  contract.on("CampaignCreated", (campaignId, title, goal, recipient, event) => {
    console.log(`Campaign Created: ID ${campaignId}, Title ${title}, Goal ${ethers.formatEther(goal)}, Recipient ${recipient}`);
    alert(`New campaign created: ${title}`);
  });

  // contract.on("DonationReceived", (campaignId, donor, amount, event) => {
  //   console.log(`Donation Received: Campaign ${campaignId}, Donor ${donor}, Amount ${ethers.formatEther(amount)}`);
  //   alert(`Donation received for campaign ${campaignId} from ${donor}: ${ethers.formatEther(amount)} ETH`);
  // });

  contract.on("FundsReleased", (campaignId, recipient, total, event) => {
    console.log(`Funds Released: Campaign ${campaignId}, Recipient ${recipient}, Total ${ethers.formatEther(total)}`);
    alert(`Funds released for campaign ${campaignId}: ${ethers.formatEther(total)} ETH to ${recipient}`);
  });

  contract.on("CampaignCanceled", (campaignId, event) => {
    console.log(`Campaign Canceled: ID ${campaignId}`);
    alert(`Campaign ${campaignId} has been canceled.`);
  });

  // contract.on("goalMet", (campaignId, event) => {
  //   console.log(`Goal Met: Campaign ${campaignId}`);
  //   alert(`Campaign ${campaignId} has reached its goal!`);
  // });
}

async function checkMetaMask() {
    if (typeof window.ethereum === 'undefined') {
      alert('Please set up MetaMask first.');
      return false;
    }
    return true;
  }
  
  // Connect to MetaMask and fetch user account
  async function connectMetaMask() {
    if (await checkMetaMask()) {
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        localStorage.setItem('userAddress', account);
        alert(`Connected as ${account}`);
        window.location.href = "landing.html";
      } catch (error) {
        console.error('MetaMask connection failed:', error);
      }
    }
  }
  
  // Logout user and clear session data
  function logout() {
    localStorage.removeItem('userAddress');
    alert('You have been logged out.');
    window.location.href = "index.html";
  }

  window.viewCampaign = function(index) {
    localStorage.setItem('selectedCampaignId', index);
    window.location.href = "campaign.html";
}
  
  // Display user address and balance
  async function displayUserDetails() {
    const userAddress = localStorage.getItem('userAddress');
    if (!userAddress) {
      alert('User not logged in.');
      window.location.href = "index.html";
      return;
    }
    document.getElementById('user-address').textContent = userAddress;
  
    const balance = await ethereum.request({
      method: 'eth_getBalance',
      params: [userAddress, 'latest'],
    });
    const balanceInEth = ethers.formatEther(balance);
    document.getElementById('balance').textContent = balanceInEth;
  
    const usdEquivalent = (balanceInEth * 2000).toFixed(2);
    document.getElementById('usd-equivalent').textContent = usdEquivalent + ' USD';
  }
  
  async function loadCampaigns() {
    try {
        if (!contract) {
            await initContract();
        }
        const campaignCount = await contract.getCampaignCount();
        const campaigns = [];
        
        for (let i = 0; i < campaignCount; i++) {
            const campaign = await contract.getCampaign(i);
            campaigns.push(campaign);
        }

        const campaignListings = document.getElementById('campaign-listings');
        campaignListings.innerHTML = '';
        
        campaigns.forEach((campaign, index) => {
            const card = document.createElement('div');
            card.classList.add('campaign-card');
            card.innerHTML = `
                <h3>${campaign.title}</h3>
                <p>Goal: ${ethers.formatEther(campaign.goal)}</p>
                <button onclick="viewCampaign(${index})">View Details</button>
            `;
            campaignListings.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading campaigns:', error);
    }
  }

  async function fetchDonorHistory(campaignId) {
    try {
      const donors = await contract.getDonors(campaignId);
      const donorHistoryTable = document.getElementById('donor-history');
      donorHistoryTable.innerHTML = ''; // Clear existing rows
  
      if (donors.length === 0) {
        donorHistoryTable.innerHTML = '<tr><td colspan="3">No donations yet.</td></tr>';
      } else {
        for (const donor of donors) {
          const amount = await contract.getDonationAmountByDonor(campaignId, donor);
          const formattedAmount = ethers.formatEther(amount);
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${donor}</td>
            <td>${formattedAmount} ETH</td>
            <td>N/A</td> <!-- Donation date is not available -->
          `;
          donorHistoryTable.appendChild(row);
        }
      }
    } catch (error) {
      console.error('Error fetching donor history:', error);
      alert('Failed to load donor history. Please try again later.');
    }
  }
  
  async function loadCampaignDetails() {
    try {
      if (!contract) {
        await initContract();
      }
      
      const campaignId = localStorage.getItem('selectedCampaignId');
      if (!campaignId) {
        alert('No campaign selected.');
        window.location.href = "campaigns.html"; 
        return;
      }
  
      const campaign = await contract.getCampaign(campaignId);
      const [title, description, recipient, goal, totalDonated, creationTime, isCompleted, creator] = campaign;
  
      document.getElementById('campaign-name').textContent = title;
      document.getElementById('campaign-description').textContent = description;
      document.getElementById('campaign-recipient').textContent = recipient;
      document.getElementById('campaign-goal').textContent = `${ethers.formatEther(goal)}`;
      document.getElementById('campaign-progress').textContent = `${ethers.formatEther(totalDonated)}`;
      document.getElementById('campaign-status').textContent = isCompleted ? 'Completed' : 'Ongoing';
      document.getElementById('campaign-created').textContent = new Date(Number(creationTime) * 1000).toLocaleString();
  
      const isAdmin = await checkAdminStatus();
  
      const cancelButton = document.getElementById('cancel-campaign-button');
      const releaseButton = document.getElementById('release-funds-button');
  
      if (isAdmin) {
        cancelButton.style.display = 'block';
        releaseButton.style.display = 'block';
      }
  
      await fetchDonorHistory(campaignId);
    } catch (error) {
      console.error("Error loading campaign details:", error);
    }
  }

  async function cancelCampaign() {
    try {
      const campaignId = localStorage.getItem('selectedCampaignId');
      if (!campaignId) {
        alert('No campaign selected.');
        return;
      }
      const tx = await contract.cancelCampaign(campaignId);
      await tx.wait();
      alert('Campaign canceled successfully!');
      window.location.href = "campaigns.html";
    } catch (error) {
      alert(error.message);
      console.error('Error canceling campaign:', error);
    }
  }
  
  async function releaseFunds() {
    try {
      const campaignId = localStorage.getItem('selectedCampaignId');
      if (!campaignId) {
        alert('No campaign selected.');
        return;
      }
      const tx = await contract.releaseFunds(campaignId);
      await tx.wait();
      alert('Funds released successfully!');
      window.location.href = "campaigns.html";
    } catch (error) {
      alert(error.message);
      console.error('Error releasing funds:', error);
    }
  }

  async function createCampaign() {
    const name = document.getElementById('campaign-title').value;
    const description = document.getElementById('campaign-description').value;
    const recipient = document.getElementById('campaign-recipient').value;
    const goal = parseFloat(document.getElementById('campaign-goal').value);
    if (!name || !description || !recipient || isNaN(goal) || goal <= 0) {
      alert('Please enter valid campaign details.');
      return;
    }
  
    const userAddress = localStorage.getItem('userAddress');
    if (!userAddress) {
      alert('User not logged in.');
      return;
    }
  
    try {
      const tx = await contract.createCampaign(name, description, recipient, ethers.parseEther(goal.toString()));
      await tx.wait();
      window.location.href = "campaigns.html";
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  }
  
  async function donate() {
    const amount = parseFloat(document.getElementById('donation-amount').value);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }
  
    const userAddress = localStorage.getItem('userAddress');
    if (!userAddress) {
      alert('User not logged in.');
      return;
    }
    
    try {
      const tx = await contract.donate(localStorage.getItem('selectedCampaignId'), { value: ethers.parseEther(amount.toString()) });
      await tx.wait();
      alert(`Thank you for donating ${amount} ETH!`);
      window.location.href = "campaigns.html";
    } catch (error) {
      alert(error.message);
      console.error('Error donating:', error);
    }
  }

  async function checkAdminStatus() {
    const userAddress = localStorage.getItem('userAddress');
    if (!userAddress) {
      alert('User not logged in.');
      return false;
    }
    try {
      if (!contract) {
        await initContract();
      }
      const isAdmin = await contract.isAdminStatus(userAddress);
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  async function addAdmin() {
    try {
      const adminAddress = document.getElementById('admin-address').value;
      if (!ethers.isAddress(adminAddress)) {
        alert('Invalid admin address.');
        return;
      }
  
      if (!contract) {
        await initContract();
      }
  
      const tx = await contract.addAdmin(adminAddress);
      await tx.wait();
      alert('Admin added successfully!');
      document.getElementById('admin-address').value = '';
    } catch (error) {
      alert(error.message);
      console.error('Error adding admin:', error);
    }
  }
  
  async function removeAdmin() {
    try {
      const adminAddress = document.getElementById('admin-address').value;
      if (!ethers.isAddress(adminAddress)) {
        alert('Invalid admin address.');
        return;
      }
  
      if (!contract) {
        await initContract();
      }
  
      const tx = await contract.removeAdmin(adminAddress);
      await tx.wait();
      alert('Admin removed successfully!');
      document.getElementById('admin-address').value = '';
    } catch (error) {
      alert(error.message);
      console.error('Error removing admin:', error);
    }
  }

  async function toggleAdminSection() {
    const isAdmin = await checkAdminStatus();
    const adminButtonSection = document.getElementById('admin-button-section');
    
    if (adminButtonSection) {
      if (isAdmin) {
        adminButtonSection.style.display = 'block'; 
      } else {
        adminButtonSection.style.display = 'none';
      }
    } else {
      console.error('Admin button section not found!');
    }
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    initContract();
    const loginButton = document.getElementById('login-button');
    if (loginButton) loginButton.addEventListener('click', connectMetaMask);
  
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) logoutButton.addEventListener('click', logout);

    const createCampaignButton = document.getElementById('create-campaign-button');
    if (createCampaignButton) {
      createCampaignButton.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent form from reloading the page
      createCampaign();
    });
}
  
    const browseCampaignsButton = document.getElementById('browse-campaigns');
    if (browseCampaignsButton) browseCampaignsButton.addEventListener('click', () => {
      window.location.href = "campaigns.html";
    });
  
    const donateButton = document.getElementById('donate-button');
    if (donateButton) donateButton.addEventListener('click', donate);

    const cancelCampaignButton = document.getElementById('cancel-campaign-button');
    if (cancelCampaignButton) cancelCampaignButton.addEventListener('click', cancelCampaign);
  
    const releaseFundsButton = document.getElementById('release-funds-button');
    if (releaseFundsButton) releaseFundsButton.addEventListener('click', releaseFunds);

    const addAdminButton = document.getElementById('add-admin-button');
    if (addAdminButton) addAdminButton.addEventListener('click', addAdmin);

    const removeAdminButton = document.getElementById('remove-admin-button');
    if (removeAdminButton) removeAdminButton.addEventListener('click', removeAdmin);

    // const backButton = document.getElementById('back-button');
    // if (backButton) backButton.addEventListener('click', () => {
    //   window.history.back();
    // });
  
    if (window.location.pathname.includes('landing.html')) {
      displayUserDetails();
      await toggleAdminSection();
    }
  
    if (window.location.pathname.includes('campaigns.html')) {
      loadCampaigns();
    }
  
    if (window.location.pathname.includes('campaign.html')) {
      loadCampaignDetails();
    }
    
  });
  