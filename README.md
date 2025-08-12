# TriX - A PvP Game Staking Platform

TriX is a full-stack, blockchain-based incentive and reward distribution system built on an Ethereum-like network. It allows two players to stake tokens in a trustless manner, with the total pot being automatically and securely transferred to the winner of the match.

---

## Features

-   **Smart Contracts**: Secure Solidity contracts for tokenomics and game logic.
-   **On-Chain Escrow**: Player stakes are held securely in the `PlayGame` contract until a winner is declared.
-   **Operator-Controlled Logic**: A trusted backend server manages match creation and result submission, preventing cheating.
-   **Full-Stack Implementation**: Includes smart contracts, a Node.js backend API, and a simple web-based operator panel.
-   **Testable Workflow**: A Hardhat script is included to simulate the full match lifecycle from start to finish.

---

## Tech Stack

-   **Blockchain**: Solidity, Hardhat, Ethers.js
-   **Backend**: Node.js, Express.js
-   **Frontend**: HTML, CSS, JavaScript (Vanilla)

---

## Project Structure

```
trix-pvp-project/
├── api/          # Node.js backend server (the "operator")
├── contracts/    # Hardhat project with all Solidity smart contracts
├── web/          # Simple HTML/JS frontend (the operator panel)
└── README.md
```

---

## Getting Started: How to Run Locally

Follow these steps to set up and run the entire project on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later)
-   [Git](https://git-scm.com/)

### 1. Clone & Install

First, clone the repository and install all the necessary dependencies in both the `contracts` and `api` folders.

```bash
# Clone the repository
git clone <your-repo-url>
cd trix-pvp-project

# Install dependencies for the smart contracts
cd contracts
npm install

# Install dependencies for the backend API
cd ../api
npm install
```

### 2. Run the Local Blockchain

You need a local blockchain node running. Open a **new terminal** (Terminal 1) and navigate to the `contracts` directory.

```bash
# In Terminal 1
cd contracts
npx hardhat node
```
Keep this terminal running. It will provide you with test accounts and their private keys.

### 3. Deploy Smart Contracts

Open a **second terminal** (Terminal 2), navigate to the `contracts` directory, and deploy the contracts to your local node.

```bash
# In Terminal 2
cd contracts
npx hardhat ignition deploy ./ignition/modules/DeployAll.js --network localhost
```
After this command finishes, it will print the deployed contract addresses.

### 4. Configure and Run the Backend API

1.  Copy the deployed `PlayGame` contract address from the previous step.
2.  In the `api/` folder, rename `.env.example` to `.env`.
3.  Open the `.env` file and fill in the values:
    -   `RPC_URL`: Should be `http://127.0.0.1:8545/`.
    -   `PRIVATE_KEY`: Copy the private key for "Account #0" from the Hardhat node terminal (Terminal 1).
    -   `PLAYGAME_CONTRACT_ADDRESS`: Paste the new address you copied.
4.  Open a **third terminal** (Terminal 3), navigate to the `api` directory, and start the server.

```bash
# In Terminal 3
cd api
node index.js
```
Your backend API is now running on `http://localhost:3000`.

### 5. Use the Operator Panel

Open the `web/index.html` file in your web browser. You can use this simple panel to call the `createMatch` and `commitResult` functions via your backend API.

### 6. Run the Full-Flow Test Script

To simulate an entire match from start to finish (including minting tokens, approving, and staking), run the test script.

> **Note**: Make sure to update the contract addresses inside `contracts/scripts/full_match_test.js` with your latest deployed addresses first.

```bash
# In Terminal 2 (or another new terminal)
cd contracts
npx hardhat run scripts/full_match_test.js --network localhost
```
