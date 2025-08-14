const cors = require('cors');
const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config(); // Loads the .env file

const app = express();
app.use(express.json());
app.use(cors()); 

const PORT = 3000;
const rpcUrl = process.env.RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const playGameAddress = process.env.PLAYGAME_CONTRACT_ADDRESS;
// const playGameABI = require('./PlayGameABI.json');
const playGameABI = require('../contracts/artifacts/contracts/PlayGame.sol/PlayGame.json').abi;

// --- ETHERS CONNECTION ---
// The Provider is our read-only connection to the blockchain.
const provider = new ethers.JsonRpcProvider(rpcUrl);
// The Signer is our wallet, capable of sending transactions (writing to the blockchain).
const signer = new ethers.Wallet(privateKey, provider);
// The Contract instance is our main tool to interact with PlayGame.sol.
const playGameContract = new ethers.Contract(playGameAddress, playGameABI, signer);

console.log("Backend operator address:", signer.address);
console.log("Connected to PlayGame contract at:", playGameAddress);


// --- API ENDPOINTS ---

// Endpoint to create a new match
app.post('/match/create', async (req, res) => {
    try {
        const { matchId, player1, player2, stake } = req.body;
        
        // Convert stake to the correct format (e.g., "1" -> 1000000000000000000)
        const stakeAmount = ethers.parseEther(stake.toString());
        // Use a random hash for the matchId for now
        const matchIdBytes32 = ethers.id(matchId); 

        console.log(`Creating match ${matchId} for ${player1} and ${player2} with stake ${stakeAmount}`);
        
        const tx = await playGameContract.createMatch(matchIdBytes32, player1, player2, stakeAmount);
        await tx.wait(); // Wait for the transaction to be mined

        res.status(200).json({ success: true, message: `Match ${matchId} created successfully!`, txHash: tx.hash });
    } catch (error) {
        console.error("Error creating match:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// Endpoint to commit the result of a match
app.post('/match/result', async (req, res) => {
    try {
        const { matchId, winner } = req.body;
        const matchIdBytes32 = ethers.id(matchId);

        console.log(`Submitting winner ${winner} for match ${matchId}`);
        
        const tx = await playGameContract.commitResult(matchIdBytes32, winner);
        await tx.wait(); // Wait for the transaction to be mined

        res.status(200).json({ success: true, message: `Result for ${matchId} submitted! Winner is ${winner}.`, txHash: tx.hash });
    } catch (error) {
        console.error("Error submitting result:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`API server is running on http://localhost:${PORT}`);
});