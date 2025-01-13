# Charity dApp: A Blockchain-Based Decentralized Charity Platform  

**Charity dApp** is a decentralized application developed as a university project. It is built on the Ethereum blockchain (Sepolia testnet).

**[Live Demo](https://frolicking-boba-0ea878.netlify.app/)**

---

## Project Overview  

This project demonstrates how blockchain technology can be applied to solve real-world problems, such as the lack of transparency in charitable giving. The platform is designed with a focus on security, transparency, and ease of use, making it an excellent case study for the practical applications of decentralized technologies. The emphasis was put on the blockchain backend and communication between frontend and blockchain, design was made as simple as possible.

---

## Key Features  

### Transparent Campaign Management  
- **Admins** can create campaigns with:  
  - A title and detailed description.  
  - A recipient address and a clear funding goal.  
  - Real-time tracking of contributions.  
  - Automatic completion when the goal is reached.  

### Secure and Verified Donations  
- Users can donate ETH to campaigns, with all transactions securely recorded on the blockchain.  
- Contributions are transparently tracked, ensuring trust and accountability.  

### Controlled Fund Release  
- Funds are only released to the designated recipient once the campaign goal is met.  
- Prevents misuse of funds and enhances donor confidence.  

### User Roles and Permissions  
- **Admins** can:  
  - Create and manage campaigns.  
  - Add or remove other admins.  
  - Release funds to campaign recipients.  
- **Donors** can:  
  - Contribute to campaigns.  
  - View their donation history and campaign progress.  

### Event-Driven Updates  
- The platform emits events for key actions, such as:  
  - Campaign creation.  
  - Donations received.  
  - Goals achieved.  
  - Funds released.  

---

## Technical Highlights  

This project incorporates advanced concepts in blockchain development and smart contract programming:  

### Smart Contract Design  
- **Structs and Mappings**: Efficient storage and management of campaign and donor data.  
- **Access Control**: Role-based permissions to ensure secure and controlled operations.  
- **Custom Modifiers**: Validations for input integrity, including donation amounts, valid addresses, and campaign existence.  

### Security Features  
- **Reentrancy Protection**: Leveraging OpenZeppelin’s `ReentrancyGuard` to prevent reentrancy attacks and ensure secure fund transfers.  
- **Input Validations**: Safeguards to prevent invalid or malicious operations.  

### Event-Driven Architecture  
- Emission of events like `CampaignCreated`, `DonationReceived`, `goalMet`, and `FundsReleased` enables real-time updates for donors and administrators.  

### Ethereum Integration  
- Built for the Ethereum blockchain, using the Sepolia testnet for development and testing.  
- Compatible with Ethers.js and MetaMask for seamless interaction.  

---

## How It Works  

1. **Admins** create campaigns with a title, description, recipient address, and funding goal.  
2. **Donors** contribute ETH to active campaigns via the dApp.  
3. Once the campaign goal is achieved, **admins** can release the funds to the recipient.  
4. Donors can track their contributions, while events keep users updated on campaign progress.  

---

## Learning Outcomes  

This project provided a hands-on experience with:  
- Blockchain fundamentals and Ethereum smart contract development.  
- Implementing secure, efficient, and transparent solutions using Solidity.  
- Building decentralized systems with real-world use cases.  
- Working with tools like Hardhat, Remix, MetaMask, and OpenZeppelin.  

The experience highlights the power of blockchain in creating solutions that prioritize security, transparency, and efficiency.  

--- 

The **Charity dApp** was created as part of a university project to showcase the potential of blockchain technology in developing secure, transparent, and decentralized applications. It reflects a deep understanding of blockchain fundamentals, smart contract development, and real-world problem-solving through technology.  

Feel free to explore the repository, review the code, and reach out with feedback or suggestions!  
